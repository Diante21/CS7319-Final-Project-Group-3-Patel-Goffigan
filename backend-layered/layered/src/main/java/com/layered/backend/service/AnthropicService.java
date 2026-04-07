package com.layered.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
     * @param score: The current score assigned to the resume by the rule-based engine (0-100).
     * @param foundKeywords: A list of keywords that were found in the resume and contributed to the score.
     * @param missingKeywords: A list of important keywords that were not found
     *                       in the resume and could improve the score if included.
     * @return
     */
    public String generateFeedback(String resumeContent, int score,
                                   List<String> foundKeywords, List<String> missingKeywords) {
        try {
            String prompt = buildPrompt(resumeContent, score, foundKeywords, missingKeywords);

            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", "claude-opus-4-5",
                    "max_tokens", 1024,
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
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
                    return "Unable to generate AI feedback at this time.";
                }

                String responseBody = response.body().string();
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                return jsonNode.path("content").get(0).path("text").asText();
            }

        } catch (Exception e) {
            logger.error("Error calling Anthropic API: {}", e.getMessage());
            return "Unable to generate AI feedback at this time.";
        }
    }

    /**
     * Builds a structured prompt for the AI model based on the resume content, current score, and keyword analysis.
     * @param resumeContent: The full text content of the resume being analyzed.
     * @param score: The current score assigned to the resume by the rule-based engine (0-100).
     * @param foundKeywords: A list of keywords that were found in the resume and contributed to the score.
     * @param missingKeywords: A list of important keywords that were not found
     *                       in the resume and could improve the score if included.
     * @return
     */
    private String buildPrompt(String resumeContent, int score,
                               List<String> foundKeywords, List<String> missingKeywords) {
        return String.format("""
            You are an expert resume reviewer. Analyze this resume and provide structured feedback.
            
            Resume Content:
            %s
            
            Current Score: %d/100
            Found Keywords: %s
            Missing Keywords: %s
            
            Please provide:
            1. A brief overall assessment
            2. Top 3 strengths
            3. Top 3 areas for improvement
            4. Specific suggestions to improve the score
            
            Keep feedback concise, actionable, and encouraging. 
            But also be a tough grader. 
            Try to make your response between 150 - 200 words.
            """,
                resumeContent, score,
                String.join(", ", foundKeywords),
                String.join(", ", missingKeywords)
        );
    }
}



