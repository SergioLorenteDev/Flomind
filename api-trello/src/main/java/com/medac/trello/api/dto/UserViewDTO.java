package com.medac.trello.api.dto;

public class UserViewDTO {
    private Long id;
    private String username;
    private String email;
    private String name;

    // 🎯 ESTE ES EL CONSTRUCTOR QUE DEBES TENER
    public UserViewDTO(Long id, String username, String email, String name) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
    }

}