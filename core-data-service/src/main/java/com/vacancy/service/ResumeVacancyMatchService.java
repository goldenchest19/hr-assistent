package com.vacancy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.vacancy.dto.ResumeVacancyMatchRequestDto;
import com.vacancy.dto.ResumeVacancyMatchResponseDto;
import com.vacancy.model.ResumeVacancyMatch;
import com.vacancy.model.User;
import com.vacancy.repository.ResumeVacancyMatchRepository;
import com.vacancy.repository.ResumeRepository;
import com.vacancy.repository.VacancyRepository;
import com.vacancy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.vacancy.dto.ResumeVacancyMatchFullRequest;
import com.vacancy.dto.ResumeDto;
import com.vacancy.dto.VacancyDto;
import com.vacancy.service.ResumeService;
import com.vacancy.service.VacancyService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;
import com.vacancy.dto.ResumeVacancyMatchExternalRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeVacancyMatchService {
    private final ResumeVacancyMatchRepository matchRepository;
    private final ResumeRepository resumeRepository;
    private final VacancyRepository vacancyRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ResumeService resumeService;
    private final VacancyService vacancyService;
    private final RestTemplate restTemplate;


    @Transactional
    public ResumeVacancyMatchRequestDto create(ResumeVacancyMatchRequestDto dto, User user) {
        ResumeVacancyMatch entity = toEntity(dto);
        entity.setUser(user);
        ResumeVacancyMatch saved = matchRepository.save(entity);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public ResumeVacancyMatchRequestDto getById(Integer id) {
        return matchRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Match not found"));
    }

    @Transactional(readOnly = true)
    public List<ResumeVacancyMatchRequestDto> getAll() {
        return matchRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ResumeVacancyMatchRequestDto update(Integer id, ResumeVacancyMatchRequestDto dto, User user) {
        ResumeVacancyMatch entity = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        updateEntityFromDto(entity, dto);
        entity.setUser(user);
        ResumeVacancyMatch updated = matchRepository.save(entity);
        return toDto(updated);
    }

    @Transactional
    public void delete(Integer id) {
        matchRepository.deleteById(id);
    }

    @Transactional
    public ResumeVacancyMatchResponseDto saveFromResponse(ResumeVacancyMatchResponseDto dto, User user) {
        ResumeVacancyMatch entity = matchRepository.findByResume_IdAndVacancy_Id(dto.getResumeId(), dto.getVacancyId());
        if (entity == null) {
            entity = new ResumeVacancyMatch();
            entity.setResume(resumeRepository.findById(dto.getResumeId())
                    .orElseThrow(() -> new RuntimeException("Resume not found")));
            entity.setVacancy(vacancyRepository.findById(dto.getVacancyId())
                    .orElseThrow(() -> new RuntimeException("Vacancy not found")));
        }
        entity.setUser(user);
        try {
            entity.setMatchedSkills(dto.getMatchedSkills() != null ? objectMapper.writeValueAsString(dto.getMatchedSkills()) : null);
            entity.setUnmatchedSkills(dto.getUnmatchedSkills() != null ? objectMapper.writeValueAsString(dto.getUnmatchedSkills()) : null);
            entity.setLlmComment(dto.getLlmComment());
            entity.setScore(dto.getScore());
            entity.setPositives(dto.getPositives() != null ? objectMapper.writeValueAsString(dto.getPositives()) : null);
            entity.setNegatives(dto.getNegatives() != null ? objectMapper.writeValueAsString(dto.getNegatives()) : null);
            entity.setVerdict(dto.getVerdict());
            entity.setClarifyingQuestions(dto.getClarifyingQuestions() != null ? objectMapper.writeValueAsString(dto.getClarifyingQuestions()) : null);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка сериализации jsonb-полей", e);
        }
        ResumeVacancyMatch saved = matchRepository.save(entity);
        ResumeVacancyMatchResponseDto result = new ResumeVacancyMatchResponseDto();
        result.setId(saved.getId());
        result.setResumeId(saved.getResume().getId());
        result.setVacancyId(saved.getVacancy().getId());
        result.setUserId(saved.getUser() != null ? saved.getUser().getId() : null);
        try {
            result.setMatchedSkills(saved.getMatchedSkills() != null ? objectMapper.readValue(saved.getMatchedSkills(), new TypeReference<List<String>>() {}) : null);
            result.setUnmatchedSkills(saved.getUnmatchedSkills() != null ? objectMapper.readValue(saved.getUnmatchedSkills(), new TypeReference<List<String>>() {}) : null);
            result.setPositives(saved.getPositives() != null ? objectMapper.readValue(saved.getPositives(), new TypeReference<List<String>>() {}) : null);
            result.setNegatives(saved.getNegatives() != null ? objectMapper.readValue(saved.getNegatives(), new TypeReference<List<String>>() {}) : null);
            result.setClarifyingQuestions(saved.getClarifyingQuestions() != null ? objectMapper.readValue(saved.getClarifyingQuestions(), new TypeReference<List<String>>() {}) : null);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка десериализации jsonb-полей", e);
        }
        result.setLlmComment(saved.getLlmComment());
        result.setCreatedAt(saved.getCreatedAt());
        result.setScore(saved.getScore());
        result.setVerdict(saved.getVerdict());
        resumeService.updateStatus(entity.getResume().getId(), 3);
        return result;
    }

    @Transactional
    public ResumeVacancyMatchResponseDto matchFull(ResumeVacancyMatchFullRequest request, User user) {
        ResumeDto resume = resumeService.getResume(request.getResumeId());
        VacancyDto vacancy = vacancyService.getVacancy(request.getVacancyId());
        // Маппинг в нужные DTO для внешнего сервиса
        ResumeVacancyMatchExternalRequest.ResumeExternal resumeExternal = new ResumeVacancyMatchExternalRequest.ResumeExternal();
        resumeExternal.setId(resume.getId());
        resumeExternal.setEmail(resume.getEmail());
        resumeExternal.setName(resume.getName());
        resumeExternal.setPhone(resume.getPhone());
        resumeExternal.setRole(resume.getRole());
        resumeExternal.setHardSkills(resume.getHardSkills());
        resumeExternal.setSoftSkills(resume.getSoftSkills());
        resumeExternal.setEducation((List<ResumeVacancyMatchExternalRequest.ResumeExternal.Education>) (Object) resume.getEducation());
        resumeExternal.setWorkExperience((List<ResumeVacancyMatchExternalRequest.ResumeExternal.WorkExperience>) (Object) resume.getWorkExperience());

        ResumeVacancyMatchExternalRequest.VacancyExternal vacancyExternal = new ResumeVacancyMatchExternalRequest.VacancyExternal();
        vacancyExternal.setId(vacancy.getId());
        vacancyExternal.setTitle(vacancy.getTitle());
        vacancyExternal.setDescription(vacancy.getDescription());
        vacancyExternal.setRequirements(vacancy.getRequirements());
        vacancyExternal.setCompany(vacancy.getCompany());
        vacancyExternal.setResponsibilities(vacancy.getResponsibilities());
        vacancyExternal.setSkills(vacancy.getSkills());
        vacancyExternal.setSalaryFrom(vacancy.getSalaryFrom());
        vacancyExternal.setSalaryTo(vacancy.getSalaryTo());
        vacancyExternal.setLocation(vacancy.getLocation());
        vacancyExternal.setSource(vacancy.getSource());
        vacancyExternal.setCreatedAt(vacancy.getCreatedAt() != null ? vacancy.getCreatedAt().toString() : null);
        vacancyExternal.setCurrency(vacancy.getCurrency());
        vacancyExternal.setExperience(vacancy.getExperience());
        vacancyExternal.setUrl(vacancy.getUrl());
        vacancyExternal.setOriginalId(vacancy.getOriginalId());
        vacancyExternal.setStatus(vacancy.getStatus());
        vacancyExternal.setFormatWork(vacancy.getFormatWork());

        ResumeVacancyMatchExternalRequest externalRequest = new ResumeVacancyMatchExternalRequest();
        externalRequest.setResume(resumeExternal);
        externalRequest.setVacancy(vacancyExternal);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String json;
        try {
            json = mapper.writeValueAsString(externalRequest);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка сериализации запроса для внешнего сервиса", e);
        }
        log.info("Отправляем во внешний сервис: {}", json);
        HttpEntity<String> httpEntity = new HttpEntity<>(json, headers);
        String url = "http://0.0.0.0:8080/api/match-full";
        ResumeVacancyMatchResponseDto responseDto;
        try {
            ResponseEntity<ResumeVacancyMatchResponseDto> response = restTemplate.postForEntity(url, httpEntity, ResumeVacancyMatchResponseDto.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Ошибка от внешнего сервиса: " + response.getStatusCode() + ": " + response.getBody());
            }
            responseDto = response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обращении к внешнему сервису: " + e.getMessage(), e);
        }
        return saveFromResponse(responseDto, user);
    }

    private ResumeVacancyMatch toEntity(ResumeVacancyMatchRequestDto dto) {
        ResumeVacancyMatch entity = new ResumeVacancyMatch();
        entity.setResume(resumeRepository.findById(dto.getResumeId())
                .orElseThrow(() -> new RuntimeException("Resume not found")));
        entity.setVacancy(vacancyRepository.findById(dto.getVacancyId())
                .orElseThrow(() -> new RuntimeException("Vacancy not found")));
        if (dto.getUserId() != null) {
            entity.setUser(userRepository.findById(dto.getUserId())
                .orElse(null));
        }
        updateEntityFromDto(entity, dto);
        return entity;
    }

    private void updateEntityFromDto(ResumeVacancyMatch entity, ResumeVacancyMatchRequestDto dto) {
        try {
            entity.setMatchedSkills(dto.getMatchedSkills() != null ? objectMapper.writeValueAsString(dto.getMatchedSkills()) : null);
            entity.setUnmatchedSkills(dto.getUnmatchedSkills() != null ? objectMapper.writeValueAsString(dto.getUnmatchedSkills()) : null);
            entity.setLlmComment(dto.getLlmComment());
            entity.setScore(dto.getScore());
            entity.setPositives(dto.getPositives() != null ? objectMapper.writeValueAsString(dto.getPositives()) : null);
            entity.setNegatives(dto.getNegatives() != null ? objectMapper.writeValueAsString(dto.getNegatives()) : null);
            entity.setVerdict(dto.getVerdict());
            entity.setClarifyingQuestions(dto.getClarifyingQuestions() != null ? objectMapper.writeValueAsString(dto.getClarifyingQuestions()) : null);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка сериализации jsonb-полей", e);
        }
    }

    private ResumeVacancyMatchRequestDto toDto(ResumeVacancyMatch entity) {
        ResumeVacancyMatchRequestDto dto = new ResumeVacancyMatchRequestDto();
        dto.setId(entity.getId());
        dto.setResumeId(entity.getResume().getId());
        dto.setVacancyId(entity.getVacancy().getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        try {
            dto.setMatchedSkills(entity.getMatchedSkills() != null ? objectMapper.readValue(entity.getMatchedSkills(), new TypeReference<List<String>>() {}) : null);
            dto.setUnmatchedSkills(entity.getUnmatchedSkills() != null ? objectMapper.readValue(entity.getUnmatchedSkills(), new TypeReference<List<String>>() {}) : null);
            dto.setPositives(entity.getPositives() != null ? objectMapper.readValue(entity.getPositives(), new TypeReference<List<String>>() {}) : null);
            dto.setNegatives(entity.getNegatives() != null ? objectMapper.readValue(entity.getNegatives(), new TypeReference<List<String>>() {}) : null);
            dto.setClarifyingQuestions(entity.getClarifyingQuestions() != null ? objectMapper.readValue(entity.getClarifyingQuestions(), new TypeReference<List<String>>() {}) : null);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка десериализации jsonb-полей", e);
        }
        dto.setLlmComment(entity.getLlmComment());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setScore(entity.getScore());
        dto.setVerdict(entity.getVerdict());
        return dto;
    }
} 