package com.layered.backend.service;

import com.layered.backend.domain.EvaluationResult;
import com.layered.backend.domain.Resume;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class RuleBasedScoringEngine {

    private static final List<String> KEYWORDS = List.of(
            "java", "spring", "python", "sql", "rest", "api",
            "git", "agile", "docker", "aws", "javascript", "react"
    );

    public EvaluationResult evaluate(Resume resume) {
        String content = resume.getContent().toLowerCase();

        List<String> found = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        // Keyword checker
        for (String keyword : KEYWORDS) {
            if (content.contains(keyword)) {
                found.add(keyword);
            } else {
                missing.add(keyword);
            }
        }

        // Score calculation
        int keywordScore = (int) ((double) found.size() / KEYWORDS.size() * 60);
        int lengthScore = calculateLengthScore(content);
        int formatScore = calculateFormatScore(content);
        int totalScore = Math.min(100, keywordScore + lengthScore + formatScore);

        // Build feedback
        String feedback = buildFeedback(totalScore, found, missing);

        // Build result
        EvaluationResult result = new EvaluationResult();
        result.setScore(totalScore);
        result.setFeedback(feedback);
        result.setFoundKeywords(String.join(", ", found));
        result.setMissingKeywords(String.join(", ", missing));
        result.setAnalyzedAt(LocalDateTime.now());

        return result;
    }

    private int calculateLengthScore(String content) {
        int wordCount = content.split("\\s+").length;
        if (wordCount >= 300) return 20;
        if (wordCount >= 200) return 15;
        if (wordCount >= 100) return 10;
        return 5;
    }

    private int calculateFormatScore(String content) {
        int score = 0;
        if (content.contains("experience")) score += 5;
        if (content.contains("education")) score += 5;
        if (content.contains("skills")) score += 5;
        if (content.contains("projects")) score += 5;
        return score;
    }

    private String buildFeedback(int score, List<String> found, List<String> missing) {
        StringBuilder fb = new StringBuilder();

        if (score >= 80) {
            fb.append("Excellent resume! ");
        } else if (score >= 60) {
            fb.append("Good resume with room for improvement. ");
        } else {
            fb.append("Resume needs significant improvement. ");
        }

        if (!found.isEmpty()) {
            fb.append("Found keywords: ").append(String.join(", ", found)).append(". ");
        }
        if (!missing.isEmpty()) {
            fb.append("Consider adding: ").append(String.join(", ", missing)).append(".");
        }

        return fb.toString();
    }
}
