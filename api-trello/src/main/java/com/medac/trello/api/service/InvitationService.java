package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.InvitationRepository;
import java.nio.file.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class InvitationService {

    // 🎯 1. DEFINICIÓN DE DEPENDENCIAS
    private final BoardRepository boardRepository;
    private final InvitationRepository invitationRepository;
    private final EmailService emailService;
    private final UserService userService; // Asume que tiene findByEmail()

    @Autowired
    public InvitationService(
            BoardRepository boardRepository,
            InvitationRepository invitationRepository,
            EmailService emailService,
            UserService userService) {
        this.boardRepository = boardRepository;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    // -------------------------------------------------------------

    @Transactional
    public void createAndSendInvite(Long inviterId, Long boardId, String invitedEmail) throws AccessDeniedException {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con ID: " + boardId));

        if (!board.getOwnerId().equals(inviterId) && !board.isMember(inviterId)) {
            // Se usa la excepción de Java, pero es mejor usar una excepción de Spring Security o una custom.
            throw new AccessDeniedException("Solo miembros o el dueño pueden invitar a este tablero.");
        }

        // --- 2. Opcional: Verificar si el invitado ya es miembro ---

        Optional<User> invitedUserOpt = userService.findByEmail(invitedEmail);

        if (invitedUserOpt.isPresent() && board.isMember(invitedUserOpt.get().getId())) {
            throw new IllegalArgumentException("El usuario '" + invitedEmail + "' ya es miembro de este tablero.");
        }

        // --- 3. Generar y Registrar Token de Invitación ---

        String invitationToken = UUID.randomUUID().toString();

        // 🎯 Si usas una tabla 'Invitation', inserta el registro aquí:
        // invitationRepository.save(new Invitation(boardId, invitedEmail, invitationToken));

        // --- 4. Enviar Correo de Invitación ---

        // La URL que el usuario usará para ACEPTAR la invitación.
        // Asume que tienes un endpoint en tu AuthController o InvitationController como /api/invite/accept
        String acceptanceLink = "http://localhost:8080/api/invite/accept?token=" + invitationToken;
        emailService.sendBoardInvitation(invitedEmail, board.getName(), acceptanceLink);

        System.out.println("Invitación registrada y enviada para el tablero ID: " + boardId);
    }
}