package com.medac.trello.api.service;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    //CREAR/GUARDAR
    public Board guardarBoard(Board board){

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
    // LISTAR TODOS
    @Transactional
    public List<Board> obtenerTodosLosBoards() {
        return boardRepository.findAll();
    }

    // OBTENER POR ID
    @Transactional
    public Board obtenerBoardPorId(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));
    }

    //  ACTUALIZAR
    @Transactional
    public Board actualizarBoard(Long id, Board boardDetalles) {
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        boardExistente.setName(boardDetalles.getName());
        boardExistente.setDescription(boardDetalles.getDescription());


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

    //ELIMINAR - Versión optimizada (Recomendada)
    @Transactional
    public void eliminarBoard(Long id) {
        // 1. Obtener la entidad para verificar su existencia.
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        // 2. Eliminar la entidad existente. (Solo una llamada DELETE)
        boardRepository.delete(boardExistente);
    }
    @Transactional
    public Set<Board> obtenerTablerosPorUsuario(Long userId) {
        // Aquí usas el método que definiste en el repositorio:
        return boardRepository.findAllByCreatedBy(userId);
    }
}
