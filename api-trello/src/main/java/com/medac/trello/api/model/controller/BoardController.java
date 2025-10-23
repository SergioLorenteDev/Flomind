package com.medac.trello.api.model.controller;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.service.BoardService;
import com.medac.trello.api.resources.TrelloApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

// Implementamos la interfaz TrelloApi
@RestController
@RequestMapping(value = "/tableros", produces = APPLICATION_JSON_VALUE)
public class BoardController implements TrelloApi {

    @Autowired
    private BoardService boardService;

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
}