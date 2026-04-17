package com.pipefilter.backend.backend_pipefilter.controller;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import com.pipefilter.backend.backend_pipefilter.repository.EvaluationResultRepository;
import com.pipefilter.backend.backend_pipefilter.serverInterface.IResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    private final IResumeService resumeService;
    private final EvaluationResultRepository evaluationResultRepository;

    public ResumeController(IResumeService resumeService, EvaluationResultRepository evaluationResultRepository) {
        this.resumeService = resumeService;
        this.evaluationResultRepository = evaluationResultRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<EvaluationResult> analyzeResume(@RequestBody Resume resume) {
        try {
            EvaluationResult result = resumeService.analyzeResume(resume);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/results/{id}")
    public ResponseEntity<EvaluationResult> getResult(@PathVariable Long id) {
        try {
            return evaluationResultRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}
