package com.medac.trello.api.service;

import com.medac.trello.api.dto.BoardRequestDTO;
import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import static java.util.stream.Collectors.toSet;
import static java.util.stream.Stream.concat;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ListaRepository listaRepository;
    private final HistorialMovimientoRepository historialMovimientoRepository;
    private final LabelRepository labelRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;

    @Autowired
    public BoardService(
            BoardRepository boardRepository,
            ListaRepository listaRepository,
            HistorialMovimientoRepository historialMovimientoRepository,
            LabelRepository labelRepository,
            InvitationRepository invitationRepository, UserRepository userRepository
    ) {
        this.boardRepository = boardRepository;
        this.listaRepository = listaRepository;
        this.historialMovimientoRepository = historialMovimientoRepository;
        this.labelRepository = labelRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
    }

    //---------------------CREAR/GUARDAR-----------------------
    @Transactional
    public Board guardarBoard(BoardRequestDTO board, User user) {
        Board newBoard = new Board(
                board.getName(),
                board.getDescription(),
                board.getBackground(),
                Instant.now(),
                user
        );
        return boardRepository.save(newBoard);
    }

    //-------------------------------LEER ------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Board> obtenerTodosLosBoards() {
        return boardRepository.findAll();
    }

    // OBTENER POR ID
    @Transactional(readOnly = true)
    public Board obtenerBoardPorId(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));
    }

    //OBTENER POR USUARIO
    @Transactional(readOnly = true)
    public Set<Board> obtenerTablerosPorUsuario(Long userId) {
        final var maybeUser = userRepository.findById(userId);
        return maybeUser.map(user ->
                concat(user.getCreatedBoards().stream(), user.getInvitedToBoards().stream()).collect(toSet()))
                .orElse(Set.of());
    }

    //  ------------------------ACTUALIZAR-----------------------
    @Transactional
    public Board actualizarBoard(Long id, Board boardDetalles) {
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        if (boardDetalles.getName() != null) {
            boardExistente.setName(boardDetalles.getName());
        }

        if (boardDetalles.getDescription() != null) {
            boardExistente.setDescription(boardDetalles.getDescription());
        }

        if (boardDetalles.getBackground() != null) {
            boardExistente.setBackground(
                    boardDetalles.getBackground().isBlank() ? null : boardDetalles.getBackground()
            );
        }

        return boardRepository.save(boardExistente);
    }

    //---------------------------ELIMINAR----------------------------
    @Transactional
    public void eliminarBoard(Long id) {
        // 1. Obtener la entidad para verificar su existencia.
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        // 2. Recolectar los IDs de las tarjetas asociadas al tablero.
        Set<Lista> listas = listaRepository.findAllByBoard_Id(id);
        Set<Long> cardIds = listas.stream()
                .flatMap(lista -> lista.getTarjetas().stream())
                .map(Card::getId)
                .collect(toSet());

        if (!cardIds.isEmpty()) {
            historialMovimientoRepository.deleteAllByTarjetaIdIn(cardIds);
        }

        // 3. Eliminar etiquetas asociadas al tablero
        labelRepository.deleteAllByOwningBoardId(id);

        // 4. Eliminar primero las listas asociadas para evitar violaciones de FK.
        listaRepository.deleteAllByBoard_Id(id);

        invitationRepository.deleteAllByBoardId(boardExistente.getId());

        // 5. Eliminar el tablero.
        boardRepository.delete(boardExistente);
    }
}
