package com.medac.trello.api.dto;

// Usado para recibir datos del cliente al crear o actualizar una Tarjeta.

public class CardRequestDTO {

    private String title;
    private String description;
    private Integer cardOrder;
    private Long idLista; // Clave: Solo se recibe el ID de la Lista padre
    private Long labelId;

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
}
