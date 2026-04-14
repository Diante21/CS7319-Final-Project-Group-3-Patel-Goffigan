package com.layered.backend.Controller;

import com.layered.backend.domain.EvaluationResult;
import com.layered.backend.domain.Resume;
import com.layered.backend.repository.EvaluationResultRepository;
import com.layered.backend.service.IResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * REST controller that handles HTTP requests for resume analysis.
 *  Base path: {@code /api/resume}
 *  CORS is allowed from the React dev server at {@code http://localhost:3000}.
 *  Dependencies injected via constructor:
 *  {@link IResumeService}               â€“ orchestrates the resume-analysis pipeline
 *  {@link EvaluationResultRepository}   â€“ direct DB access for result look-ups
 *
 */
@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    // Service layer responsible for analyzing a resume and producing an {@link EvaluationResult}.
    private final IResumeService resumeService;

    // JPA repository for fetching previously stored evaluation results by ID.
    private final EvaluationResultRepository evaluationResultRepository;

    /**
     * Constructor injection (preferred over field injection).
     * Spring automatically detects the single constructor and wires the beans.
     * @param resumeService               the resume-analysis service
     * @param evaluationResultRepository  the JPA repository for evaluation results
     */
    public ResumeController(IResumeService resumeService, EvaluationResultRepository evaluationResultRepository) {
        this.resumeService = resumeService;
        this.evaluationResultRepository = evaluationResultRepository;
    }

    /**
     * POST /api/resume/analyze
     * Accepts a {@link Resume} JSON body, stamps it with the current timestamp,
     * delegates analysis to the service layer, and returns the {@link EvaluationResult}.
     * @param resume  the resume payload deserialized from the request body
     * @return 200 OK with the evaluation result, or 500 if an unexpected error occurs
     */
    @PostMapping("/analyze")
    public ResponseEntity<EvaluationResult> analyzeResume(@RequestBody Resume resume) {
        try {
            // Stamp the submission time before passing to the service
            resume.setSubmittedAt(LocalDateTime.now());

            // Delegate to the service layer (scoring + AI feedback + persistence)
            EvaluationResult result = resumeService.analyzeResume(resume);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Log-worthy in production; return a generic 500 to the client
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/resume/results/{id}
     * @param id  the database ID of the evaluation result
     * @return 200 OK with the result, 404 if not found, or 500 on error
     */
    @GetMapping("/results/{id}")
    public ResponseEntity<EvaluationResult> getResult(@PathVariable Long id) {
        try {
            // findById returns an Optional; map to 200 or fall back to 404
            return evaluationResultRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
