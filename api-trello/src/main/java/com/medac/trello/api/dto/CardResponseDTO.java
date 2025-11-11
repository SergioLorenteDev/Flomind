package com.medac.trello.api.dto;

import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.Label;

import java.time.Instant;

public class CardResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Instant createdOn;
    private Instant expiresOn;
    private Integer cardOrder;
    private Long idLista;
    private Long boardId;
    private LabelResponseDTO label;

    public CardResponseDTO() {
    }

    public CardResponseDTO(Card card) {
        this.id = card.getId();
        this.title = card.getTitle();
        this.description = card.getDescription();
        this.createdOn = card.getCreatedOn();
        this.expiresOn = card.getExpiresOn();
        this.cardOrder = card.getCardOrder();

        //mapeo de lista y tablero
        this.idLista = card.getLista() != null ? card.getLista().getIdLista() : null;
        //mapeo de la etiqueta
        Label primaryLabel = card.getPrimaryLabel();
        this.label = primaryLabel != null ? new LabelResponseDTO(primaryLabel) : null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(Instant createdOn) {
        this.createdOn = createdOn;
    }

    public Integer getCardOrder() {
        return cardOrder;
    }

    public Instant getExpiresOn() { return expiresOn; }

    public void setExpiresOn(Instant expiresOn) { this.expiresOn = expiresOn; }

    public Long getBoardId() { return boardId; }

    public void setBoardId(Long boardId) { this.boardId = boardId; }

    public void setCardOrder(Integer cardOrder) {
        this.cardOrder = cardOrder;
    }

    public Long getIdLista() {
        return idLista;
    }

    public void setIdLista(Long idLista) {
        this.idLista = idLista;
    }

    public LabelResponseDTO getLabel() {
        return label;
    }

    public void setLabel(LabelResponseDTO label) {
        this.label = label;
    }
}

