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
        return anthropicService.generateFeedback(resume.getContent(), resume.getJobDescription());
    }

}
