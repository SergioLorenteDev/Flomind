package com.medac.trello.api.service;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    //---------------------CREAR/GUARDAR-----------------------
    @Transactional
    public Board guardarBoard(Board board) {

        if (board.getCreatedOn() == null) {
            board.setCreatedOn(Instant.now());
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
    @Transactional
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

        //boardExistente.setName(boardDetalles.getName());
        //boardExistente.setDescription(boardDetalles.getDescription());
        if (boardDetalles.getName() != null) {
            boardExistente.setName(boardDetalles.getName());
        }

        // ✅ MEJORA: Solo actualiza la descripción si viene en el payload
        if (boardDetalles.getDescription() != null) {
            boardExistente.setDescription(boardDetalles.getDescription());
        }


        return boardRepository.save(boardExistente);
    }

    //ELIMINAR
    /*public void eliminarBoard(Long id) {
        if (!boardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tablero no encontrado con id: " + id);
        }
        boardRepository.deleteById(id);
    }

     */

    //---------------------------ELIMINAR----------------------------
    @Transactional
    public void eliminarBoard(Long id) {
        // 1. Obtener la entidad para verificar su existencia.
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        // 2. Eliminar la entidad existente. (Solo una llamada DELETE)
        boardRepository.delete(boardExistente);
    }
}
