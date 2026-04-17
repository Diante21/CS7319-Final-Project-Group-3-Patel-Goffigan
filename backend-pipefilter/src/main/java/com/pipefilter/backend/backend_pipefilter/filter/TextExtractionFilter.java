package com.pipefilter.backend.backend_pipefilter.filter;

import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TextExtractionFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(TextExtractionFilter.class);

    @Override
    public ResumePayload process(ResumePayload payload){
        logger.debug("Running TextExtractionFilter");

        if (!payload.isValid()) {
            logger.warn("Skipping TextExtractionFilter due to validation failure: " + payload.getValidationMessage());
            return payload;
        }

        String content = payload.getResume().getContent();

        String cleaned = content
                .toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();


        payload.setCleanedContent(cleaned);
        logger.info("TextExtractionFilter completed.");
        return payload;

    }
}
