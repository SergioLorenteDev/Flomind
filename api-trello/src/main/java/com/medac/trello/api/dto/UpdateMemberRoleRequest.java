package com.medac.trello.api.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateMemberRoleRequest {

    @NotBlank
    private String role;

    public UpdateMemberRoleRequest() {
    }

    public UpdateMemberRoleRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
