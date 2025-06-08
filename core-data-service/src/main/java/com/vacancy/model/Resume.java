package com.vacancy.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.io.Serializable;
import java.time.LocalDateTime;


/**
 * Сущность, представляющая резюме кандидата.
 */
@Data
@Entity
@Table(name = "resumes")
public class Resume implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "pdf_content", columnDefinition = "BYTEA")
    @Basic(fetch = FetchType.LAZY)
    private byte[] pdfContent;

    @Column(length = 100)
    private String source;

    @Column(length = 255)
    private String name;

    @Column(length = 100)
    private String phone;

    @Column(length = 255)
    private String role;

    @Column(name = "hard_skills", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String hardSkills;

    @Column(name = "soft_skills", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String softSkills;

    @Column(name = "education", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String education;

    @Column(name = "work_experience", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String workExperience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private CandidateStatus candidateStatus;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
} 