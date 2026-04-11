package com.layered.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.layered.backend.domain.EvaluationResult;
import jakarta.annotation.PostConstruct;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    // Claude can take 30-60 s for longer prompts; defaults (10 s) are too short.
    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)   // time to establish TCP connection
            .writeTimeout(30, TimeUnit.SECONDS)     // time to send the request body
            .readTimeout(120, TimeUnit.SECONDS)     // time to receive the full response
            .callTimeout(180, TimeUnit.SECONDS)     // hard cap on the entire call
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        logger.info("API Key loaded: {}", apiKey != null ? "YES" : "NO");
    }

    /**
     * Generates AI feedback for a resume based on its content, current score, and keyword analysis.
     * @param resumeContent: The full text content of the resume being analyzed.
     * @return
     */
    public EvaluationResult generateFeedback(String resumeContent) {
        try {


            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "claude-opus-4-5",
                    "max_tokens", 1024,
                    "messages", List.of(
                            Map.of("role", "user", "content", buildPrompt(resumeContent))
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

                String responseBody =  response.body().string();
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                String text = cleanResponse(jsonNode.path("content").get(0).path("text").asText());

                return parseResult(text);
            }

        } catch (Exception e) {
            logger.error("Error calling Anthropic API: {}", e.getMessage());
            return fallbackResult();
        }
    }

    /**
     * Builds a structured prompt for the AI model based on the resume content, current score, and keyword analysis.
     * @param resumeContent: The full text content of the resume being analyzed.
     * @return
     */
    private String buildPrompt(String resumeContent) {
        return String.format("""
            You are an expert resume reviewer. Analyze this resume and provide structured feedback.
            You are an expert resume reviewer. Analyze this resume and return a JSON object only.
            You are an expert resume reviewer. Be a tough scorer and provide actionable feedback to help the candidate improve.
            No markdown, no extra text, just raw JSON in this exact format:
     
            {
                "score": <number 0-100>,
                "foundKeywords": "<comma separated keywords found>",
                "missingKeywords": "<comma separated important missing keywords>",
                "feedback": "<plain text actionable feedback, no markdown>"
            }
            
            Resume Content:
            %s
            """, resumeContent);
    }
    private String cleanResponse(String response) {
        return response
                .replaceAll("\\*\\*", "")      // remove bold **
                .replaceAll("\\*", "")          // remove italic *
                .replaceAll("#+ ", "")          // remove headers #
                .replaceAll("\\n+", " ")        // replace newlines with space
                .replaceAll("---|---", "")      // remove dividers
                .trim();
    }

    /**
     *
     * @param jsonText
     * @return
     */
    private EvaluationResult parseResult(String jsonText) {
        try {
            String cleaned =  jsonText
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



