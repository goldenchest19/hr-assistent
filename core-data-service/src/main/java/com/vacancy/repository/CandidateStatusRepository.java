package com.vacancy.repository;

import com.vacancy.model.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CandidateStatusRepository extends JpaRepository<CandidateStatus, Integer> {
} 