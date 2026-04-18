package com.pipefilter.backend.backend_pipefilter.filter;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import com.pipefilter.backend.backend_pipefilter.repository.EvaluationResultRepository;
import com.pipefilter.backend.backend_pipefilter.repository.ResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PersistenceFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(PersistenceFilter.class);

    private final ResumeRepository resumeRepository;
    private final EvaluationResultRepository evaluationResultRepository;

    public PersistenceFilter(ResumeRepository resumeRepository,
                             EvaluationResultRepository evaluationResultRepository) {
        this.resumeRepository = resumeRepository;
        this.evaluationResultRepository = evaluationResultRepository;
    }

    @Override
    public ResumePayload process(ResumePayload payload) {
        long start = System.currentTimeMillis();
        logger.info("Running persistenceFilter");

        if (!payload.isValid()) {
            payload.recordTiming("persistence", System.currentTimeMillis() - start);
            return payload;
        }

        Resume savedResume = resumeRepository.save(payload.getResume());

        EvaluationResult result = new EvaluationResult();
        result.setScore(payload.getScore());
        result.setFeedback(payload.getFeedback());
        result.setFoundKeywords(String.join(", ", payload.getFoundKeywords()));
        result.setMissingKeywords(String.join(", ", payload.getMissingKeywords()));
        result.setAnalyzedAt(LocalDateTime.now());
        result.setResume(savedResume);

        evaluationResultRepository.save(result);
        payload.setEvaluationResult(result);

        payload.recordTiming("persistence", System.currentTimeMillis() - start);
        logger.info("PersistenceFilter complete — saved result id: {}, duration: {}ms",
                result.getId(), payload.getFilterTimings().get("persistence"));
        return payload;
    }
}