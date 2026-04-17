package com.pipefilter.backend.backend_pipefilter.serverInterface;

import com.pipefilter.backend.backend_pipefilter.domain.EvaluationResult;
import com.pipefilter.backend.backend_pipefilter.domain.Resume;

public interface IResumeService {
    EvaluationResult analyzeResume(Resume resume);
}
