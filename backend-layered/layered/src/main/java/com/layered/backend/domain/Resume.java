package com.layered.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a resume submitted by a user.
 * Mapped to the "resumes" table in the database.
 *
 * Lombok annotations:
 *   @Data           – generates getters, setters, equals, hashCode, and toString
 *   @NoArgsConstructor  – generates a no-arg constructor (required by JPA)
 *   @AllArgsConstructor – generates a constructor with all fields
 */
@Entity
@Table(name = "resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    /** Primary key, auto-incremented by the database. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Full text content of the resume.
     * Stored as TEXT to support large documents; cannot be null.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /** Original file name of the uploaded resume (e.g. "john_doe_resume.pdf"). */
    private String fileName;

    /** Timestamp of when the resume was submitted. */
    private LocalDateTime submittedAt;

    private String jobType;
}
