package com.medac.trello.api.model;

import com.medac.trello.api.dto.CreateBoardDTO;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToMany(fetch = FetchType.LAZY) // FetchType.LAZY es recomendable
    @JoinTable(
            name = "miembro_tablero", //TABLA INTERMEDIAA
            joinColumns = @JoinColumn(name = "id_tablero"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario")
    )
    private Set<User> members = new HashSet<>();

    //------------------------METODOS PARA LAS INVITACIONES------------------


    public Long getOwnerId() {
        // 🎯 El Dueño real del tablero es el Dueño del Workspace
        return this.workspace != null ? this.workspace.getOwner().getId() : null;
    }


    // La membresía ahora debe verificar también el Workspace
    public boolean isMember(Long userId) {
        if (this.members != null &&
                this.members.stream().anyMatch(user -> user.getId() != null && user.getId().equals(userId))) {
            return true; // Es miembro directo del tablero
        }

        // 🔑 Verificar si es miembro del Workspace
        return this.workspace != null && this.workspace.isMember(userId);
    }

    // Este método es solo para el Dueño histórico (original)
    public Long getHistoricalCreatorId() {
        return createdBy;
    }

//----------------------------------SETTERS Y GETTERS-----------------

    public Set<User> getMembers() {
        return Collections.unmodifiableSet(members);
    }
    public void setMembers(Set<User> members) {
        this.members = members;
    }


    // 🔑 Nuevos Getters/Setters para Workspace
    public Workspace getWorkspace() {
        return workspace;
    }
    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }


    public Board() {
        this.members =  new HashSet<>();
    }

    public Board(String name, Instant createdOn, Long createdBy, Workspace workspace) {
        this.name = name;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
        this.workspace = workspace; //NUEVO!!
    }


    // Constructor Completo (Obliga a incluir Workspace)
    public Board(String name, String description, String background, Instant createdOn, Long createdBy, Workspace workspace) {
        this.name = name;
        this.description = description;
        this.background = background;
        this.createdOn = createdOn;
        this.createdBy = createdBy;
        this.workspace = workspace;
        this.members = new HashSet<>();
    }

    //constructor usando DTO
    public Board(CreateBoardDTO dto, Long creatorId, Workspace workspace) {
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.background = dto.getBackground();
        this.createdOn = Instant.now(); // Se establece aquí
        this.createdBy = creatorId;     // Se establece aquí
        this.workspace = workspace;
        this.members = new HashSet<>();
    }

    //private Set<User> users = new HashSet<>(); // Inicializar para evitar NullPointerException

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

    //public Set<User> getUsers(){return users;}

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

    //public void setUsers(Set<User> users) {this.users = users;}

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
