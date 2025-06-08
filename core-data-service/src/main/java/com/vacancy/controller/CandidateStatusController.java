package com.vacancy.controller;

import com.vacancy.dto.CandidateStatusDto;
import com.vacancy.service.CandidateStatusService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate-status")
@RequiredArgsConstructor
public class CandidateStatusController {
    private final CandidateStatusService candidateStatusService;

    @GetMapping
    @Operation(summary = "Получить все статусы кандидата")
    public List<CandidateStatusDto> getAll() {
        return candidateStatusService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить статус кандидата по id")
    public ResponseEntity<CandidateStatusDto> getById(@PathVariable Integer id) {
        return candidateStatusService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Создать новый статус кандидата")
    public CandidateStatusDto create(@RequestBody CandidateStatusDto dto) {
        return candidateStatusService.create(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить статус кандидата по id")
    public ResponseEntity<CandidateStatusDto> update(@PathVariable Integer id, @RequestBody CandidateStatusDto dto) {
        return candidateStatusService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить статус кандидата по id")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        candidateStatusService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 