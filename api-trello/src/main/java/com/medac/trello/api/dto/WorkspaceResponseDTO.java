package com.medac.trello.api.dto;

import com.medac.trello.api.model.Workspace;

import java.time.Instant;

public class WorkspaceResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Instant createdOn;
    private Long ownerId;

    public WorkspaceResponseDTO() {}

    public WorkspaceResponseDTO(Workspace ws) {
        this.id = ws.getId();
        this.name = ws.getName();
        this.description = ws.getDescription();
        this.createdOn = ws.getCreatedOn();
        this.ownerId = ws.getOwner() != null ? ws.getOwner().getId() : null;
    }

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}
