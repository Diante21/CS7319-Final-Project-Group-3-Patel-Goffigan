package com.pipefilter.backend.backend_pipefilter.filter;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import com.pipefilter.backend.backend_pipefilter.service.AnthropicService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AIScoringFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(AIScoringFilter.class);

    private final AnthropicService anthropicService;

    public AIScoringFilter(AnthropicService anthropicService) {
        this.anthropicService = anthropicService;
    }

    @Override
    public ResumePayload process(ResumePayload payload) {
        logger.info("Running AIScoringFilter");

        if (!payload.isValid()) {
            return payload;
        }

        EvaluationResult result = anthropicService.analyze(
                payload.getCleanedContent(),
                payload.getResume().getJobDescription()
        );

        payload.setScore(result.getScore());
        payload.setFeedback(result.getFeedback());
        payload.setFoundKeywords(result.getFoundKeywords() != null ?
                List.of(result.getFoundKeywords().split(", ")) : new ArrayList<>());
        payload.setMissingKeywords(result.getMissingKeywords() != null ?
                List.of(result.getMissingKeywords().split(", ")) : new ArrayList<>());

        logger.info("AIScoringFilter complete — score: {}", result.getScore());
        return payload;
    }
}
