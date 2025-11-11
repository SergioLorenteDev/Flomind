package com.medac.trello.api.dto;

public class BoardMemberDTO {

    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean owner;

    public BoardMemberDTO() {
    }

    public BoardMemberDTO(Long id, String name, String email, String role, boolean owner) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.owner = owner;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
    }
}
