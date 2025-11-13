package com.medac.trello.api.dto;

public class WorkspaceRequestDTO {
    private String name;
    private String description;

    public WorkspaceRequestDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
