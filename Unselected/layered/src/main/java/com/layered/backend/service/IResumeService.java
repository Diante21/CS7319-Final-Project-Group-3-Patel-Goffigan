package com.layered.backend.service;

import com.layered.backend.domain.EvaluationResult;
import com.layered.backend.domain.Resume;

public interface IResumeService {
    EvaluationResult analyzeResume(Resume resume);
}
