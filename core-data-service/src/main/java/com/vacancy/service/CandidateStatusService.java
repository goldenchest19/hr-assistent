package com.vacancy.service;

import com.vacancy.dto.CandidateStatusDto;
import com.vacancy.model.CandidateStatus;
import com.vacancy.repository.CandidateStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateStatusService {
    private final CandidateStatusRepository candidateStatusRepository;

    public List<CandidateStatusDto> findAll() {
        return candidateStatusRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<CandidateStatusDto> findById(Integer id) {
        return candidateStatusRepository.findById(id).map(this::toDto);
    }

    public CandidateStatusDto create(CandidateStatusDto dto) {
        CandidateStatus status = new CandidateStatus();
        status.setDescription(dto.getDescription());
        status.setTitle(dto.getTitle());
        CandidateStatus saved = candidateStatusRepository.save(status);
        return toDto(saved);
    }

    public Optional<CandidateStatusDto> update(Integer id, CandidateStatusDto dto) {
        return candidateStatusRepository.findById(id).map(status -> {
            status.setDescription(dto.getDescription());
            status.setTitle(dto.getTitle());
            CandidateStatus updated = candidateStatusRepository.save(status);
            return toDto(updated);
        });
    }

    public void delete(Integer id) {
        candidateStatusRepository.deleteById(id);
    }

    private CandidateStatusDto toDto(CandidateStatus status) {
        CandidateStatusDto dto = new CandidateStatusDto();
        dto.setId(status.getId());
        dto.setDescription(status.getDescription());
        dto.setTitle(status.getTitle());
        return dto;
    }
} 