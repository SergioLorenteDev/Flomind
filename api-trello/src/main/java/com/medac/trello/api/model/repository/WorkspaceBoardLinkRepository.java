package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.WorkspaceBoardLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceBoardLinkRepository extends JpaRepository<WorkspaceBoardLink, Long> {

    Optional<WorkspaceBoardLink> findByWorkspace_IdAndBoard_Id(Long workspaceId, Long boardId);

    void deleteAllByBoard_Id(Long boardId);

    @Query("select w.workspace.id from WorkspaceBoardLink w where w.board.id = :boardId")
    List<Long> findWorkspaceIdsByBoardId(@Param("boardId") Long boardId);
}
