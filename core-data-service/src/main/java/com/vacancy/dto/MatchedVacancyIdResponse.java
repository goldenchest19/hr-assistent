package com.vacancy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchedVacancyIdResponse {
    @JsonProperty("matched_vacancy_ids")
    private List<Long> matchedVacancyIds;
}
