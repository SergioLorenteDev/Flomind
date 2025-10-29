package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "tarjeta")
public class Card {
    // ... (campos y constructores existentes) ...

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarjeta")
    private Long id;

    @Column(name = "titulo", nullable = false)
    private String title;

    @Column(name = "descripcion")
    private String description;

    @Column(name = "creada_en")
    private Instant createdOn;

    @Column(name = "expira_en")
    private Instant expiresOn;

    @Column(name = "orden", nullable = false)
    private Integer cardOrder; // Cambiado a Integer

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lista", nullable = false)
    private Lista lista;

    public Card() {}


    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Instant getExpiresOn() { return expiresOn; }
    public Integer getCardOrder() { return this.cardOrder; } // Debe devolver Integer
    public Lista getLista() { return lista; }
    public Long getOwningListId() { return (lista != null) ? lista.getIdLista() : null; }
    public Instant getCreatedOn() {return createdOn;}

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setExpiresOn(Instant expiresOn) {
        this.expiresOn = expiresOn;
    }

    // ✅ Setter de Order
    public void setCardOrder(Integer order) { // Aceptar Integer, ya que el campo es Integer
        this.cardOrder = order;
    }

    // ✅ Setter de Lista (para movimiento)
    public void setLista(Lista lista) {
        this.lista = lista;
    }

    public void setCreatedOn(Instant createdOn) {this.createdOn = createdOn;}

    // --- Equals y HashCode (Mantenidos) ---
    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Card card = (Card) o;
        return Objects.equals(id, card.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}