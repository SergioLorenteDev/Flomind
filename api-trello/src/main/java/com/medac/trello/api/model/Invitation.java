package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "invitacion")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🎯 Token único usado en el enlace de verificación
    @Column(name = "token", unique = true, nullable = false)
    private String token;

    // El email del usuario que ha sido invitado
    @Column(name = "email_invitado", nullable = false)
    private String invitedEmail;

    // ID del tablero al que se está invitando
    @Column(name = "id_tablero", nullable = false)
    private Long boardId;

    // ID del usuario que envió la invitación
    @Column(name = "id_invitador", nullable = false)
    private Long inviterId;

    // Fecha de creación
    @Column(name = "fecha_creacion", nullable = false)
    private Instant creationDate;

    // Fecha de caducidad (opcional, pero buena práctica de seguridad)
    @Column(name = "fecha_expiracion")
    private Instant expiryDate;

    // Estado (pendiente, aceptada, rechazada)
    @Column(name = "estado")
    private String status;


    // ---------------------- Constructores ----------------------

    public Invitation() {
        this.creationDate = Instant.now();
        // Opcional: establecer fecha de expiración
        // this.expiryDate = Instant.now().plus(7, ChronoUnit.DAYS);
        this.status = "PENDIENTE";
    }

    // Constructor para crear la entidad desde el servicio
    public Invitation(String token, String invitedEmail, Long boardId, Long inviterId) {
        this(); // Llama al constructor por defecto para establecer fechas
        this.token = token;
        this.invitedEmail = invitedEmail;
        this.boardId = boardId;
        this.inviterId = inviterId;
    }

    // ---------------------- Getters y Setters ----------------------

    public Long getId() { return id; }
    // ... (restantes getters y setters para todos los campos)

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getInvitedEmail() { return invitedEmail; }
    public void setInvitedEmail(String invitedEmail) { this.invitedEmail = invitedEmail; }

    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }

    public Long getInviterId() { return inviterId; }
    public void setInviterId(Long inviterId) { this.inviterId = inviterId; }

    public Instant getCreationDate() { return creationDate; }
    public Instant getExpiryDate() { return expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}