// Each filter reads from and writes to this single payload object as it moves through the pipeline.

package com.pipefilter.backend.backend_pipefilter.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

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

}
