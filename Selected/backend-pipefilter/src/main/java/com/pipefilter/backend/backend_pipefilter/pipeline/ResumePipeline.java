package com.pipefilter.backend.backend_pipefilter.pipeline;


import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import com.pipefilter.backend.backend_pipefilter.filter.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResumePipeline {

    private static final Logger logger = LoggerFactory.getLogger(ResumePipeline.class);

    private final List<Filter> pipeline;

    public ResumePipeline(ValidationFilter validationFilter,
                          TextExtractionFilter textExtractionFilter,
                          AIScoringFilter aiScoringFilter,
                          PersistenceFilter persistenceFilter) {
        this.pipeline = List.of(
                validationFilter,
                textExtractionFilter,
                aiScoringFilter,
                persistenceFilter
        );
    }

    public ResumePayload execute(Resume resume) {
        logger.info("Starting resume analysis pipeline");

        ResumePayload payload = new ResumePayload();
        payload.setResume(resume);

        for (Filter filter : pipeline) {
            logger.info("Executing filter: {}", filter.getClass().getSimpleName());
            payload = filter.process(payload);

            if (!payload.isValid()) {
                logger.warn("Pipeline stopped at: {} — reason: {}",
                        filter.getClass().getSimpleName(),
                        payload.getValidationMessage());
                return payload;
            }
        }

        logger.info("Pipeline completed successfully — score: {}", payload.getScore());
        return payload;
    }
}