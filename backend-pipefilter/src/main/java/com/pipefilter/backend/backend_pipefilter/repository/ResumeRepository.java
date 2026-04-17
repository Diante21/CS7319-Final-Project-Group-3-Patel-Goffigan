package com.pipefilter.backend.backend_pipefilter.repository;

import com.pipefilter.backend.backend_pipefilter.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

}
