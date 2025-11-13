package com.medac.trello.api.dto;

import com.medac.trello.api.model.Board;

import java.time.Instant;
import java.util.List;

public class BoardResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String background;
    private Long createdBy;
    private Instant createdOn;
    private String currentUserRole;
    private Long workspaceId;
    private List<Long> linkedWorkspaceIds = List.of();

    public BoardResponseDTO() {}

    public BoardResponseDTO(Board board) {
        this.id = board.getId();
        this.name = board.getName();
        this.description = board.getDescription();
        this.background = board.getBackground();
        this.createdBy = board.getCreatedBy().getId();
        this.createdOn = board.getCreatedOn();
        this.workspaceId = board.getWorkspaceId();
    }

    public BoardResponseDTO(Board board, String currentUserRole) {
        this(board);
        this.currentUserRole = currentUserRole;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBackground() { return background; }
    public void setBackground(String background) { this.background = background; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    public String getCurrentUserRole() { return currentUserRole; }
    public void setCurrentUserRole(String currentUserRole) { this.currentUserRole = currentUserRole; }

    public Long getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }

    public List<Long> getLinkedWorkspaceIds() { return linkedWorkspaceIds; }
    public void setLinkedWorkspaceIds(List<Long> linkedWorkspaceIds) {
        this.linkedWorkspaceIds = linkedWorkspaceIds == null ? List.of() : List.copyOf(linkedWorkspaceIds);
    }
}
