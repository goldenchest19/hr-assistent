package com.vacancy.repository;

import com.vacancy.model.CandidateStatus;
import com.vacancy.model.Resume;
import com.vacancy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.stereotype.Repository;

/**
 * Репозиторий для работы с сущностью Resume.
 */
@Repository
public interface ResumeRepository extends JpaRepository<Resume, Integer> {
    List<Resume> findByUser(User user);

    @Modifying
    @Transactional
    @Query("UPDATE Resume r SET r.candidateStatus.id = :statusId WHERE r.id = :resumeId")
    void updateStatusById(Integer resumeId, Integer statusId);

    @Query("SELECT COUNT(v) FROM Resume v WHERE v.candidateStatus = :statusId")
    long countByStatus5(CandidateStatus statusId);
} 