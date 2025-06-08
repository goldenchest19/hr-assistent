package com.vacancy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(
        name = "resume_vacancy_fast_match",
        uniqueConstraints = @UniqueConstraint(columnNames = {"resume_id", "vacancy_id"})
)
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ResumeVacancyFastMatch implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false, foreignKey = @ForeignKey(name = "fk_resume"))
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false, foreignKey = @ForeignKey(name = "fk_vacancy"))
    private Vacancy vacancy;
}
