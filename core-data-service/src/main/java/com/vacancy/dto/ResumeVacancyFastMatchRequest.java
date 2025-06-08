package com.vacancy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ResumeVacancyFastMatchRequest {

    private ResumeDTO resume;

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class ResumeDTO {
        private Integer id;
        @JsonProperty("desired_role")
        private String desiredRole;
        private List<WorkExperienceDTO> workExperience;
        private List<VacancyDTO> vacancy;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class WorkExperienceDTO {
        @JsonProperty("start_date")
        private String startDate;
        @JsonProperty("end_date")
        private String endDate;
        @JsonProperty("company_name")
        private String companyName;
        private List<String> achievements;
        private List<String> technologies;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class VacancyDTO {
        private Integer id;
        @JsonProperty("required_role")
        private String requiredRole;
        @JsonProperty("required_experience_years")
        private String requiredExperienceYears;
    }
}
