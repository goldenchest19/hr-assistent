package com.vacancy.controller;

import com.vacancy.dto.VacancyDto;
import com.vacancy.dto.VacancyParseRequest;
import com.vacancy.dto.VacancyGenRequest;
import com.vacancy.model.User;
import com.vacancy.service.VacancyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST контроллер для управления вакансиями.
 * Предоставляет CRUD операции через HTTP endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/vacancies")
@RequiredArgsConstructor
@Tag(name = "Vacancy Controller", description = "API для управления вакансиями")
public class VacancyController {
    private final VacancyService vacancyService;

    /**
     * Создает новую вакансию.
     *
     * @param vacancyDto DTO с данными вакансии
     * @param user текущий пользователь
     * @return созданная вакансия в формате DTO
     */
    @PostMapping
    @Operation(summary = "Создание новой вакансии")
    public ResponseEntity<VacancyDto> createVacancy(@RequestBody VacancyDto vacancyDto, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на создание вакансии: {} (user={})", vacancyDto.getTitle(), user.getUsername());
        VacancyDto createdVacancy = vacancyService.createVacancy(vacancyDto, user);
        log.info("Вакансия успешно создана с ID: {}", createdVacancy.getId());
        return ResponseEntity.ok(createdVacancy);
    }

    /**
     * Получает вакансию по ID.
     *
     * @param id ID вакансии
     * @return вакансия в формате DTO
     */
    @GetMapping("/{id}")
    @Operation(summary = "Получение вакансии по ID")
    public ResponseEntity<VacancyDto> getVacancy(@PathVariable Long id) {
        log.info("Получен запрос на получение вакансии с ID: {}", id);
        VacancyDto vacancy = vacancyService.getVacancy(id);
        log.info("Вакансия найдена: {}", vacancy.getTitle());
        return ResponseEntity.ok(vacancy);
    }

    /**
     * Получает список всех вакансий.
     *
     * @param user текущий пользователь
     * @return список вакансий в формате DTO
     */
    @GetMapping
    @Operation(summary = "Получение списка всех вакансий")
    public ResponseEntity<List<VacancyDto>> getAllVacancies(@AuthenticationPrincipal User user) {
        log.info("Получен запрос на получение списка всех вакансий пользователя {}", user.getUsername());
        List<VacancyDto> vacancies = vacancyService.getAllVacancies(user);
        log.info("Найдено {} вакансий", vacancies.size());
        return ResponseEntity.ok(vacancies);
    }

    /**
     * Обновляет существующую вакансию.
     *
     * @param id ID вакансии для обновления
     * @param vacancyDto DTO с новыми данными вакансии
     * @param user текущий пользователь
     * @return обновленная вакансия в формате DTO
     */
    @PutMapping("/{id}")
    @Operation(summary = "Обновление вакансии")
    public ResponseEntity<VacancyDto> updateVacancy(@PathVariable Long id, @RequestBody VacancyDto vacancyDto, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на обновление вакансии с ID: {} пользователем {}", id, user.getUsername());
        VacancyDto updatedVacancy = vacancyService.updateVacancy(id, vacancyDto, user);
        log.info("Вакансия успешно обновлена: {}", updatedVacancy.getTitle());
        return ResponseEntity.ok(updatedVacancy);
    }

    /**
     * Удаляет вакансию по ID.
     *
     * @param id ID вакансии для удаления
     * @param user текущий пользователь
     * @return пустой ответ со статусом OK
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление вакансии")
    public ResponseEntity<Void> deleteVacancy(@PathVariable Long id, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на удаление вакансии с ID: {} пользователем {}", id, user.getUsername());
        vacancyService.deleteVacancy(id, user);
        log.info("Вакансия с ID {} успешно удалена", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/parse")
    @Operation(summary = "Парсинг и сохранение вакансии по ссылке")
    public ResponseEntity<?> parseAndSaveVacancy(@RequestBody VacancyParseRequest request, @AuthenticationPrincipal User user) {
        vacancyService.parseAndSaveVacancy(request.getSource(), request.getUrl(), user);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/generate")
    @Operation(summary = "Генерация и сохранение вакансии через AI")
    public ResponseEntity<VacancyDto> generateAndSaveVacancy(@RequestBody VacancyGenRequest request, @AuthenticationPrincipal User user) {
        VacancyDto vacancyDto = vacancyService.generateAndSaveVacancy(request, user);
        return ResponseEntity.ok(vacancyDto);
    }

    @GetMapping("/stats")
    @Operation(summary = "Получить статистику по вакансиям и кандидатам")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(vacancyService.getStats());
    }
} 