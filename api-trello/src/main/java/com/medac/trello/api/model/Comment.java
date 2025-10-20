package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "comentario")
public class Comment {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_comentario")
    private long id;
    @Column(name = "contenido", nullable = false)
    private String content;
    @Column(name = "fecha", nullable = false)
    private LocalDateTime createdOn;
    @Column(name = "id_usuario", nullable = false)
    private long addedById;
    @Column(name = "id_tarjeta", nullable = false)
    private long owningCardId;

    public Comment(String content, LocalDateTime createdOn, long addedById, long owningCardId) {
        this.content = content;
        this.createdOn = createdOn;
        this.addedById = addedById;
        this.owningCardId = owningCardId;
    }

    public long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public long getAddedById() {
        return addedById;
    }

    public long getOwningCardId() {
        return owningCardId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return id == comment.id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
