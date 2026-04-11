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

    private final AnthropicService anthropicService;


    public RuleBasedScoringEngine(AnthropicService anthropicService) {
        this.anthropicService = anthropicService;
    }

    /**
     * Evaluates the resume based on keyword presence, length, and format.
     * @param resume: The resume object containing the content to be evaluated.
     * @return An EvaluationResult object containing the score, feedback, and keyword analysis.
     */
    public EvaluationResult evaluate(Resume resume) {
        return anthropicService.generateFeedback(resume.getContent());
    }

    /**
     * Calculates a score based on the length of the resume content.
     * @param content: The full text content of the resume.
     * @return An integer score (0-20) based on the word count of the resume.
     */
    private int calculateLengthScore(String content) {
        int wordCount = content.split("\\s+").length;
        if (wordCount >= 600) return 20;
        if (wordCount >= 400) return 15;
        if (wordCount >= 100) return 10;
        return 5;
    }

    /**
     * Calculates a score based on the presence of common resume sections (experience, education, skills, projects).
     * @param content: The full text content of the resume.
     * @return An integer score (0-20) based on the presence of
     *          key resume sections, with 5 points for each section found.
     */
    private int calculateFormatScore(String content) {
        int score = 0;
        if (content.contains("experience")) score += 5;
        if (content.contains("education")) score += 5;
        if (content.contains("skills")) score += 5;
        if (content.contains("projects")) score += 5;
        return score;
    }


}
