package com.vacancy.repository;

import com.vacancy.model.Vacancy;
import com.vacancy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, Long> {
    List<Vacancy> findByUser(User user);

    interface VacancyShortView {
        Integer getId();
        String getTitle();
        String getExperience();
    }

    @Query("SELECT v.id AS id, v.title AS title, v.experience AS experience FROM Vacancy v")
    List<VacancyShortView> findAllShort();

    @Query("SELECT v.id AS id, v.title AS title, v.experience AS experience FROM Vacancy v WHERE v.user = :user")
    List<VacancyShortView> findAllShortByUser(User user);

    long countByStatus(String status);
    @Query("SELECT COUNT(v) FROM Vacancy v WHERE v.status = '5'")
    long countByStatus5();
} 