package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    List<Workspace> findAllByOwner(User owner);

    Optional<Workspace> findByIdAndOwner_Id(Long id, Long ownerId);
    Optional<Workspace> findFirstByOwner_IdOrderByCreatedOnAsc(Long ownerId);
}
