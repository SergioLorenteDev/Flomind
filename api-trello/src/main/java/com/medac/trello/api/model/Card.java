package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "tarjeta")
public class Card {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_tarjeta")
    private Long id;
    @Column(name = "titulo", nullable = false)
    private String title;
    @Column(name = "descripcion")
    private String description;
    @Column(name = "fecha_creacion", nullable = false)
    private Instant createdOn;
    @Column(name = "fecha_vencimiento", nullable = false)
    private Instant expiresOn;
    @Column(name = "orden", nullable = false)
    private int order;
    @Column(name = "id_lista", nullable = false)
    private Long owningListId;

    public Card(String title, Instant createdOn, Instant expiresOn, int order, Long owningListId) {
        this.title = title;
        this.createdOn = createdOn;
        this.expiresOn = expiresOn;
        this.order = order;
        this.owningListId = owningListId;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Instant getExpiresOn() {
        return expiresOn;
    }

    public int getOrder() {
        return order;
    }

    public Long getOwningListId() {
        return owningListId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCreatedOn(Instant createdOn) {
        this.createdOn = createdOn;
    }

    public void setExpiresOn(Instant expiresOn) {
        this.expiresOn = expiresOn;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public void setOwningListId(Long owningListId) {
        this.owningListId = owningListId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Card card = (Card) o;
        return id.equals(card.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
