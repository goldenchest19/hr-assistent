package com.vacancy.controller;

import com.vacancy.dto.OfferDto;
import com.vacancy.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Tag(name = "Offer Controller", description = "API для управления офферами")
public class OfferController {
    private final OfferService offerService;

    @PostMapping
    @Operation(summary = "Создание нового оффера")
    public ResponseEntity<OfferDto> createOffer(@RequestBody OfferDto offerDto) {
        log.info("Получен запрос на создание оффера для заявки: {}", offerDto.getApplicationId());
        OfferDto createdOffer = offerService.createOffer(offerDto);
        log.info("Оффер успешно создан с ID: {}", createdOffer.getId());
        return ResponseEntity.ok(createdOffer);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получение оффера по ID")
    public ResponseEntity<OfferDto> getOffer(@PathVariable Long id) {
        log.info("Получен запрос на получение оффера с ID: {}", id);
        OfferDto offer = offerService.getOffer(id);
        log.info("Оффер успешно получен для заявки: {}", offer.getApplicationId());
        return ResponseEntity.ok(offer);
    }

    @GetMapping
    @Operation(summary = "Получение списка всех офферов")
    public ResponseEntity<List<OfferDto>> getAllOffers() {
        log.info("Получен запрос на получение списка всех офферов");
        List<OfferDto> offers = offerService.getAllOffers();
        log.info("Успешно получено {} офферов", offers.size());
        return ResponseEntity.ok(offers);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновление оффера")
    public ResponseEntity<OfferDto> updateOffer(@PathVariable Long id, @RequestBody OfferDto offerDto) {
        log.info("Получен запрос на обновление оффера с ID: {}", id);
        OfferDto updatedOffer = offerService.updateOffer(id, offerDto);
        log.info("Оффер успешно обновлен для заявки: {}", updatedOffer.getApplicationId());
        return ResponseEntity.ok(updatedOffer);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление оффера")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        log.info("Получен запрос на удаление оффера с ID: {}", id);
        offerService.deleteOffer(id);
        log.info("Оффер с ID {} успешно удален", id);
        return ResponseEntity.ok().build();
    }
} 