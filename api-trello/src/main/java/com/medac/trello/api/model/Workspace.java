package com.medac.trello.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "espacio_trabajo")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Workspace {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_espacio")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String name;

    @Column(name = "descripcion")
    private String description;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant createdOn = Instant.now();

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "id_usuario_duenio", nullable = false)
    @JsonIgnoreProperties({"subscriptions","createdBoards","invitedToBoards","password","confirmationToken","hibernateLazyInitializer","handler"})
    private User owner;

    @OneToMany(mappedBy = "workspace", fetch = LAZY)
    @JsonIgnore // ⬅️ no serializar aquí; los boards se piden aparte
    private Set<Board> boards = new LinkedHashSet<>();

    public Workspace() {}

    public Workspace(String name, String description, User owner) {
        this.name = name; this.description = description; this.owner = owner; this.createdOn = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public Instant getCreatedOn() { return createdOn; } public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }
    public User getOwner() { return owner; } public void setOwner(User owner) { this.owner = owner; }

    public Set<Board> getBoards() { return boards; }
    public void setBoards(Set<Board> boards) { this.boards = boards; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Workspace)) return false;
        Workspace that = (Workspace) o; return Objects.equals(id, that.id);
    }
    @Override public int hashCode() { return Objects.hash(id); }
}
