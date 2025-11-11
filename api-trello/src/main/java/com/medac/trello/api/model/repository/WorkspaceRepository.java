package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    List<Workspace> findByOwnerIdOrMembersId(Long ownerId, Long memberId);
}