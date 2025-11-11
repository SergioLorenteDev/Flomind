package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.InvitationRepository;
import com.medac.trello.api.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {

    // 🎯 1. DEFINICIÓN DE DEPENDENCIAS
    private final BoardRepository boardRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final WorkspaceService workspaceService; // ⬅️ NUEVA DEPENDENCIA NECESARIA

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    public InvitationService(
            BoardRepository boardRepository,
            InvitationRepository invitationRepository,
            UserRepository userRepository,
            EmailService emailService,
            UserService userService,
            WorkspaceService workspaceService) { // ⬅️ Inyectar WorkspaceService
        this.boardRepository = boardRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.workspaceService = workspaceService; // Asignar nueva dependencia
    }

    // -------------------------------------------------------------
    // CREACIÓN Y ENVÍO DE INVITACIONES A BOARD
    // -------------------------------------------------------------

    @Transactional
    public void createAndSendInvitation(Board board, String inviteeEmail, Long inviterId) {

        // 1. GENERAR TOKEN ÚNICO
        String token = UUID.randomUUID().toString();

        // 2. CONSTRUIR OBJETO INVITATION Y GUARDAR
        Invitation newInvitation = new Invitation();
        newInvitation.setToken(token);
        newInvitation.setBoard(board);
        newInvitation.setWorkspace(null); // ⬅️ ¡CRUCIAL! Asegurar que no apunta a Workspace
        newInvitation.setInviteeEmail(inviteeEmail);
        newInvitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        newInvitation.setInviterId(inviterId);

        invitationRepository.save(newInvitation);

        // 3. CONSTRUIR Y ENVIAR EL EMAIL
        // Usa una ruta específica para aceptar la invitación de Board
        String acceptanceLink = baseUrl + "/accept-board-invite?token=" + token;

        String subject = String.format("Has sido invitado al tablero '%s'", board.getName());
        String emailBody = String.format(
                "Hola,\n\n" +
                        "Has sido invitado al tablero '%s'. Para aceptar, haz clic en el siguiente enlace:\n\n" +
                        "%s\n\n" +
                        "Gracias.",
                board.getName(), acceptanceLink
        );
        // Usar tu método más simple (eliminando los envíos duplicados)
        emailService.sendEmail(inviteeEmail, subject, emailBody);
    }

    // -------------------------------------------------------------
    // BUSCAR, VALIDAR Y ACEPTAR INVITACIÓN (DELEGACIÓN DE LÓGICA)
    // -------------------------------------------------------------

    @Transactional
    public void acceptInvitation(String token, String userEmail) {

        // 1. Buscar la invitación por token
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la invitación o es inválida."));

        // 2. Validar que la invitación es para el usuario actual
        if (!invitation.getInviteeEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("La invitación no es para el usuario autenticado.");
        }

        // 2b. Validar si ha expirado
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitationRepository.delete(invitation);
            throw new IllegalArgumentException("La invitación ha caducado.");
        }

        // 🎯 3. DELEGACIÓN DE LÓGICA: Determinar si es de Board o de Workspace
        if (invitation.getBoard() != null && invitation.getWorkspace() == null) {

            // Lógica de aceptación de BOARD
            handleBoardAcceptance(invitation, userEmail);

        } else if (invitation.getWorkspace() != null && invitation.getBoard() == null) {

            // Lógica de aceptación de WORKSPACE (Delegar al WorkspaceService)
            // Asumo que tu WorkspaceService tiene este método:
            workspaceService.acceptWorkspaceInvitation(token, userEmail);
            // NOTA: El WorkspaceService debe encargarse de borrar la invitación después de la aceptación.

        } else {
            // Invitación mal configurada (apunta a ambos o a ninguno)
            throw new IllegalStateException("Invitación mal configurada: requiere Board o Workspace, no ambos.");
        }

        // Si es de Board, la eliminación se hace en handleBoardAcceptance.
        // Si es de Workspace, la eliminación se hace en WorkspaceService.acceptWorkspaceInvitation.
    }

    // -------------------------------------------------------------
    // LÓGICA DE ACEPTACIÓN ESPECÍFICA PARA BOARDS
    // -------------------------------------------------------------
    private void handleBoardAcceptance(Invitation invitation, String userEmail) {

        User acceptingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado."));

        Board board = invitation.getBoard();
        if (board == null) {
            throw new IllegalStateException("La invitación de Board está incompleta.");
        }

        // Verificar si ya es miembro (la verificación en Board.isMember() es más completa)
        if (board.isMember(acceptingUser.getId())) {
            invitationRepository.delete(invitation);
            throw new IllegalArgumentException("El usuario ya es miembro de este tablero o de su espacio de trabajo.");
        }

        // Añadir el usuario al tablero
        board.getMembers().add(acceptingUser);
        boardRepository.save(board);

        // Eliminar la invitación
        invitationRepository.delete(invitation);
    }


    //------------------------------------CONSULTAR INVITACIONES----------------------
    public List<Invitation> getReceivedInvitations(String userEmail) {
        // Este método sigue siendo válido y busca en ambos tipos de invitaciones.
        return invitationRepository.findByInviteeEmail(userEmail);
    }
}