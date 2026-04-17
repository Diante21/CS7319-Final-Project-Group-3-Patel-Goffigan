package com.pipefilter.backend.backend_pipefilter.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Entity
@Table(name = "evaluation_results")
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String foundKeywords;

    @Column(columnDefinition = "TEXT")
    private String missingKeywords;

    private LocalDateTime analyzedAt;

    @OneToOne
    @JoinColumn(name = "resume_id")
    private Resume resume;

    public Long getId() {
        return id;
    }

    public int getScore() {
        return score;
    }

    public String getFeedback() {
        return feedback;
    }

    public String getFoundKeywords() {
        return foundKeywords;
    }

    public String getMissingKeywords() {
        return missingKeywords;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public Resume getResume() {
        return resume;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public void setFoundKeywords(String foundKeywords) {
        this.foundKeywords = foundKeywords;
    }

    public void setMissingKeywords(String missingKeywords) {
        this.missingKeywords = missingKeywords;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }
}

