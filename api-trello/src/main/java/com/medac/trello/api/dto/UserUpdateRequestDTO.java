package com.medac.trello.api.dto;

// Usado para recibir solo el campo de nombre que se actualizará
public class UserUpdateRequestDTO {

    private String username;

    // Getters y Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
