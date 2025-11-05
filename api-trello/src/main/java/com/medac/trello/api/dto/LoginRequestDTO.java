package com.medac.trello.api.dto;

public class LoginRequestDTO {
    private String username; // ⬅️ CAMBIADO DE 'email' A 'username'
    private String password;

    // Getters y setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
