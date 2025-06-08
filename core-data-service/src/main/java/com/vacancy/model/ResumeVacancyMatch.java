package com.vacancy.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "resume_vacancy_matches",
    uniqueConstraints = @UniqueConstraint(columnNames = {"resume_id", "vacancy_id"})
)
public class ResumeVacancyMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @Column(name = "matched_skills", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String matchedSkills;

    @Column(name = "unmatched_skills", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String unmatchedSkills;

    @Column(name = "llm_comment", columnDefinition = "TEXT")
    private String llmComment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "score")
    private Double score;

    @Column(name = "positives", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String positives;

    @Column(name = "negatives", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String negatives;

    @Column(name = "verdict", columnDefinition = "TEXT")
    private String verdict;

    @Column(name = "clarifying_questions", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private String clarifyingQuestions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
} 