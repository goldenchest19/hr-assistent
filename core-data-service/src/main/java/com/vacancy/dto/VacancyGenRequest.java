package com.vacancy.dto;

import lombok.Data;
import java.util.List;

@Data
public class VacancyGenRequest {
    private String position;
    private String company;
    private List<String> requiredSkills;
    private int experienceYears;
    private String location;
    private String salaryRange;
    private String companyDescription;
    private String additionalInfo;
} 