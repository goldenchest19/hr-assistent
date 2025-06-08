package com.vacancy.controller;

import com.vacancy.dto.ResumeVacancyMatchFullRequest;
import com.vacancy.dto.ResumeVacancyMatchRequestDto;
import com.vacancy.dto.ResumeVacancyMatchResponseDto;
import com.vacancy.model.User;
import com.vacancy.service.ResumeVacancyMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/resume-vacancy-matches")
@RequiredArgsConstructor
@Tag(name = "ResumeVacancyMatch Controller", description = "API для соответствий резюме и вакансий")
public class ResumeVacancyMatchController {
    private final ResumeVacancyMatchService matchService;

    @PostMapping
    @Operation(summary = "Создать соответствие резюме и вакансии")
    public ResponseEntity<ResumeVacancyMatchRequestDto> create(@RequestBody ResumeVacancyMatchRequestDto dto, @AuthenticationPrincipal User user) {
        log.info("Создание соответствия резюме {} и вакансии {} пользователем {}", dto.getResumeId(), dto.getVacancyId(), user.getUsername());
        ResumeVacancyMatchRequestDto created = matchService.create(dto, user);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить соответствие по ID")
    public ResponseEntity<ResumeVacancyMatchRequestDto> getById(@PathVariable Integer id) {
        ResumeVacancyMatchRequestDto match = matchService.getById(id);
        return ResponseEntity.ok(match);
    }

    @GetMapping
    @Operation(summary = "Получить все соответствия")
    public ResponseEntity<List<ResumeVacancyMatchRequestDto>> getAll() {
        List<ResumeVacancyMatchRequestDto> matches = matchService.getAll();
        return ResponseEntity.ok(matches);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить соответствие по ID")
    public ResponseEntity<ResumeVacancyMatchRequestDto> update(@PathVariable Integer id, @RequestBody ResumeVacancyMatchRequestDto dto, @AuthenticationPrincipal User user) {
        ResumeVacancyMatchRequestDto updated = matchService.update(id, dto, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить соответствие по ID")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        matchService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/full")
    @Operation(summary = "Полный матчинг резюме и вакансии через LLM")
    public ResponseEntity<ResumeVacancyMatchResponseDto> matchFull(@RequestBody ResumeVacancyMatchFullRequest request, @AuthenticationPrincipal User user) {
        ResumeVacancyMatchResponseDto result = matchService.matchFull(request, user);
        log.info("Запрос для сопоставления резюме-вакансии успешно выполнен");
        return ResponseEntity.ok(result);
    }
} 