package com.medac.trello.api.dto;

public class BoardRequestDTO {

    private String name;
    private String description;
    private String background;
    private Long createdBy;   // opcional (en producción vendría del token)

    // 🔹 NUEVO
    private Long workspaceId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBackground() { return background; }
    public void setBackground(String background) { this.background = background; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Long getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }
}
