package com.medac.trello.api.dto;

import com.medac.trello.api.model.Card;
import java.time.Instant;

// Usado para enviar datos al cliente.

public class CardResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Instant createdOn;
    private Integer cardOrder;
    private Long idLista; // Clave: Solo se envía el ID de la Lista padre

    // --- Constructor de Mapeo (desde la Entidad) ---
    public CardResponseDTO(Card card) {
        this.id = card.getId();
        this.title = card.getTitle();
        this.description = card.getDescription();
        this.createdOn = card.getCreatedOn();
        this.cardOrder = card.getCardOrder();
        // Asumiendo que tienes un getter de conveniencia en Card,
        // o accedes al ID a través de la relación (card.getLista().getIdLista()).
        // Usaremos el acceso directo, asumiendo que la relación no es nula.
        this.idLista = card.getLista() != null ? card.getLista().getIdLista() : null;
    }

    // Constructor vacío
    public CardResponseDTO() {}

    // --- Getters y Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    public Integer getCardOrder() { return cardOrder; }
    public void setCardOrder(Integer cardOrder) { this.cardOrder = cardOrder; }

    public Long getIdLista() { return idLista; }
    public void setIdLista(Long idLista) { this.idLista = idLista; }
}