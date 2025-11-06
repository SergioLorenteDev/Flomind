package com.medac.trello.api.dto;

import com.fasterxml.jackson.annotation.JsonSetter;

// Usado para recibir datos del cliente al crear o actualizar una Tarjeta.

public class CardRequestDTO {

    private String title;
    private String description;
    private Integer cardOrder;
    private Long idLista; // Clave: Solo se recibe el ID de la Lista padre
    private Long labelId;
    private java.time.Instant startsOn;
    private java.time.Instant expiresOn;
    private boolean startsOnPresent;
    private boolean expiresOnPresent;

    // --- Getters y Setters ---

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCardOrder() { return cardOrder; }
    public void setCardOrder(Integer cardOrder) { this.cardOrder = cardOrder; }

    public Long getIdLista() { return idLista; }
    public void setIdLista(Long idLista) { this.idLista = idLista; }

    public Long getLabelId() { return labelId; }
    public void setLabelId(Long labelId) { this.labelId = labelId; }

    public java.time.Instant getStartsOn() {
        return startsOn;
    }

    @JsonSetter("startsOn")
    public void setStartsOn(java.time.Instant startsOn) {
        this.startsOn = startsOn;
        this.startsOnPresent = true;
    }

    public java.time.Instant getExpiresOn() {
        return expiresOn;
    }

    @JsonSetter("expiresOn")
    public void setExpiresOn(java.time.Instant expiresOn) {
        this.expiresOn = expiresOn;
        this.expiresOnPresent = true;
    }

    public boolean isStartsOnPresent() {
        return startsOnPresent;
    }

    public boolean isExpiresOnPresent() {
        return expiresOnPresent;
    }
}
