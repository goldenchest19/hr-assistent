package com.vacancy.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "vacancy")
public class Vacancy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String company;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.vacancy.model.ListToStringConverter.class)
    private List<String> skills;

    private Integer salaryFrom;

    private Integer salaryTo;

    private String location;

    private String source;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 10)
    private String currency;

    @Column(length = 100)
    private String experience;

    @Column(length = 1000)
    private String url;

    @Column(name = "original_id", length = 100)
    private String originalId;

    @Column(length = 50)
    private String status;

    @Column(name = "format_work", length = 50)
    private String formatWork;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 