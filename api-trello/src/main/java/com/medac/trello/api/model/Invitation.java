package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

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
    @Enumerated(value = STRING)
    @Column(name = "estado")
    private Estado status;

    // 7. Relación con el Tablero (La FK se mapea en el JoinColumn)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tablero", nullable = false)
    private Board board;

    // ---------------------- Constructores ----------------------

    public Invitation() {
        this.creationDate = Instant.now();
        this.status = Estado.PENDIENTE;
    }

    // Constructor para crear la entidad desde el servicio
    public Invitation(String token, String inviteeEmail, Board board, Long inviterId, LocalDateTime expiresAt) {
        this();
        this.token = token;
        this.inviteeEmail = inviteeEmail;
        this.board = board;
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
    public Estado getStatus() { return status; }
    public void setStatus(Estado status) { this.status = status; }
    public Board getBoard() { return board; }
    public void setBoard(Board board) { this.board = board; }

    public enum Estado {
        PENDIENTE, ACEPTADA, RECHAZADA
    }
}