package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.InvitationRepository;
import com.medac.trello.api.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // ⬅️ Necesario para inyectar baseUrl
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvitationService {

    // 🎯 1. DEFINICIÓN DE DEPENDENCIAS
    private final BoardRepository boardRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserService userService;

    // ⬅️ Inyectar la URL base de tu frontend/aplicación
    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    public InvitationService(
            BoardRepository boardRepository,
            InvitationRepository invitationRepository,
            UserRepository userRepository,
            EmailService emailService,
            UserService userService) {
        this.boardRepository = boardRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    // -------------------------------------------------------------

    @Transactional
    public void createAndSendInvitation(Board board, String inviteeEmail, Long inviterId) {

        // 1. GENERAR TOKEN ÚNICO
        String token = UUID.randomUUID().toString();

        // 2. CONSTRUIR OBJETO INVITATION Y GUARDAR
        Invitation newInvitation = new Invitation();
        newInvitation.setToken(token);
        newInvitation.setBoard(board);
        newInvitation.setInviteeEmail(inviteeEmail);

        // Establecer fecha de expiración
        newInvitation.setExpiresAt(LocalDateTime.now().plusDays(7));

        newInvitation.setInviterId(inviterId);

        invitationRepository.save(newInvitation);

        // 3. CONSTRUIR EL ENLACE COMPLETO
        // Usa 'baseUrl' (inyectado) y 'token'
        String acceptanceLink = baseUrl + "?token=" + token;

        // 4. PREPARAR Y ENVIAR EL EMAIL
        String subject = "Has sido invitado a un tablero de Flomind!";

        // El cuerpo del email se construye en el EmailService, solo necesitas pasar los parámetros:
        emailService.sendBoardInvitation(inviteeEmail, board.getName(), acceptanceLink);

        emailService.sendBoardInvitation(inviteeEmail, board.getName(), acceptanceLink);


        String emailBody = String.format(
                "Hola,\n\n" +
                        "Has sido invitado al tablero '%s'. Para aceptar, haz clic en el siguiente enlace:\n\n" +
                        "%s\n\n" +
                        "Gracias.",
                board.getName(), acceptanceLink
        );
        emailService.sendEmail(inviteeEmail, subject, emailBody);

    }

    //-------------------------------------BUSCAR, VALIDAR Y ELIMINAR INVITACIÓN-----------------

    @Transactional
    public void acceptInvitation(String token, String userEmail) {

        // 1. Buscar la invitación por token
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("No se encontró la invitación o es inválida"));

        // 2. Validar que la invitación es para el usuario actual
        if (!invitation.getInviteeEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("La invitación no es para el usuario.");
        }

        // 2b. Opcional: Validar si ha expirado
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitationRepository.delete(invitation);
            throw new RuntimeException("La invitación ha caducado.");
        }

        // 3. Buscar el usuario (asumiendo que ya está autenticado)
        User invitingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));

        // 4. Buscar el tablero
        Board board = invitation.getBoard();
        if (board == null) {
            throw new RuntimeException("No se ha encontrado la invitación.");
        }

        // 4b. Opcional: Verificar si ya es miembro
        if (board.getMembers().contains(invitingUser)) {
            invitationRepository.delete(invitation);
            throw new RuntimeException("El usuario ya es miembro de este tablero.");
        }


        // 5. Añadir el usuario al tablero
        board.getMembers().add(invitingUser);
        boardRepository.save(board);

        // 6. Eliminar la invitación después de la aceptación
        invitationRepository.delete(invitation);
    }

    //------------------------------------CONSULTAR INVITACIONES----------------------
    public List<Invitation> getReceivedInvitations(String userEmail) {
        return invitationRepository.findByInviteeEmail(userEmail);
    }
}
