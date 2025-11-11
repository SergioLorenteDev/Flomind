package com.medac.trello.api.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class WorkspaceRequestDTO {

    @NotBlank
    @Size(min = 3, max = 100)
    private String name;

    @NotBlank
    private String type;

    // Getters y Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}