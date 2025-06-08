package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на полный матчинг резюме и вакансии")
public class ResumeVacancyMatchFullRequest {
    @Schema(description = "ID резюме", example = "6")
    private Integer resumeId;
    @Schema(description = "ID вакансии", example = "23")
    private Long vacancyId;
} 