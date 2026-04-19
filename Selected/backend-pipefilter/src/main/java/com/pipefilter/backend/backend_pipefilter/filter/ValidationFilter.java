package com.pipefilter.backend.backend_pipefilter.filter;

import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ValidationFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(ValidationFilter.class);

    @Override
    public ResumePayload process(ResumePayload payload) {
        long start = System.currentTimeMillis();
        logger.info("Running ValidationFilter");
        String content = payload.getResume().getContent();

        if (content == null || content.isBlank()) {
            payload.setValid(false);
            payload.setValidationMessage("Resume content cannot be empty");
            payload.recordTiming("validation", System.currentTimeMillis() - start);
            return payload;
        }

        if (payload.getResume().getJobDescription() == null || payload.getResume().getJobDescription().isBlank()) {
            payload.setValid(false);
            payload.setValidationMessage("Resume job description cannot be empty");
            payload.recordTiming("validation", System.currentTimeMillis() - start);
            return payload;
        }

        payload.setValid(true);
        payload.setValidationMessage("Validation passed.");
        payload.recordTiming("validation", System.currentTimeMillis() - start);
        logger.info("Resume validated. Duration: {}ms", payload.getFilterTimings().get("validation"));
        return payload;
    }
}