package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Schema(description = "DTO для отклика на вакансию")
public class JobApplicationDto {
    @Schema(description = "ID отклика", example = "1")
    private Long id;

    @Schema(description = "ID резюме", example = "1")
    private Integer resumeId;

    @Schema(description = "ID вакансии", example = "1")
    private Long vacancyId;

    @Schema(description = "Статус отклика", example = "new")
    private String status = "new";

    @Schema(description = "Процент соответствия", example = "85.5")
    private Float matchScore;

    @Schema(description = "Дата создания отклика")
    private LocalDateTime createdAt;
} 