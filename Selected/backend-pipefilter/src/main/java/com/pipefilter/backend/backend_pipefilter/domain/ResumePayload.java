// Each filter reads from and writes to this single payload object as it moves through the pipeline.

package com.pipefilter.backend.backend_pipefilter.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumePayload {

    // Input data
    private Resume resume;

    // Set by TextExtractionFilter
    private String cleanedContent;

    // Set by KeywordAnalysisFilter
    private List<String> foundKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();

    // Set by AIScoringFilter
    private int score;
    private String feedback;

    // Set by ValidationFilter
    private boolean valid;
    private String validationMessage;

    // Final result set by PersistenceFilter
    private EvaluationResult evaluationResult;

    // Per-filter timing data (milliseconds) — not persisted to DB
    private Map<String, Long> filterTimings = new LinkedHashMap<>();

    // Helper method to record filter timing
    public void recordTiming(String filterName, long durationMs) {
        this.filterTimings.put(filterName, durationMs);
    }

}