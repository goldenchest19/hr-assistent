package com.vacancy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CandidateDTO {
    private UUID id;
    private String name;
    private String phone;
    private String role;
    @JsonProperty("hard_skills")
    private List<String> hardSkills;
    @JsonProperty("soft_skills")
    private List<String> softSkills;
    private List<Education> education;
    @JsonProperty("work_experience")
    private List<WorkExperience> workExperience;


    @Data
    public static class Education {
        private String degree;
        private String direction;
        private String specialty;
    }

    @Data
    public static class WorkExperience {
        @JsonProperty("start_date")
        private String startDate;
        @JsonProperty("end_date")
        private String endDate;
        @JsonProperty("company_name")
        private String companyName;
        private List<String> achievements;
        private List<String> technologies;
    }
}
