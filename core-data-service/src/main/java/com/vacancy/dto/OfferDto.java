package com.vacancy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Schema(description = "DTO для оффера")
public class OfferDto {
    @Schema(description = "ID оффера", example = "1")
    private Long id;

    @Schema(description = "ID заявки", example = "1")
    private Long applicationId;

    @Schema(description = "Текст оффера", example = "Предлагаем вам должность Java Developer")
    private String offerText;

    @Schema(description = "Путь к PDF файлу оффера", example = "/offers/offer_1.pdf")
    private String pdfFilePath;

    @Schema(description = "Дата создания оффера")
    private LocalDateTime createdAt;
} 