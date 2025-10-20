package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "etiqueta")
public class Label {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_etiqueta")
    private long id;
    @Column(name = "nombre", nullable = false)
    private String name;
    @Column(name = "color")
    private String colour;
    @Column(name = "id_tablero", nullable = false)
    private long owningBoardId;

    public Label(String name, String colour, long owningBoardId) {
        this.name = name;
        this.colour = colour;
        this.owningBoardId = owningBoardId;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColour() {
        return colour;
    }

    public long getOwningBoardId() {
        return owningBoardId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Label label = (Label) o;
        return id == label.id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
