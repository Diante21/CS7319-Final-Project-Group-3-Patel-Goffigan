package com.pipefilter.backend.backend_pipefilter.serverInterface;

import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;

public interface IResumeService {
    ResumePayload analyzeResume(Resume resume);
}