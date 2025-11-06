package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.HistorialMovimientoRepository;
import com.medac.trello.api.model.repository.LabelRepository;
import com.medac.trello.api.model.repository.ListaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ListaRepository listaRepository;
    private final HistorialMovimientoRepository historialMovimientoRepository;
    private final LabelRepository labelRepository;

    @Autowired
    public BoardService(
            BoardRepository boardRepository,
            ListaRepository listaRepository,
            HistorialMovimientoRepository historialMovimientoRepository,
            LabelRepository labelRepository
    ) {
        this.boardRepository = boardRepository;
        this.listaRepository = listaRepository;
        this.historialMovimientoRepository = historialMovimientoRepository;
        this.labelRepository = labelRepository;
    }

    //---------------------CREAR/GUARDAR-----------------------
    @Transactional
    public Board guardarBoard(Board board) {

        if (board.getCreatedOn() == null) {
            board.setCreatedOn(Instant.now());
        }
        if (board.getBackground() != null && board.getBackground().isBlank()) {
            board.setBackground(null);
        }
        // 2. Establecer el ID del usuario creador (si falta).
        // HARDCODEAMOS 1L TEMPORALMENTE hasta que se implemente la autenticación.
        if (board.getCreatedBy() == null || board.getCreatedBy().equals(0L)) {
            board.setCreatedBy(1L);
        }
        return boardRepository.save(board);
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
        // Se asume que BoardRepository tiene el método: Set<Board> findAllByCreatedBy(Long userId);
        return boardRepository.findAllByCreatedBy(userId);
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
        List<Long> cardIds = new ArrayList<>();
        if (listas != null) {
            for (Lista lista : listas) {
                if (lista != null && lista.getTarjetas() != null) {
                    lista.getTarjetas().forEach(card -> {
                        if (card != null && card.getId() != null) {
                            cardIds.add(card.getId());
                        }
                    });
                }
            }
        }

        if (!cardIds.isEmpty()) {
            historialMovimientoRepository.deleteAllByTarjeta_IdIn(cardIds);
        }

        // 3. Eliminar etiquetas asociadas al tablero
        labelRepository.deleteAllByOwningBoardId(id);

        // 4. Eliminar primero las listas asociadas para evitar violaciones de FK.
        listaRepository.deleteAllByBoard_Id(id);

        // 5. Eliminar el tablero.
        boardRepository.delete(boardExistente);
    }
}
