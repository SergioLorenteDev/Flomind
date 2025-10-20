package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "tablero")
public class Board {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_tablero")
    private long id;

    @Column(name = "nombre", nullable = false)
    private String name;
    @Column(name = "descripcion")
    private String description;
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdOn;
    @Column(name = "id_usuario_creador", nullable = false)
    private long createdBy;

    public Board(String name, LocalDateTime createdOn, long createdBy) {
        this.name = name;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
    }

    public Board(String name, String description, LocalDateTime createdOn, long createdBy) {
        this.name = name;
        this.description = description;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public long getCreatedBy() {
        return createdBy;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Board board = (Board) o;
        return id == board.id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
