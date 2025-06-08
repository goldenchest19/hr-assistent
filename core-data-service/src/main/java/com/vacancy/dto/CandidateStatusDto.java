package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "DTO для статуса кандидата")
public class CandidateStatusDto {
    @Schema(description = "ID статуса", example = "1")
    private Integer id;

    @Schema(description = "Описание статуса", example = "Устанавливается при добавлении резюме в базу")
    private String description;

    @Schema(description = "Название статуса", example = "На рассмотрении")
    private String title;
} 