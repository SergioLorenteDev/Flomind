package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Invitation; // ⬅️ Importa tu entidad Invitation
import org.springframework.data.jpa.repository.JpaRepository; // ⬅️ ¡CRUCIAL!
import org.springframework.stereotype.Repository;

import java.util.Optional;

// 🎯 La interfaz DEBE extender JpaRepository
@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    // Método requerido para buscar la invitación por el token de aceptación.
    Optional<Invitation> findByToken(String token);
}