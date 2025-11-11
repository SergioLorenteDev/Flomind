package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitacion")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Token (Clave única para aceptar)
    @Column(name = "token", unique = true, nullable = false)
    private String token;

    // 2. Email del invitado (Usado para validar al aceptar)
    @Column(name = "invitee_email", nullable = false)
    private String inviteeEmail; // CONSERVA este nombre de campo

    // 3. Fecha de Expiración
    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // CONSERVA este nombre de campo

    // 4. ID del usuario que envió la invitación
    @Column(name = "id_usuario_invitador", nullable = false)
    private Long inviterId;

    // 5. Fecha de creación
    @Column(name = "fecha_creacion", nullable = false)
    private Instant creationDate;

    // 6. Estado (pendiente, aceptada, rechazada)
    @Column(name = "estado")
    private String status;

    // 7. Relación con el Tablero (La FK se mapea en el JoinColumn)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tablero", nullable = true)
    private Board board;

    // 🔑 8. NUEVA RELACIÓN: Vínculo con el Workspace (Ahora puede ser nulo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = true) // ⬅️ NUEVO CAMPO: FK al Workspace
    private Workspace workspace;

    // ---------------------- Constructores ----------------------

    public Invitation() {
        this.creationDate = Instant.now();
        this.status = "PENDIENTE";
    }

    // Constructor para crear la entidad desde el servicio
    public Invitation(String token, String inviteeEmail, Board board, Long inviterId, LocalDateTime expiresAt) {
        this();
        this.token = token;
        this.inviteeEmail = inviteeEmail;
        this.board = board;
        this.workspace = null;
        this.inviterId = inviterId;
        this.expiresAt = expiresAt;
    }

    //constructr para invitar al workspace
    public Invitation(String token, String inviteeEmail, Workspace workspace, Long inviterId, LocalDateTime expiresAt) {
        this();
        this.token = token;
        this.inviteeEmail = inviteeEmail;
        this.workspace = workspace; // ⬅️ Asigna el Workspace
        this.board = null;          // Asegura que Board es nulo
        this.inviterId = inviterId;
        this.expiresAt = expiresAt;
    }

    // ---------------------- Getters y Setters ----------------------

    public Long getId() { return id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getInviteeEmail() { return inviteeEmail; }
    public void setInviteeEmail(String inviteeEmail) { this.inviteeEmail = inviteeEmail; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Long getInviterId() { return inviterId; }
    public void setInviterId(Long inviterId) { this.inviterId = inviterId; }
    public Instant getCreationDate() { return creationDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Board getBoard() { return board; }
    public void setBoard(Board board) { this.board = board; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }

}