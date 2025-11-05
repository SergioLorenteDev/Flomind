package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Collections;
import java.util.Objects;
import java.util.Set;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "tablero")
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
    @Column(name = "id_usuario_creador", nullable = false)
    private Long createdBy;

    @ManyToMany
    @JoinTable(
            name = "tablero_miembros",
            joinColumns = @JoinColumn(name = "id_tablero"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario")
    )
    private Set<User> members;

    //------------------------METODOS PARA LAS INVITACIONES------------------

    // 🎯 getOwnerId() -> Mapeado a createdBy
    public Long getOwnerId() {
        return this.createdBy;
    }

    // 🎯 isMember()
    public boolean isMember(Long userId) {
        if (this.members == null) {
            return false;
        }
        return this.members.stream()
                .anyMatch(user -> user.getId() != null && user.getId().equals(userId));
    }

    // ... (restantes getters y setters de Board) ...

    public Set<User> getMembers() {
        return Collections.unmodifiableSet(members);
    }
    public void setMembers(Set<User> members) {
        this.members = members;
    }



    public Board() {}

    public Board(String name, Instant createdOn, Long createdBy) {
        this.name = name;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
    }

    public Board(String name, String description, Instant createdOn, Long createdBy) {
        this.name = name;
        this.description = description;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
    }

    public Board(String name, String description, String background, Instant createdOn, Long createdBy) {
        this.name = name;
        this.description = description;
        this.background = background;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
    }



    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getBackground() {
        return background;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public void setCreatedOn(Instant createdOn) {
        this.createdOn = createdOn;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public void setId(Long id) {this.id = id;}

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Board board = (Board) o;
        return Objects.equals(id, board.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
