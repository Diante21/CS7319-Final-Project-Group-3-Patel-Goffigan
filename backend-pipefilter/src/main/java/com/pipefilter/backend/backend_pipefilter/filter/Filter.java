package com.pipefilter.backend.backend_pipefilter.filter;

import com.pipefilter.backend.backend_pipefilter.domain.ResumePayload;

public interface Filter {
    ResumePayload process(ResumePayload payload);
}
