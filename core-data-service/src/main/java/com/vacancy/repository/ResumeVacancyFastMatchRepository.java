package com.vacancy.repository;

import com.vacancy.model.Resume;
import com.vacancy.model.ResumeVacancyFastMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeVacancyFastMatchRepository extends JpaRepository<ResumeVacancyFastMatch, Long> {
//    @Query(nativeQuery = true, value = "select * from resume_vacancy_fast_match where resume_id = :resumeId")
//    List<ResumeVacancyFastMatch> selectByResumeId(@Param("resume_id") Long resumeId);
} 