package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "workspace") // O espacio_trabajo, si usas español
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // Ej: Engineering, Marketing, Small Business

    // 1. Dueño (El usuario que lo creó)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // 2. Tableros (Un Workspace tiene muchos Tableros)
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Board> boards = new HashSet<>();

    // 3. Miembros (Muchos usuarios pueden ser miembros de muchos Workspaces)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "workspace_member", // Nueva tabla intermedia
            joinColumns = @JoinColumn(name = "workspace_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    // ---------------------- Métodos de Conveniencia ----------------------

    public boolean isOwner(Long userId) {
        return this.owner != null && this.owner.getId().equals(userId);
    }

    public boolean isMember(Long userId) {
        return this.members.stream().anyMatch(member -> member.getId().equals(userId));
    }

    // ---------------------- Constructores y Getters/Setters ----------------------

    public Workspace() {}

    // Constructor útil para la creación
    public Workspace(String name, String type, User owner) {
        this.name = name;
        this.type = type;
        this.owner = owner;
        this.members.add(owner); // El dueño es automáticamente miembro
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public Set<Board> getBoards() { return boards; }
    public Set<User> getMembers() { return members; }
}
