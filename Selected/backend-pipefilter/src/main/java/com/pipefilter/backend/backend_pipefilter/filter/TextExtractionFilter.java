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
        long start = System.currentTimeMillis();
        logger.debug("Running TextExtractionFilter");

        if (!payload.isValid()) {
            logger.warn("Skipping TextExtractionFilter due to validation failure: " + payload.getValidationMessage());
            payload.recordTiming("textExtraction", System.currentTimeMillis() - start);
            return payload;
        }

        String content = payload.getResume().getContent();

        String cleaned = content
                .toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        payload.setCleanedContent(cleaned);
        payload.recordTiming("textExtraction", System.currentTimeMillis() - start);
        logger.info("TextExtractionFilter completed. Duration: {}ms", payload.getFilterTimings().get("textExtraction"));
        return payload;
    }
}