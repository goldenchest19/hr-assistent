package com.vacancy.service;

import com.vacancy.dto.OfferDto;
import com.vacancy.model.Offer;
import com.vacancy.repository.JobApplicationRepository;
import com.vacancy.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {
    private final OfferRepository offerRepository;
    private final JobApplicationRepository applicationRepository;

    @Transactional
    public OfferDto createOffer(OfferDto offerDto) {
        log.info("Создание нового оффера для заявки: {}", offerDto.getApplicationId());
        Offer offer = convertToEntity(offerDto);
        Offer savedOffer = offerRepository.save(offer);
        log.info("Оффер успешно создан с ID: {}", savedOffer.getId());
        return convertToDto(savedOffer);
    }

    @Transactional(readOnly = true)
    public OfferDto getOffer(Long id) {
        log.info("Получение оффера по ID: {}", id);
        return offerRepository.findById(id)
                .map(offer -> {
                    log.info("Оффер найден для заявки: {}", offer.getApplication().getId());
                    return convertToDto(offer);
                })
                .orElseThrow(() -> {
                    log.error("Оффер с ID {} не найден", id);
                    return new RuntimeException("Offer not found");
                });
    }

    @Transactional(readOnly = true)
    public List<OfferDto> getAllOffers() {
        log.info("Получение списка всех офферов");
        List<OfferDto> offers = offerRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        log.info("Найдено {} офферов", offers.size());
        return offers;
    }

    @Transactional
    public OfferDto updateOffer(Long id, OfferDto offerDto) {
        log.info("Обновление оффера с ID: {}", id);
        Offer existingOffer = offerRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Оффер с ID {} не найден для обновления", id);
                    return new RuntimeException("Offer not found");
                });
        
        updateEntityFromDto(existingOffer, offerDto);
        Offer updatedOffer = offerRepository.save(existingOffer);
        log.info("Оффер успешно обновлен для заявки: {}", updatedOffer.getApplication().getId());
        return convertToDto(updatedOffer);
    }

    @Transactional
    public void deleteOffer(Long id) {
        log.info("Удаление оффера с ID: {}", id);
        if (offerRepository.existsById(id)) {
            offerRepository.deleteById(id);
            log.info("Оффер с ID {} успешно удален", id);
        } else {
            log.warn("Попытка удаления несуществующего оффера с ID: {}", id);
        }
    }

    private Offer convertToEntity(OfferDto dto) {
        Offer entity = new Offer();
        updateEntityFromDto(entity, dto);
        return entity;
    }

    private void updateEntityFromDto(Offer entity, OfferDto dto) {
        entity.setApplication(applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found")));
        entity.setOfferText(dto.getOfferText());
        entity.setPdfFilePath(dto.getPdfFilePath());
    }

    private OfferDto convertToDto(Offer entity) {
        OfferDto dto = new OfferDto();
        dto.setId(entity.getId());
        dto.setApplicationId(entity.getApplication().getId());
        dto.setOfferText(entity.getOfferText());
        dto.setPdfFilePath(entity.getPdfFilePath());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
} 