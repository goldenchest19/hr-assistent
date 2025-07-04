package com.vacancy.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonUtils {
    private final ObjectMapper objectMapper;

    public JsonUtils(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Преобразует объект в JSON-строку.
     *
     * @param object объект для сериализации
     * @return JSON-представление объекта
     * @throws RuntimeException если произошла ошибка сериализации
     */
    public String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка при преобразовании объекта в JSON", e);
        }
    }
}
