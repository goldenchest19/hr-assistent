package com.vacancy.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.List;

@Converter(autoApply = false)
public class ListToJsonConverter implements AttributeConverter<List, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List attribute) {
        if (attribute == null) return null;
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Ошибка сериализации List в JSON", e);
        }
    }

    @Override
    public List convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return objectMapper.readValue(dbData, List.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Ошибка десериализации JSON в List", e);
        }
    }
} 