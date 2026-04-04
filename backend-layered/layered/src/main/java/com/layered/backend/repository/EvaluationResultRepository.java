package com.layered.backend.repository;

import com.layered.backend.domain.EvaluationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationResultRepository extends JpaRepository<EvaluationResult, Long> {

}
