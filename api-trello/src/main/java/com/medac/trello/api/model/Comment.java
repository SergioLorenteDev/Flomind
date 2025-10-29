package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "comentario")
public class Comment {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_comentario")
    private Long id;
    @Column(name = "contenido", nullable = false)
    private String content;
    @Column(name = "fecha", nullable = false)
    private Instant createdOn;
    @Column(name = "id_usuario", nullable = false)
    private Long addedById;
    @Column(name = "id_tarjeta", nullable = false)
    private Long owningCardId;

    public Comment() {}

    public Comment(String content, Instant createdOn, long addedById, long owningCardId) {
        this.content = content;
        this.createdOn = createdOn;
        this.addedById = addedById;
        this.owningCardId = owningCardId;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Long getAddedById() {
        return addedById;
    }

    public Long getOwningCardId() {
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
