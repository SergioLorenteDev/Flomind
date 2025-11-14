package com.medac.trello.api.dto;

import com.medac.trello.api.model.notification.Notification;

import java.time.Instant;

public class NotificationResponseDTO {

    private final Long id;
    private final String description;
    private final Instant createdOn;
    private final Long sourceUser;
    private final Long destinationUser;

    public NotificationResponseDTO(Notification notification) {
        this.id = notification.getId();
        this.description = notification.getDescription();
        this.createdOn = notification.getCreatedOn();
        this.sourceUser = notification.getSourceUserId();
        this.destinationUser = notification.getDestinationUserId();
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Long getSourceUser() {
        return sourceUser;
    }

    public Long getDestinationUser() {
        return destinationUser;
    }
}
