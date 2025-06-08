package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "DTO для соответствия резюме и вакансии")
public class ResumeVacancyMatchRequestDto {
    @Schema(description = "ID соответствия", example = "1")
    private Integer id;

    @Schema(description = "ID резюме", example = "6")
    private Integer resumeId;

    @Schema(description = "ID вакансии", example = "3")
    private Long vacancyId;

    @Schema(description = "Совпавшие навыки", example = "[\"Java\", \"Spring\"]")
    private List<String> matchedSkills;

    @Schema(description = "Несовпавшие навыки", example = "[\"MongoDB\", \"Redis\"]")
    private List<String> unmatchedSkills;

    @Schema(description = "Комментарий LLM", example = "Кандидат подходит на позицию, но не senior")
    private String llmComment;

    @Schema(description = "Дата создания")
    private LocalDateTime createdAt;

    @Schema(description = "Оценка соответствия", example = "0.3")
    private Double score;

    @Schema(description = "Положительные стороны", example = "[\"Опыт работы соответствует требованиям\"]")
    private List<String> positives;

    @Schema(description = "Отрицательные стороны", example = "[\"Нет опыта с MongoDB\"]")
    private List<String> negatives;

    @Schema(description = "Вердикт", example = "Среднее соответствие")
    private String verdict;

    @Schema(description = "Уточняющие вопросы", example = "[\"Опыт работы с высоконагруженными системами?\"]")
    private List<String> clarifyingQuestions;

    @Schema(description = "ID пользователя, создавшего соответствие", example = "1")
    private Long userId;
} 