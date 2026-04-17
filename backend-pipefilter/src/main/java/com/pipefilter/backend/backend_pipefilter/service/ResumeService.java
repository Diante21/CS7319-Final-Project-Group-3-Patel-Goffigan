package com.pipefilter.backend.backend_pipefilter.service;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;
import com.pipefilter.backend.backend_pipefilter.pipeline.ResumePipeline;
import com.pipefilter.backend.backend_pipefilter.serverInterface.IResumeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ResumeService implements IResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);

    private final ResumePipeline pipeline;

    public ResumeService(ResumePipeline pipeline) {
        this.pipeline = pipeline;
    }

    @Override
    public EvaluationResult analyzeResume(Resume resume) {
        resume.setSubmittedAt(LocalDateTime.now());

        ResumePayload payload = pipeline.execute(resume);

        if (!payload.isValid()) {
            logger.warn("Resume analysis failed validation: {}", payload.getValidationMessage());
            EvaluationResult failed = new EvaluationResult();
            failed.setScore(0);
            failed.setFeedback(payload.getValidationMessage());
            failed.setAnalyzedAt(LocalDateTime.now());
            return failed;
        }

        return payload.getEvaluationResult();
    }



}
