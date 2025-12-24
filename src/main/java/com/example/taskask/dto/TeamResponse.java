package com.example.taskask.dto;

public record TeamResponse(
        Long id,
        String name,
        Long leadId,
        String leadName,
        String leadEmail
) {}
