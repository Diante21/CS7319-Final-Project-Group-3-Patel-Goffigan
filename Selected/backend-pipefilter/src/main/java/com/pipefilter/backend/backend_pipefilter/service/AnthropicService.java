package com.pipefilter.backend.backend_pipefilter.service;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class AnthropicService {

    private static final Logger logger = LoggerFactory.getLogger(AnthropicService.class);

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;


    private final ObjectMapper objectMapper = new ObjectMapper();

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)   // time to establish TCP connection
            .writeTimeout(30, TimeUnit.SECONDS)     // time to send the request body
            .readTimeout(120, TimeUnit.SECONDS)     // time to receive the full response
            .callTimeout(180, TimeUnit.SECONDS)     // hard cap on the entire call
            .build();

    public EvaluationResult analyze(String resumeContent, String jobDescription) {
        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "claude-opus-4-5",
                    "max_tokens", 1024,
                    "messages", List.of(
                            Map.of("role", "user", "content", buildPrompt(resumeContent, jobDescription))
                    )
            ));

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                    .addHeader("x-api-key", apiKey)
                    .addHeader("anthropic-version", "2023-06-01")
                    .addHeader("content-type", "application/json")
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    logger.error("Anthropic API error: {}", response.code());
                    return fallbackResult();
                }

                String responseBody = response.body().string();
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                String text = jsonNode.path("content").get(0).path("text").asText();

                return parseResult(text);
            }

        } catch (Exception e) {
            logger.error("Error calling Anthropic API: {}", e.getMessage());
            return fallbackResult();
        }
    }

    private String buildPrompt(String resumeContent, String jobDescription) {
        return """
            You are an expert resume reviewer.
            Your job is to Analyze this resume and provide structured feedback by comparing a candidate's resume against
            a specific job description
            You are an expert resume reviewer. Be a tough scorer and provide actionable feedback to help the candidate improve.
            Score is not just based on keywords alone, it should be tailored to the specific job description
            and the quality of the resume content.
            No markdown, no extra text, just raw JSON in this exact format:
     
            {
                       "score": <number 0-100 based on how well the resume matches the job description>,
                       "foundKeywords": "<comma separated keywords from the job description found in the resume>",
                       "missingKeywords": "<comma separated important keywords from the job description missing in the resume>",
                       "feedback": "<numbered list of 5-6 actionable feedback points, each starting with a number and period like: 1. Point one. 2. Point two. Use pipe character | to separate points>"
            }

            Job Description:
            """ + jobDescription + """

            Resume Content:
            """ + resumeContent;
    }

    private EvaluationResult parseResult(String jsonText) {
        try {
            String cleaned = jsonText
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            JsonNode node = objectMapper.readTree(cleaned);
            EvaluationResult result = new EvaluationResult();
            result.setScore(node.path("score").asInt());
            result.setFoundKeywords(node.path("foundKeywords").asText());
            result.setMissingKeywords(node.path("missingKeywords").asText());
            result.setFeedback(node.path("feedback").asText());
            result.setAnalyzedAt(LocalDateTime.now());
            return result;

        } catch (Exception e) {
            logger.error("Error parsing Claude response: {}", e.getMessage());
            return fallbackResult();
        }
    }

    private EvaluationResult fallbackResult() {
        EvaluationResult result = new EvaluationResult();
        result.setScore(0);
        result.setFeedback("Unable to analyze resume at this time. Please try again.");
        result.setFoundKeywords("");
        result.setMissingKeywords("");
        result.setAnalyzedAt(LocalDateTime.now());
        return result;
    }
}
