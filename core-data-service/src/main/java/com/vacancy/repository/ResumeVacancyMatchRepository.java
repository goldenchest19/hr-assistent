package com.vacancy.repository;

import com.vacancy.model.ResumeVacancyMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeVacancyMatchRepository extends JpaRepository<ResumeVacancyMatch, Integer> {
    List<ResumeVacancyMatch> findByResume_Id(Integer resumeId);
    List<ResumeVacancyMatch> findByVacancy_Id(Long vacancyId);
    ResumeVacancyMatch findByResume_IdAndVacancy_Id(Integer resumeId, Long vacancyId);
    long countByScoreGreaterThan(double score);
    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
} 