package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.util.Objects;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(
        name = "workspace_board_link",
        uniqueConstraints = @UniqueConstraint(name = "uq_workspace_board", columnNames = {"workspace_id", "board_id"})
)
public class WorkspaceBoardLink {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long id;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    protected WorkspaceBoardLink() {
    }

    public WorkspaceBoardLink(Workspace workspace, Board board) {
        this.workspace = workspace;
        this.board = board;
    }

    public Long getId() {
        return id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public Board getBoard() {
        return board;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WorkspaceBoardLink)) return false;
        WorkspaceBoardLink that = (WorkspaceBoardLink) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
