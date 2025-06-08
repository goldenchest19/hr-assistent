package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

@Data
@Schema(description = "DTO для запроса к внешнему сервису матчинга")
public class ResumeVacancyMatchExternalRequest {
    @Schema(description = "Резюме")
    private ResumeExternal resume;
    @Schema(description = "Вакансия")
    private VacancyExternal vacancy;

    @Data
    public static class ResumeExternal {
        private Integer id;
        private String email;
        private String name;
        private String phone;
        private String role;
        private List<String> hardSkills;
        private List<String> softSkills;
        private List<Education> education;
        private List<WorkExperience> workExperience;

        @Data
        public static class Education {
            private String degree;
            private String direction;
            private String specialty;
        }
        @Data
        public static class WorkExperience {
            private String end_date;
            private String start_date;
            private List<String> achievements;
            private String company_name;
            private List<String> technologies;
        }
    }

    @Data
    public static class VacancyExternal {
        private Long id;
        private String title;
        private String description;
        private String requirements;
        private String company;
        private String responsibilities;
        private List<String> skills;
        private Integer salaryFrom;
        private Integer salaryTo;
        private String location;
        private String source;
        private String createdAt;
        private String currency;
        private String experience;
        private String url;
        private String originalId;
        private String status;
        private String formatWork;
    }
} 