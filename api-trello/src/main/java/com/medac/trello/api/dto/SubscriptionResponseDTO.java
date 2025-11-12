package com.medac.trello.api.dto;

import com.medac.trello.api.model.Subscription;

import java.time.LocalDate;

public class SubscriptionResponseDTO {
    private Long id;
    private String planName;
    private LocalDate expirationDate;
    private boolean isActive;

    // Constructor que acepta la entidad Subscription y Getters/Setters...
    public SubscriptionResponseDTO(Subscription subscription) {
        this.id = subscription.getId();
        this.planName = subscription.getPlanName();
        this.expirationDate = subscription.getExpirationDate();
        this.isActive = subscription.isActive();
    }
}
