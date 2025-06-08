package com.vacancy.controller;

import com.vacancy.dto.JobApplicationDto;
import com.vacancy.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@Tag(name = "Job Application Controller", description = "API для управления откликами на вакансии")
public class JobApplicationController {
    private final JobApplicationService jobApplicationService;

    @PostMapping
    @Operation(summary = "Создание нового отклика")
    public ResponseEntity<JobApplicationDto> createJobApplication(@RequestBody JobApplicationDto jobApplicationDto) {
        log.info("Получен запрос на создание отклика для резюме {} и вакансии {}", 
            jobApplicationDto.getResumeId(), jobApplicationDto.getVacancyId());
        JobApplicationDto createdJobApplication = jobApplicationService.createJobApplication(jobApplicationDto);
        log.info("Отклик успешно создан с ID: {}", createdJobApplication.getId());
        return ResponseEntity.ok(createdJobApplication);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получение отклика по ID")
    public ResponseEntity<JobApplicationDto> getJobApplication(@PathVariable Long id) {
        log.info("Получен запрос на получение отклика с ID: {}", id);
        JobApplicationDto jobApplication = jobApplicationService.getJobApplication(id);
        log.info("Отклик успешно получен для резюме {} и вакансии {}", 
            jobApplication.getResumeId(), jobApplication.getVacancyId());
        return ResponseEntity.ok(jobApplication);
    }

    @GetMapping
    @Operation(summary = "Получение списка всех откликов")
    public ResponseEntity<List<JobApplicationDto>> getAllJobApplications() {
        log.info("Получен запрос на получение списка всех откликов");
        List<JobApplicationDto> jobApplications = jobApplicationService.getAllJobApplications();
        log.info("Успешно получено {} откликов", jobApplications.size());
        return ResponseEntity.ok(jobApplications);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновление отклика")
    public ResponseEntity<JobApplicationDto> updateJobApplication(@PathVariable Long id, @RequestBody JobApplicationDto jobApplicationDto) {
        log.info("Получен запрос на обновление отклика с ID: {}", id);
        JobApplicationDto updatedJobApplication = jobApplicationService.updateJobApplication(id, jobApplicationDto);
        log.info("Отклик успешно обновлен для резюме {} и вакансии {}", 
            updatedJobApplication.getResumeId(), updatedJobApplication.getVacancyId());
        return ResponseEntity.ok(updatedJobApplication);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление отклика")
    public ResponseEntity<Void> deleteJobApplication(@PathVariable Long id) {
        log.info("Получен запрос на удаление отклика с ID: {}", id);
        jobApplicationService.deleteJobApplication(id);
        log.info("Отклик с ID {} успешно удален", id);
        return ResponseEntity.ok().build();
    }
} 