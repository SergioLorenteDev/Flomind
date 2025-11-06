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
    private Long id;
    @Column(name = "nombre", nullable = false)
    private String name;

    @Column(name = "color")
    private String colour;

    @Column(name = "id_tablero", nullable = false)
    private Long owningBoardId;

    public Label() {}

    public Label(String name, String colour, long owningBoardId) {
        this.name = name;
        this.colour = colour;
        this.owningBoardId = owningBoardId;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public Long getOwningBoardId() {
        return owningBoardId;
    }

    public void setOwningBoardId(Long owningBoardId) {
        this.owningBoardId = owningBoardId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Label label = (Label) o;
        return Objects.equals(id, label.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
