package com.medac.trello.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "tablero")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Board {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_tablero")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String name;

    @Column(name = "descripcion")
    private String description;

    @Column(name = "background")
    private String background;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant createdOn;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "id_usuario_creador", nullable = false)
    @JsonIgnoreProperties({"subscriptions","createdBoards","invitedToBoards","password","confirmationToken","hibernateLazyInitializer","handler"})
    private User createdBy;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "id_espacio")
    @JsonIgnoreProperties({"boards","owner","hibernateLazyInitializer","handler"})
    private Workspace workspace;

    @ManyToMany(fetch = LAZY)
    @JoinTable(
            name = "miembro_tablero",
            joinColumns = @JoinColumn(name = "id_tablero"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario")
    )
    @JsonIgnoreProperties({"subscriptions","createdBoards","invitedToBoards","password","confirmationToken","hibernateLazyInitializer","handler"})
    private Set<User> members = new HashSet<>();

    public Board() { this.members = new HashSet<>(); }

    public Board(String name, Instant createdOn, User createdBy) {
        this.name = name; this.createdOn = createdOn; this.createdBy = createdBy;
    }
    public Board(String name, String description, Instant createdOn, User createdBy) {
        this.name = name; this.description = description; this.createdOn = createdOn; this.createdBy = createdBy;
    }
    public Board(String name, String description, String background, Instant createdOn, User createdBy) {
        this.name = name; this.description = description; this.background = background; this.createdOn = createdOn; this.createdBy = createdBy;
    }

    public Long getOwnerId() { return this.createdBy != null ? this.createdBy.getId() : null; }
    public boolean isMember(Long userId) {
        if (this.members == null || userId == null) return false;
        return this.members.stream().anyMatch(u -> u.getId() != null && u.getId().equals(userId));
    }

    // getters/setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getBackground() { return background; } public void setBackground(String background) { this.background = background; }
    public Instant getCreatedOn() { return createdOn; } public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }
    public User getCreatedBy() { return createdBy; } public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public Long getWorkspaceId() { return workspace != null ? workspace.getId() : null; }

    public Set<User> getMembers() { return Collections.unmodifiableSet(members); }
    public void addMember(User user) { this.members.add(user); }
    public void setMembers(Set<User> members) { this.members = members; }

    @Override public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Board board = (Board) o; return Objects.equals(id, board.id);
    }
    @Override public int hashCode() { return Objects.hashCode(id); }
}
