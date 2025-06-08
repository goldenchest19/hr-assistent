package com.vacancy.service;

import com.vacancy.dto.JobApplicationDto;
import com.vacancy.model.JobApplication;
import com.vacancy.repository.JobApplicationRepository;
import com.vacancy.repository.ResumeRepository;
import com.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobApplicationService {
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;
    private final VacancyRepository vacancyRepository;

    @Transactional
    public JobApplicationDto createJobApplication(JobApplicationDto jobApplicationDto) {
        log.info("Создание нового отклика для резюме {} и вакансии {}", 
            jobApplicationDto.getResumeId(), jobApplicationDto.getVacancyId());
        JobApplication jobApplication = convertToEntity(jobApplicationDto);
        JobApplication savedJobApplication = jobApplicationRepository.save(jobApplication);
        log.info("Отклик успешно создан с ID: {}", savedJobApplication.getId());
        return convertToDto(savedJobApplication);
    }

    @Transactional(readOnly = true)
    public JobApplicationDto getJobApplication(Long id) {
        log.info("Получение отклика по ID: {}", id);
        return jobApplicationRepository.findById(id)
                .map(jobApplication -> {
                    log.info("Отклик найден для резюме {} и вакансии {}", 
                        jobApplication.getResume().getId(), jobApplication.getVacancy().getId());
                    return convertToDto(jobApplication);
                })
                .orElseThrow(() -> {
                    log.error("Отклик с ID {} не найден", id);
                    return new RuntimeException("Job application not found");
                });
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getAllJobApplications() {
        log.info("Получение списка всех откликов");
        List<JobApplicationDto> jobApplications = jobApplicationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        log.info("Найдено {} откликов", jobApplications.size());
        return jobApplications;
    }

    @Transactional
    public JobApplicationDto updateJobApplication(Long id, JobApplicationDto jobApplicationDto) {
        log.info("Обновление отклика с ID: {}", id);
        JobApplication existingJobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Отклик с ID {} не найден для обновления", id);
                    return new RuntimeException("Job application not found");
                });
        
        updateEntityFromDto(existingJobApplication, jobApplicationDto);
        JobApplication updatedJobApplication = jobApplicationRepository.save(existingJobApplication);
        log.info("Отклик успешно обновлен для резюме {} и вакансии {}", 
            updatedJobApplication.getResume().getId(), updatedJobApplication.getVacancy().getId());
        return convertToDto(updatedJobApplication);
    }

    @Transactional
    public void deleteJobApplication(Long id) {
        log.info("Удаление отклика с ID: {}", id);
        if (jobApplicationRepository.existsById(id)) {
            jobApplicationRepository.deleteById(id);
            log.info("Отклик с ID {} успешно удален", id);
        } else {
            log.warn("Попытка удаления несуществующего отклика с ID: {}", id);
        }
    }

    private JobApplication convertToEntity(JobApplicationDto dto) {
        JobApplication entity = new JobApplication();
        updateEntityFromDto(entity, dto);
        return entity;
    }

    private void updateEntityFromDto(JobApplication entity, JobApplicationDto dto) {
        entity.setResume(resumeRepository.findById(dto.getResumeId())
                .orElseThrow(() -> new RuntimeException("Resume not found")));
        entity.setVacancy(vacancyRepository.findById(dto.getVacancyId())
                .orElseThrow(() -> new RuntimeException("Vacancy not found")));
        entity.setStatus(dto.getStatus());
        entity.setMatchScore(dto.getMatchScore());
    }

    private JobApplicationDto convertToDto(JobApplication entity) {
        JobApplicationDto dto = new JobApplicationDto();
        dto.setId(entity.getId());
        dto.setResumeId(entity.getResume().getId());
        dto.setVacancyId(entity.getVacancy().getId());
        dto.setStatus(entity.getStatus());
        dto.setMatchScore(entity.getMatchScore());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
} 