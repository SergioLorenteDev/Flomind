package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.Invitation.Estado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    //Buscar la invitación por el token de aceptacion
    Optional<Invitation> findByTokenAndStatus(String token, Estado status);

    // listar las invitaciones que un usuario ha ENVIADO
    List<Invitation> findByInviterId(Long inviterId);


    // listar las invitaciones que un usuario ha RECIBIDO
    List<Invitation> findByInviteeEmail(String inviteeEmail);

    //Listar las pendientes que recibió un usuario
    List<Invitation> findByInviteeEmailAndStatus(String inviteeEmail, Estado status);

    @Modifying
    @Query("delete from Invitation i where i.board.id = :boardId")
    void deleteAllByBoardId(@Param("boardId") Long boardId);
}
