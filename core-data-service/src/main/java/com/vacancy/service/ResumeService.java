package com.vacancy.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vacancy.dto.CandidateDTO;
import com.vacancy.dto.MatchedVacancyIdResponse;
import com.vacancy.dto.ResumeDto;
import com.vacancy.dto.ResumeVacancyFastMatchRequest;
import com.vacancy.model.CandidateStatus;
import com.vacancy.model.Resume;
import com.vacancy.model.ResumeVacancyFastMatch;
import com.vacancy.model.User;
import com.vacancy.repository.ResumeRepository;
import com.vacancy.repository.ResumeVacancyFastMatchRepository;
import com.vacancy.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Сервис для работы с резюме.
 * Реализует бизнес-логику CRUD операций.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final JsonUtils jsonUtils;
    private final VacancyService vacancyService;
    private final ObjectMapper objectMapper;
    private final ResumeVacancyFastMatchRepository repository;

    /**
     * Создает новое резюме.
     *
     * @param resumeDto DTO с данными резюме
     * @param user      пользователь, к которому привязывается резюме
     * @return созданное резюме в формате DTO
     */
    @Transactional
    public ResumeDto createResume(ResumeDto resumeDto, User user) {
        log.info("Создание нового резюме для кандидата: {} (user={})", resumeDto.getName(), user.getUsername());
        Resume resume = convertToEntity(resumeDto);
        resume.setUser(user);
        Resume savedResume = resumeRepository.save(resume);
        log.info("Резюме успешно создано с ID: {}", savedResume.getId());
        return convertToDto(savedResume);
    }

    /**
     * Получает резюме по ID.
     *
     * @param id ID резюме
     * @return резюме в формате DTO
     * @throws RuntimeException если резюме не найдено
     */
    @Transactional(readOnly = true)
    public ResumeDto getResume(Integer id) {
        log.info("Получение резюме по ID: {}", id);
        return resumeRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> {
                    log.error("Резюме с ID {} не найдено", id);
                    return new RuntimeException("Resume not found");
                });
    }

    /**
     * Получает список всех резюме пользователя.
     *
     * @param user пользователь
     * @return список резюме в формате DTO
     */
    @Transactional(readOnly = true)
    public List<ResumeDto> getAllResumes(User user) {
        log.info("Получение списка всех резюме пользователя {}", user.getUsername());
        List<ResumeDto> resumes = resumeRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        log.info("Найдено {} резюме", resumes.size());
        return resumes;
    }

    /**
     * Обновляет существующее резюме.
     *
     * @param id        ID резюме для обновления
     * @param resumeDto DTO с новыми данными резюме
     * @param user      пользователь, выполняющий обновление
     * @return обновленное резюме в формате DTO
     * @throws RuntimeException если резюме не найдено или доступ запрещен
     */
    @Transactional
    public ResumeDto updateResume(Integer id, ResumeDto resumeDto, User user) {
        log.info("Обновление резюме с ID: {} пользователем {}", id, user.getUsername());
        Resume existingResume = resumeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Резюме с ID {} не найдено для обновления", id);
                    return new RuntimeException("Resume not found");
                });
        if (!existingResume.getUser().getId().equals(user.getId())) {
            log.warn("Пользователь {} пытался обновить чужое резюме {}", user.getUsername(), id);
            throw new RuntimeException("Access denied");
        }
        updateEntityFromDto(existingResume, resumeDto);
        resumeRepository.save(existingResume);
        return convertToDto(existingResume);
    }

    /**
     * Удаляет резюме по ID.
     *
     * @param id   ID резюме для удаления
     * @param user пользователь, выполняющий удаление
     */
    @Transactional
    public void deleteResume(Integer id, User user) {
        log.info("Удаление резюме с ID: {} пользователем {}", id, user.getUsername());
        Resume existingResume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (!existingResume.getUser().getId().equals(user.getId())) {
            log.warn("Пользователь {} пытался удалить чужое резюме {}", user.getUsername(), id);
            throw new RuntimeException("Access denied");
        }
        resumeRepository.deleteById(id);
        log.info("Резюме с ID {} успешно удалено", id);
    }

    /**
     * Конвертирует DTO в сущность Resume.
     *
     * @param dto DTO для конвертации
     * @return сущность Resume
     */
    private Resume convertToEntity(ResumeDto dto) {
        Resume entity = new Resume();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setSource(dto.getSource());
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setRole(dto.getRole());
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            entity.setHardSkills(dto.getHardSkills() != null ? objectMapper.writeValueAsString(dto.getHardSkills()) : null);
            entity.setSoftSkills(dto.getSoftSkills() != null ? objectMapper.writeValueAsString(dto.getSoftSkills()) : null);
            entity.setEducation(dto.getEducation() != null ? objectMapper.writeValueAsString(dto.getEducation()) : null);
            entity.setWorkExperience(dto.getWorkExperience() != null ? objectMapper.writeValueAsString(dto.getWorkExperience()) : null);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка сериализации jsonb-полей", e);
        }
        if (dto.getPdfFile() != null) {
            entity.setPdfContent(java.util.Base64.getDecoder().decode(dto.getPdfFile()));
        }
        return entity;
    }

    /**
     * Обновляет поля сущности Resume из DTO.
     *
     * @param entity сущность для обновления
     * @param dto    DTO с новыми данными
     */
    private void updateEntityFromDto(Resume entity, ResumeDto dto) {
        entity.setEmail(dto.getEmail());
        entity.setSource(dto.getSource());
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setRole(dto.getRole());
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            entity.setHardSkills(dto.getHardSkills() != null ? objectMapper.writeValueAsString(dto.getHardSkills()) : null);
            entity.setSoftSkills(dto.getSoftSkills() != null ? objectMapper.writeValueAsString(dto.getSoftSkills()) : null);
            entity.setEducation(dto.getEducation() != null ? objectMapper.writeValueAsString(dto.getEducation()) : null);
            entity.setWorkExperience(dto.getWorkExperience() != null ? objectMapper.writeValueAsString(dto.getWorkExperience()) : null);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка сериализации jsonb-полей", e);
        }
        if (dto.getPdfFile() != null) {
            entity.setPdfContent(java.util.Base64.getDecoder().decode(dto.getPdfFile()));
        }
    }

    /**
     * Конвертирует сущность Resume в DTO.
     *
     * @param entity сущность для конвертации
     * @return DTO
     */
    private ResumeDto convertToDto(Resume entity) {
        ResumeDto dto = new ResumeDto();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setSource(entity.getSource());
        dto.setName(entity.getName());
        dto.setPhone(entity.getPhone());
        dto.setRole(entity.getRole());
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            dto.setHardSkills(entity.getHardSkills() != null ? objectMapper.readValue(entity.getHardSkills(), new TypeReference<List<String>>() {
            }) : null);
            dto.setSoftSkills(entity.getSoftSkills() != null ? objectMapper.readValue(entity.getSoftSkills(), new TypeReference<List<String>>() {
            }) : null);
            dto.setEducation(entity.getEducation() != null ? objectMapper.readValue(entity.getEducation(), new TypeReference<List<Map<String, Object>>>() {
            }) : null);
            dto.setWorkExperience(entity.getWorkExperience() != null ? objectMapper.readValue(entity.getWorkExperience(), new TypeReference<List<Map<String, Object>>>() {
            }) : null);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка десериализации jsonb-полей", e);
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCandidateStatus(entity.getCandidateStatus());

        // Добавляем подходящие вакансии
        List<ResumeVacancyFastMatch> fastMatches = repository.findAll().stream()
            .filter(fm -> fm.getResume().getId().equals(entity.getId()))
            .collect(Collectors.toList());
        List<ResumeDto.MatchedVacancyShortDto> matchedVacancies = fastMatches.stream().map(fm -> {
            ResumeDto.MatchedVacancyShortDto mv = new ResumeDto.MatchedVacancyShortDto();
            mv.setVacancyId(fm.getVacancy().getId());
            mv.setTitle(fm.getVacancy().getTitle());
            return mv;
        }).collect(Collectors.toList());
        dto.setMatchedVacancies(matchedVacancies);
        return dto;
    }

    @Transactional
    public void uploadAndNormalizeResume(String email, MultipartFile file, User user) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("email", email);
            HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<CandidateDTO> response = restTemplate.postForEntity("http://127.0.0.1:8000/resume/upload-resume", requestEntity, CandidateDTO.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Ошибка загрузки/нормализации резюме: {}", response.getStatusCode());
                throw new RuntimeException("Ошибка загрузки/нормализации резюме: " + response.getStatusCode());
            }
            log.info("Ответ от сервиса нормализации: {}", response.getBody());
            CandidateDTO resp = response.getBody();

            Resume resume = new Resume();
            resume.setEmail(email);
            resume.setUser(user);
            resume.setSource("upload");
            resume.setName(resp.getName());
            resume.setPhone(resp.getPhone());
            resume.setRole(resp.getRole());
            resume.setHardSkills(jsonUtils.toJson(resp.getHardSkills()));
            resume.setSoftSkills(jsonUtils.toJson(resp.getSoftSkills()));
            resume.setEducation(jsonUtils.toJson(resp.getEducation()));
            resume.setWorkExperience(jsonUtils.toJson(resp.getWorkExperience()));
            resume.setPdfContent(file.getBytes());
            resume.setCandidateStatus(CandidateStatus.builder().id(1).build());

            Resume res = resumeRepository.save(resume);
            log.info("Резюме успешно загружено и нормализовано, id={}", res.getId());

            log.info("Выполняем запрос для поиска подходящих вакансий");

            ResumeVacancyFastMatchRequest request = new ResumeVacancyFastMatchRequest();
            ResumeVacancyFastMatchRequest.ResumeDTO dto = new ResumeVacancyFastMatchRequest.ResumeDTO();
            dto.setId(res.getId());
            dto.setDesiredRole(res.getRole());
            dto.setVacancy(vacancyService.getAllVacancyShort(user));
            dto.setWorkExperience(parseWorkExperienceJson(res.getWorkExperience()));
            request.setResume(dto);

            HttpHeaders headers2 = new HttpHeaders();
            headers2.setContentType(MediaType.APPLICATION_JSON);
            String request2 = objectMapper.writeValueAsString(request);
            log.info("запрос для сопоставления: {}", request2);
            HttpEntity<String> httpEntity = new HttpEntity<>(request2, headers2);

            ResponseEntity<MatchedVacancyIdResponse> listResponseEntity = restTemplate.postForEntity("http://0.0.0.0:8000/resume/match-vacancies", httpEntity, MatchedVacancyIdResponse.class);
            List<ResumeVacancyFastMatch> fastMatch = new ArrayList<>();
            listResponseEntity.getBody().getMatchedVacancyIds().forEach(i -> {
                fastMatch.add(ResumeVacancyFastMatch.builder()
                        .resume(resume)
                        .vacancy(vacancyService.getVacancyById((long) i))
                        .build());
            });
            repository.saveAll(fastMatch);
        } catch (Exception e) {
            log.error("Ошибка при загрузке и нормализации резюме: {}", e.getMessage(), e);
            throw new RuntimeException("Ошибка при загрузке и нормализации резюме", e);
        }
    }

    public List<ResumeVacancyFastMatchRequest.WorkExperienceDTO> parseWorkExperienceJson(String json) {
        try {
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<ResumeVacancyFastMatchRequest.WorkExperienceDTO>>() {
                    }
            );
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при разборе JSON в WorkExperienceDTO", e);
        }
    }

    public void updateStatus(Integer resumeId, Integer statusId) {
        resumeRepository.updateStatusById(resumeId, statusId);
    }
} 