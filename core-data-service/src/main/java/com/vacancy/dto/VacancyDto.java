package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "DTO для вакансии")
public class VacancyDto {
    @Schema(description = "ID вакансии", example = "1")
    private Long id;

    @Schema(description = "Название вакансии", example = "Java Developer")
    private String title;

    @Schema(description = "Описание вакансии", example = "Looking for experienced Java developer")
    private String description;

    @Schema(description = "Требования к кандидату", example = "Java, Spring, PostgreSQL")
    private String requirements;

    @Schema(description = "Название компании", example = "Tech Company")
    private String company;

    @Schema(description = "Обязанности", example = "Development of backend services")
    private String responsibilities;

    @Schema(description = "Необходимые навыки", example = "[\"Java\", \"Spring Boot\", \"REST API\"]")
    private List<String> skills;

    @Schema(description = "Минимальная зарплата", example = "100000")
    private Integer salaryFrom;

    @Schema(description = "Максимальная зарплата", example = "200000")
    private Integer salaryTo;

    @Schema(description = "Местоположение", example = "Moscow")
    private String location;

    @Schema(description = "Источник вакансии", example = "hh.ru")
    private String source;

    @Schema(description = "Дата создания вакансии")
    private LocalDateTime createdAt;

    @Schema(description = "Валюта", example = "RUB")
    private String currency;

    @Schema(description = "Опыт", example = "3-5 лет")
    private String experience;

    @Schema(description = "URL вакансии", example = "https://hh.ru/vacancy/123")
    private String url;

    @Schema(description = "Оригинальный ID", example = "hh-123456")
    private String originalId;

    @Schema(description = "Статус вакансии", example = "open")
    private String status;

    @Schema(description = "Формат работы", example = "Удаленно")
    private String formatWork;
} 