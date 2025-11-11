package com.medac.trello.api.dto;

import com.medac.trello.api.model.Subscription;

public record SubscriptionResponseDTO(
        Long userId,
        String status,
        String plan, // free o pro
        String stripeSubscriptionId
) {
    public SubscriptionResponseDTO(Subscription subscription) {
        this(
                subscription.getUserId(),
                subscription.getStatus(),
                // Lógica simple para determinar el plan basado en el estado
                subscription.getStatus().equals("ACTIVE") ? "PRO" : "FREE",
                subscription.getStripeSubscriptionId()
        );
    }
}