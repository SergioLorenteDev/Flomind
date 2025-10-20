package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "tarjeta")
public class Card {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_tarjeta")
    private long id;
    @Column(name = "titulo", nullable = false)
    private String title;
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdOn;
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate expiresOn;
    @Column(name = "orden", nullable = false)
    private int order;
    @Column(name = "id_lista", nullable = false)
    private long owningListId;

    public Card(String title, LocalDateTime createdOn, LocalDate expiresOn, int order, long owningListId) {
        this.title = title;
        this.createdOn = createdOn;
        this.expiresOn = expiresOn;
        this.order = order;
        this.owningListId = owningListId;
    }

    public long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public LocalDate getExpiresOn() {
        return expiresOn;
    }

    public int getOrder() {
        return order;
    }

    public long getOwningListId() {
        return owningListId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Card card = (Card) o;
        return id == card.id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
