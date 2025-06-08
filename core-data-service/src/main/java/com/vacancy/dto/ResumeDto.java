package com.vacancy.dto;

import com.vacancy.model.CandidateStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO для передачи данных резюме.
 */
@Data
@Schema(description = "DTO для резюме")
public class ResumeDto {
    @Schema(description = "ID резюме", example = "1")
    private Integer id;

    @Schema(description = "Email кандидата", example = "ivanov@example.com")
    private String email;

    @Schema(description = "Имя кандидата", example = "Иванов Иван Иванович")
    private String name;

    @Schema(description = "Телефон кандидата", example = "+7 (999) 123-45-67")
    private String phone;

    @Schema(description = "Желаемая роль", example = "Java Developer")
    private String role;

    @Schema(description = "Hard skills", example = "[\"Java\", \"Spring\"]")
    private List<String> hardSkills;

    @Schema(description = "Soft skills", example = "[\"Teamwork\", \"Communication\"]")
    private List<String> softSkills;

    @Schema(description = "Образование", example = "[{\"university\":\"МГУ\"}]")
    private List<Map<String, Object>> education;

    @Schema(description = "Опыт работы", example = "[{\"company\":\"Яндекс\"}]")
    private List<Map<String, Object>> workExperience;

    @Schema(description = "PDF файл резюме в формате base64")
    private String pdfFile;

    @Schema(description = "Источник резюме", example = "hh.ru")
    private String source;

    @Schema(description = "Дата создания резюме")
    private LocalDateTime createdAt;

    private CandidateStatus candidateStatus;

    // Новое поле: подходящие вакансии для резюме
    @Schema(description = "Список подходящих вакансий для резюме")
    private List<MatchedVacancyShortDto> matchedVacancies;

    @Data
    @Schema(description = "Краткая информация о подходящей вакансии")
    public static class MatchedVacancyShortDto {
        @Schema(description = "ID вакансии")
        private Long vacancyId;
        @Schema(description = "Название вакансии")
        private String title;
    }
} 