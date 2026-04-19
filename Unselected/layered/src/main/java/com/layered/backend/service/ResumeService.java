package com.layered.backend.service;

import com.layered.backend.domain.EvaluationResult;
import com.layered.backend.domain.Resume;
import com.layered.backend.repository.EvaluationResultRepository;
import com.layered.backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ResumeService implements IResumeService {

    private final RuleBasedScoringEngine scoringEngine;
    private final ResumeRepository resumeRepository;
    private final EvaluationResultRepository evaluationResultRepository;


    public ResumeService(RuleBasedScoringEngine scoringEngine, ResumeRepository resumeRepository, EvaluationResultRepository evaluationResultRepository) {
        this.scoringEngine = scoringEngine;
        this.resumeRepository = resumeRepository;
        this.evaluationResultRepository = evaluationResultRepository;
    }


    @Override
    public EvaluationResult analyzeResume(Resume resume){
        resumeRepository.save(resume);
        EvaluationResult result = scoringEngine.evaluate(resume);
        result.setResume(resume);
        result.setAnalyzedAt(LocalDateTime.now());
        evaluationResultRepository.save(result);
        return result;
    }


}
