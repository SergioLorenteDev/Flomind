package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
// Extiende JpaRepository para obtener findAll, findById, count, etc., de forma más potente
public interface BoardRepository extends JpaRepository<Board, Long> {

    //REQUERIDO PARA LÍMITE FREEMIUM.

    long countByOwnerId(Long ownerId);

    List<Board> findByWorkspaceId(Long workspaceId);

    Set<Board> findAllByCreatedBy(Long userId);

    // findAll() ya está disponible a través de JpaRepository.
}
