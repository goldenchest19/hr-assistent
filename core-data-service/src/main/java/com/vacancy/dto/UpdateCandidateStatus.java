package com.vacancy.dto;

import com.vacancy.model.CandidateStatus;
import lombok.Data;

@Data
public class UpdateCandidateStatus {
    private Integer resumeId;
    private Integer statusId;
}
