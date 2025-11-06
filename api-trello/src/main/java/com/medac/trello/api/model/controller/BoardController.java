package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.InviteRequestDTO;
import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.User;
import com.medac.trello.api.service.BoardService;
import com.medac.trello.api.resources.TrelloApi;
import com.medac.trello.api.service.InvitationService;
import com.medac.trello.api.view.BoardView;
import com.medac.trello.api.view.UserView;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toSet;
import static org.springframework.http.HttpStatus.CREATED;
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
    public ResponseEntity<Board> crearTablero(@RequestBody Board board) {
        Board nuevoBoard = boardService.guardarBoard(board);
        return new ResponseEntity<>(nuevoBoard, HttpStatus.CREATED);
    }

    //LEER TODOS
    @GetMapping
    public List<Board> listarTodosLosTableros() {
        return boardService.obtenerTodosLosBoards();
    }

    //LEER UNO
    @GetMapping("/{id}")
    public ResponseEntity<Board> obtenerTableroPorId(@PathVariable Long id) {
        Board board = boardService.obtenerBoardPorId(id);
        return ResponseEntity.ok(board);
    }

    //ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Board> actualizarTablero(@PathVariable Long id, @RequestBody Board boardDetalles) {
        Board boardActualizado = boardService.actualizarBoard(id, boardDetalles);
        return ResponseEntity.ok(boardActualizado);
    }

    //ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminarTablero(@PathVariable Long id) {
        boardService.eliminarBoard(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/by-user/{userId}")
    public Set<Board> listarTablerosPorUsuario(@PathVariable Long userId) {
        // Llama al nuevo método del servicio
        return boardService.obtenerTablerosPorUsuario(userId);
    }

    //-----------------------------endpoint de invitacion a tablero------------



    @PostMapping("/invite")
    public ResponseEntity<String> inviteUserToBoard(
            @Valid @RequestBody InviteRequestDTO request,
            @AuthenticationPrincipal User authenticatedUser) {

        try {
            // 1. Obtener el ID del usuario que invita (inviter) de forma segura
            Long inviterId = authenticatedUser.getId();

            // 2. Llamar al servicio para realizar las validaciones, guardar la invitación y enviar el correo
            invitationService.createAndSendInvite(
                    inviterId,
                    request.boardId(),
                    request.invitedEmail()
            );

            return ResponseEntity.ok("Invitación enviada con éxito a " + request.invitedEmail());

        } catch (AccessDeniedException e) {
            // Si el usuario no tiene permisos sobre el tablero
            return status(403).body(e.getMessage()); // 403 Forbidden
        } catch (ResourceNotFoundException e) {
            // Si el boardId no existe
            return status(404).body(e.getMessage()); // 404 Not Found
        } catch (IllegalArgumentException e) {
            // Si el usuario ya es miembro o hay otro error de validación
            return status(400).body(e.getMessage()); // 400 Bad Request
        } catch (Exception e) {
            // Manejo de otros posibles errores (ej: fallo de EmailService)
            return status(500).body("Error interno al procesar la invitación.");
        }
    }
}