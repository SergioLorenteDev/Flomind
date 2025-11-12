package com.medac.trello.api.dto;

import com.medac.trello.api.model.User;
import java.time.Instant;

public class UserResponseDTO {

    private Long id;
    private String username;
    private String email;
    private Instant createdOn;
    // Opcionalmente, si usas roles:
    // private String role;

    // 🎯 CONSTRUCTOR DE MAPEO (Obligatorio para la respuesta)
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.createdOn = user.getCreatedOn();
        // this.role = user.getRole().getName();
    }

    // Constructor vacío (necesario para algunas serializaciones)
    public UserResponseDTO() {}

    // --- Getters y Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    // public String getRole() { return role; }
    // public void setRole(String role) { this.role = role; }
}