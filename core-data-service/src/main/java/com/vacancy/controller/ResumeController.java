package com.vacancy.controller;

import com.vacancy.dto.ResumeDto;
import com.vacancy.dto.UpdateCandidateStatus;
import com.vacancy.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.vacancy.model.User;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;

/**
 * Контроллер для работы с резюме.
 * Предоставляет REST API для CRUD операций с резюме.
 */
@Slf4j
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume Controller", description = "API для управления резюме")
public class ResumeController {
    private final ResumeService resumeService;

    /**
     * Создает новое резюме.
     *
     * @param resumeDto DTO с данными резюме
     * @param user      текущий пользователь
     * @return созданное резюме
     */
    @PostMapping
    @Operation(summary = "Создание нового резюме")
    public ResponseEntity<ResumeDto> createResume(@RequestBody ResumeDto resumeDto, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на создание резюме для кандидата: {} (user={})", resumeDto.getName(), user.getUsername());
        ResumeDto createdResume = resumeService.createResume(resumeDto, user);
        log.info("Резюме успешно создано с ID: {}", createdResume.getId());
        return ResponseEntity.ok(createdResume);
    }

    /**
     * Получает резюме по ID.
     *
     * @param id ID резюме
     * @return резюме
     */
    @GetMapping("/{id}")
    @Operation(summary = "Получение резюме по ID")
    public ResponseEntity<ResumeDto> getResume(@PathVariable Integer id) {
        log.info("Получен запрос на получение резюме с ID: {}", id);
        ResumeDto resume = resumeService.getResume(id);
        log.info("Резюме успешно получено для ID: {}", resume.getId());
        return ResponseEntity.ok(resume);
    }

    /**
     * Получает список всех резюме.
     *
     * @param user текущий пользователь
     * @return список резюме
     */
    @GetMapping
    @Operation(summary = "Получение списка всех резюме")
    public ResponseEntity<List<ResumeDto>> getAllResumes(@AuthenticationPrincipal User user) {
        log.info("Получен запрос на получение списка всех резюме пользователя {}", user.getUsername());
        List<ResumeDto> resumes = resumeService.getAllResumes(user);
        log.info("Успешно получено {} резюме", resumes.size());
        return ResponseEntity.ok(resumes);
    }

    /**
     * Обновляет существующее резюме.
     *
     * @param id        ID резюме
     * @param resumeDto DTO с новыми данными резюме
     * @param user      текущий пользователь
     * @return обновленное резюме
     */
    @PutMapping("/{id}")
    @Operation(summary = "Обновление резюме")
    public ResponseEntity<ResumeDto> updateResume(@PathVariable Integer id, @RequestBody ResumeDto resumeDto, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на обновление резюме с ID: {} пользователем {}", id, user.getUsername());
        ResumeDto updatedResume = resumeService.updateResume(id, resumeDto, user);
        log.info("Резюме успешно обновлено для ID: {}", updatedResume.getId());
        return ResponseEntity.ok(updatedResume);
    }

    /**
     * Удаляет резюме по ID.
     *
     * @param id   ID резюме
     * @param user текущий пользователь
     * @return статус операции
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление резюме")
    public ResponseEntity<Void> deleteResume(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        log.info("Получен запрос на удаление резюме с ID: {} пользователем {}", id, user.getUsername());
        resumeService.deleteResume(id, user);
        log.info("Резюме с ID {} успешно удалено", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузка PDF резюме и email, сохранение и нормализация")
    public ResponseEntity<Void> uploadResume(
            @RequestParam("email") String email,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        resumeService.uploadAndNormalizeResume(email, file, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/update-status", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Обновление статуса для кандидата")
    public ResponseEntity<Void> uploadResume(
            @RequestBody UpdateCandidateStatus dto,
            @AuthenticationPrincipal User user) {
        resumeService.updateStatus(dto.getResumeId(), dto.getStatusId());
        return ResponseEntity.ok().build();
    }
} 