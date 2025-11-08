package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.BoardRequestDTO;
import com.medac.trello.api.dto.BoardResponseDTO;
import com.medac.trello.api.dto.InviteRequestDTO;
import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.User;
import com.medac.trello.api.resources.TrelloApi;
import com.medac.trello.api.service.BoardService;
import com.medac.trello.api.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import static java.util.stream.Collectors.toSet;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.status;

// Implementamos la interfaz TrelloApi
@RestController
@RequestMapping(value = "/tableros", produces = APPLICATION_JSON_VALUE)
public class BoardController implements TrelloApi {
    private final BoardService boardService;
    private final InvitationService invitationService;

    @Autowired
    public BoardController(BoardService boardService, InvitationService invitationService) {
        this.boardService = boardService;
        this.invitationService = invitationService;

    }

    //CREAR
    @PostMapping
    public ResponseEntity<BoardResponseDTO> crearTablero(
            @RequestBody BoardRequestDTO board,
            @AuthenticationPrincipal User authenticatedUser) {

        BoardResponseDTO nuevoBoard = new BoardResponseDTO(boardService.guardarBoard(board, authenticatedUser));
        return new ResponseEntity<>(nuevoBoard, HttpStatus.CREATED);
    }

    //LEER TODOS
    @GetMapping
    public Set<BoardResponseDTO> listarTodosLosTableros(@AuthenticationPrincipal User authenticatedUser) {
        return boardService.obtenerTablerosPorUsuario(authenticatedUser.getId()).stream()
                .map(BoardResponseDTO::new).collect(toSet());
    }

    //LEER UNO
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponseDTO> obtenerTableroPorId(@PathVariable Long id) {
        var board = new BoardResponseDTO(boardService.obtenerBoardPorId(id));
        return ResponseEntity.ok(board);
    }

    //ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<BoardResponseDTO> actualizarTablero(@PathVariable Long id, @RequestBody Board boardDetalles) {
        var boardActualizado = new BoardResponseDTO(boardService.actualizarBoard(id, boardDetalles));
        return ResponseEntity.ok(boardActualizado);
    }

    //ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminarTablero(@PathVariable Long id) {
        boardService.eliminarBoard(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/by-user/{userId}")
    public Set<BoardResponseDTO> listarTablerosPorUsuario(@PathVariable Long userId) {
        // Llama al nuevo método del servicio
        return boardService.obtenerTablerosPorUsuario(userId).stream()
                .map(BoardResponseDTO::new).collect(toSet());
    }

    //-----------------------------endpoint de invitacion a tablero------------


    @PostMapping("/{boardId}/invitaciones")
    public ResponseEntity<String> inviteUserToBoard(
            @PathVariable Long boardId,
            @Valid @RequestBody InviteRequestDTO request,
            @AuthenticationPrincipal User authenticatedUser) {

        try {
            // 1. Obtener el ID del usuario que invita (inviter)
            Long inviterId = authenticatedUser.getId();

            // 2. RECUPERAR EL OBJETO BOARD COMPLETO (NECESARIO PARA EL SERVICE)
            Board board = boardService.obtenerBoardPorId(boardId);

            // 3. Validar si el usuario autenticado tiene permisos para invitar
            if (!board.getOwnerId().equals(authenticatedUser.getId()) && !board.getMembers().contains(authenticatedUser)) {
                throw new AccessDeniedException("Solo el dueño o miembros del tablero pueden invitar.");
            }

            // 4. Llamar al servicio con el objeto Board
            invitationService.createAndSendInvitation(
                    board,
                    request.email(),
                    inviterId
            );

            return ResponseEntity.ok("Invitación enviada con éxito a " + request.email());

        } catch (AccessDeniedException e) {
            return status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Esto capturará MailException o cualquier otro error no manejado.
            return status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno al procesar la invitación: " + e.getMessage());
        }
    }

    //---------------------------------ENDPOINT PARA VER LAS INNVITACIONES-------------------------

    @GetMapping("/invitations/received")
    public ResponseEntity<List<Invitation>> getReceivedInvitations(
            @AuthenticationPrincipal User authenticatedUser) { // Obtiene el usuario autenticado del JWT

        // 1. Obtener el email del usuario autenticado
        String userEmail = authenticatedUser.getEmail();

        // 2. Llamar al servicio
        List<Invitation> invitations = invitationService.getReceivedInvitations(userEmail);

        // 3. Devolver la lista
        return ResponseEntity.ok(invitations);
    }
}