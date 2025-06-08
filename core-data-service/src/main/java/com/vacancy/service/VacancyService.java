package com.vacancy.service;

import com.vacancy.dto.ResumeVacancyFastMatchRequest;
import com.vacancy.dto.VacancyDto;
import com.vacancy.dto.VacancyGenRequest;
import com.vacancy.model.CandidateStatus;
import com.vacancy.model.User;
import com.vacancy.model.Vacancy;
import com.vacancy.repository.VacancyRepository;
import com.vacancy.repository.VacancyRepository.VacancyShortView;
import com.vacancy.repository.ResumeRepository;
import com.vacancy.repository.ResumeVacancyMatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

/**
 * Сервис для работы с вакансиями.
 * Реализует бизнес-логику CRUD операций.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyService {
    private final VacancyRepository vacancyRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeVacancyMatchRepository resumeVacancyMatchRepository;

    /**
     * Создает новую вакансию.
     *
     * @param vacancyDto DTO с данными вакансии
     * @param user       пользователь, создающий вакансию
     * @return созданная вакансия в формате DTO
     */
    @Transactional
    public VacancyDto createVacancy(VacancyDto vacancyDto, User user) {
        log.info("Создание новой вакансии: {} (user={})", vacancyDto.getTitle(), user.getUsername());
        Vacancy vacancy = convertToEntity(vacancyDto);
        vacancy.setUser(user);
        Vacancy savedVacancy = vacancyRepository.save(vacancy);
        log.info("Вакансия успешно создана с ID: {}", savedVacancy.getId());
        return convertToDto(savedVacancy);
    }

    /**
     * Получает вакансию по ID.
     *
     * @param id ID вакансии
     * @return вакансия в формате DTO
     * @throws RuntimeException если вакансия не найдена
     */
    @Transactional(readOnly = true)
    public VacancyDto getVacancy(Long id) {
        log.info("Получение вакансии по ID: {}", id);
        return vacancyRepository.findById(id)
                .map(vacancy -> {
                    log.info("Вакансия найдена: {}", vacancy.getTitle());
                    return convertToDto(vacancy);
                })
                .orElseThrow(() -> {
                    log.error("Вакансия с ID {} не найдена", id);
                    return new RuntimeException("Vacancy not found");
                });
    }

    /**
     * Получает список всех вакансий пользователя.
     *
     * @param user пользователь
     * @return список вакансий в формате DTO
     */
    @Transactional(readOnly = true)
    public List<VacancyDto> getAllVacancies(User user) {
        log.info("Получение списка всех вакансий пользователя {}", user.getUsername());
        List<VacancyDto> vacancies = vacancyRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        log.info("Найдено {} вакансий", vacancies.size());
        return vacancies;
    }

    /**
     * Обновляет существующую вакансию.
     *
     * @param id         ID вакансии для обновления
     * @param vacancyDto DTO с новыми данными вакансии
     * @param user       пользователь, обновляющий вакансию
     * @return обновленная вакансия в формате DTO
     * @throws RuntimeException если вакансия не найдена или доступ запрещен
     */
    @Transactional
    public VacancyDto updateVacancy(Long id, VacancyDto vacancyDto, User user) {
        log.info("Обновление вакансии с ID: {} пользователем {}", id, user.getUsername());
        Vacancy existingVacancy = vacancyRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Вакансия с ID {} не найдена для обновления", id);
                    return new RuntimeException("Vacancy not found");
                });
        if (!existingVacancy.getUser().getId().equals(user.getId())) {
            log.warn("Пользователь {} пытался обновить чужую вакансию {}", user.getUsername(), id);
            throw new RuntimeException("Access denied");
        }
        updateEntityFromDto(existingVacancy, vacancyDto);
        Vacancy updatedVacancy = vacancyRepository.save(existingVacancy);
        log.info("Вакансия успешно обновлена: {}", updatedVacancy.getTitle());
        return convertToDto(updatedVacancy);
    }

    /**
     * Удаляет вакансию по ID.
     *
     * @param id   ID вакансии для удаления
     * @param user пользователь, удаляющий вакансию
     */
    @Transactional
    public void deleteVacancy(Long id, User user) {
        log.info("Удаление вакансии с ID: {} пользователем {}", id, user.getUsername());
        Vacancy existingVacancy = vacancyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));
        if (!existingVacancy.getUser().getId().equals(user.getId())) {
            log.warn("Пользователь {} пытался удалить чужую вакансию {}", user.getUsername(), id);
            throw new RuntimeException("Access denied");
        }
        vacancyRepository.deleteById(id);
        log.info("Вакансия с ID {} успешно удалена", id);
    }

    /**
     * Конвертирует DTO в сущность Vacancy.
     *
     * @param dto DTO для конвертации
     * @return сущность Vacancy
     */
    private Vacancy convertToEntity(VacancyDto dto) {
        Vacancy entity = new Vacancy();
        updateEntityFromDto(entity, dto);
        return entity;
    }

    /**
     * Обновляет поля сущности Vacancy из DTO.
     *
     * @param entity сущность для обновления
     * @param dto    DTO с новыми данными
     */
    private void updateEntityFromDto(Vacancy entity, VacancyDto dto) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setRequirements(dto.getRequirements());
        entity.setCompany(dto.getCompany());
        entity.setResponsibilities(dto.getResponsibilities());
        entity.setSkills(dto.getSkills());
        entity.setSalaryFrom(dto.getSalaryFrom());
        entity.setSalaryTo(dto.getSalaryTo());
        entity.setLocation(dto.getLocation());
        entity.setSource(dto.getSource());
        entity.setCurrency(dto.getCurrency());
        entity.setExperience(dto.getExperience());
        entity.setUrl(dto.getUrl());
        entity.setOriginalId(dto.getOriginalId());
        entity.setStatus(dto.getStatus());
        entity.setFormatWork(dto.getFormatWork());
    }

    /**
     * Конвертирует сущность Vacancy в DTO.
     *
     * @param entity сущность для конвертации
     * @return DTO
     */
    private VacancyDto convertToDto(Vacancy entity) {
        VacancyDto dto = new VacancyDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setRequirements(entity.getRequirements());
        dto.setCompany(entity.getCompany());
        dto.setResponsibilities(entity.getResponsibilities());
        dto.setSkills(entity.getSkills());
        dto.setSalaryFrom(entity.getSalaryFrom());
        dto.setSalaryTo(entity.getSalaryTo());
        dto.setLocation(entity.getLocation());
        dto.setSource(entity.getSource());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCurrency(entity.getCurrency());
        dto.setExperience(entity.getExperience());
        dto.setUrl(entity.getUrl());
        dto.setOriginalId(entity.getOriginalId());
        dto.setStatus(entity.getStatus());
        dto.setFormatWork(entity.getFormatWork());
        return dto;
    }

    public void parseAndSaveVacancy(String source, String url, User user) {
        RestTemplate restTemplate = new RestTemplate();
        String parseUrl = switch (source.toLowerCase()) {
            case "hh" -> "http://0.0.0.0:8001/parse/parse-vacancy";
            case "habr" -> "http://0.0.0.0:8001/parse/parse-habr-vacancy";
            case "getmatch" -> "http://0.0.0.0:8001/parse/parse-getmatch-vacancy";
            default -> throw new RuntimeException("Неизвестный source: " + source);
        };
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> body = Map.of("url", url);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(parseUrl, request, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> vacancyMap = (Map<String, Object>) response.getBody().get("vacancy");
            Vacancy vacancy = new Vacancy();
            vacancy.setTitle((String) vacancyMap.get("title"));
            vacancy.setCompany((String) vacancyMap.get("company"));
            vacancy.setDescription((String) vacancyMap.get("description"));
            vacancy.setSalaryFrom(vacancyMap.get("salary_from") != null ? ((Number) vacancyMap.get("salary_from")).intValue() : null);
            vacancy.setSalaryTo(vacancyMap.get("salary_to") != null ? ((Number) vacancyMap.get("salary_to")).intValue() : null);
            vacancy.setCurrency((String) vacancyMap.get("currency"));
            vacancy.setExperience((String) vacancyMap.get("experience"));
            vacancy.setUrl((String) vacancyMap.get("url"));
            vacancy.setSource(source);
            vacancy.setUser(user);
            vacancy.setStatus("Активная");
            // skills
            Object skillsObj = vacancyMap.get("skills");
            if (skillsObj instanceof java.util.List<?>) {
                vacancy.setSkills((java.util.List<String>) skillsObj);
            }
            // format_work
            if (vacancyMap.get("work_format") != null) {
                vacancy.setFormatWork((String) vacancyMap.get("work_format"));
            }
            vacancyRepository.save(vacancy);
        } else {
            throw new RuntimeException("Ошибка при парсинге вакансии: " + response.getStatusCode());
        }
    }

    public VacancyDto generateAndSaveVacancy(VacancyGenRequest request, User user) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://127.0.0.1:8000/parse/generate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Формируем тело запроса для AI
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("position", request.getPosition());
        body.put("company", request.getCompany());
        body.put("required_skills", request.getRequiredSkills());
        body.put("experience_years", request.getExperienceYears());
        body.put("location", request.getLocation());
        body.put("salary_range", request.getSalaryRange());
        body.put("company_description", request.getCompanyDescription());
        body.put("additional_info", request.getAdditionalInfo());
        HttpEntity<java.util.Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
        ResponseEntity<java.util.Map> response = restTemplate.postForEntity(url, httpEntity, java.util.Map.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Ошибка генерации вакансии: " + response.getStatusCode());
        }
        java.util.Map<String, Object> vacancyMap = response.getBody();
        Vacancy vacancy = new Vacancy();
        vacancy.setTitle((String) vacancyMap.get("title"));
        vacancy.setCompany((String) vacancyMap.get("company"));
        vacancy.setDescription((String) vacancyMap.get("description"));
        vacancy.setRequirements((String) vacancyMap.get("requirements"));
        vacancy.setResponsibilities((String) vacancyMap.get("responsibilities"));
        vacancy.setLocation((String) vacancyMap.get("location"));
        vacancy.setSource((String) vacancyMap.get("source"));
        vacancy.setCurrency((String) vacancyMap.get("currency"));
        vacancy.setExperience((String) vacancyMap.get("experience"));
        vacancy.setStatus("Активная");
        vacancy.setUser(user);
        // skills
        Object skillsObj = vacancyMap.get("skills");
        if (skillsObj instanceof java.util.List<?>) {
            vacancy.setSkills((java.util.List<String>) skillsObj);
        }
        // salaryFrom, salaryTo
        if (vacancyMap.get("salaryFrom") != null) {
            vacancy.setSalaryFrom(((Number) vacancyMap.get("salaryFrom")).intValue());
        }
        if (vacancyMap.get("salaryTo") != null) {
            vacancy.setSalaryTo(((Number) vacancyMap.get("salaryTo")).intValue());
        }
        vacancyRepository.save(vacancy);
        return convertToDto(vacancy);
    }

    public List<ResumeVacancyFastMatchRequest.VacancyDTO> getAllVacancyShort(User user) {
        List<VacancyShortView> shorts = vacancyRepository.findAllShortByUser(user);
        return shorts.stream().map(v -> {
            ResumeVacancyFastMatchRequest.VacancyDTO dto = new ResumeVacancyFastMatchRequest.VacancyDTO();
            dto.setId(v.getId());
            dto.setRequiredRole(v.getTitle());
            dto.setRequiredExperienceYears(v.getExperience());
            return dto;
        }).toList();
    }

    public Vacancy getVacancyById(Long id) {
        return vacancyRepository.findById(id).orElse(null);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        // 1. Всего вакансий
        long totalVacancies = vacancyRepository.count();
        stats.put("totalVacancies", totalVacancies);
        // 2. Активные вакансии
        long activeVacancies = vacancyRepository.countByStatus("Активная");
        stats.put("activeVacancies", activeVacancies);
        // 3. Всего кандидатов
        long totalCandidates = resumeRepository.count();
        stats.put("totalCandidates", totalCandidates);
        // 4. Кол-во вакансий в статусе 5
        long status5Vacancies = resumeRepository.countByStatus5(CandidateStatus.builder().id(5).build());
        stats.put("status5Vacancies", status5Vacancies);
        // 5. Кандидатов с высоким уровнем соответствия (score > 0.7)
        long highScoreCandidates = resumeVacancyMatchRepository.countByScoreGreaterThan(0.7);
        stats.put("highScoreCandidates", highScoreCandidates);
        // 6. Кол-во сопоставлений за сегодня
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        long matchesToday = resumeVacancyMatchRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        stats.put("matchesToday", matchesToday);
        return stats;
    }
} 