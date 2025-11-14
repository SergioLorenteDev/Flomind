/*package com.medac.trello.api.model.controller;

import com.medac.trello.api.model.Lista;
import com.medac.trello.api.service.ListasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/listas")
public class ListaController {

    @Autowired
    private ListasService listasService;

    //CREAR
    @PostMapping
    public ResponseEntity<Lista> crearLista(@RequestBody Lista lista) {
        Lista nuevaLista = listasService.guardarLista(lista);
        return new ResponseEntity<>(nuevaLista, HttpStatus.CREATED);
    }

    //LISTAR
    @GetMapping
    public List<Lista> listarTodasLasListas() {
        return listasService.obtenerTodasLasListas();
    }

    //ACTUALIZAR
    /*@PutMapping("/{idLista}")
    public ResponseEntity<Lista> actualizarLista(@PathVariable Long idLista, @RequestBody Lista listaDetalles) {
        try {
            Lista listaActualizada = listasService.actualizarLista(idLista, listaDetalles);
            return ResponseEntity.ok(listaActualizada);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

     */
/*
    //ACTUALIZAR
    @PutMapping("/{idLista}")
    public ResponseEntity<Lista> actualizarLista(@PathVariable Long idLista, @RequestBody Lista listaDetalles) {
        // Si falla, el Handler Global se encarga de devolver 404
        Lista listaActualizada = listasService.actualizarLista(idLista, listaDetalles);
        return ResponseEntity.ok(listaActualizada);
    }


    // ELIMINAR http://localhost:8080/api/listas/{idLista}
    @DeleteMapping("/{idLista}")
    public ResponseEntity<HttpStatus> eliminarLista(@PathVariable Long idLista) {
        try {
            listasService.eliminarLista(idLista);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


 */
package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.ListaRequestDTO;
import com.medac.trello.api.dto.ListaResponseDTO;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.User;
import com.medac.trello.api.service.ListasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.medac.trello.api.resources.TrelloApi; // Asegúrate de tener esta interfaz importada

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

// ⭐ CORRECCIÓN CLAVE 1: El mapeo debe reflejar la jerarquía: /api/tableros/{boardId}/listas
@RestController
@RequestMapping(value = "/tableros", produces = APPLICATION_JSON_VALUE)
public class ListaController {

    @Autowired
    private ListasService listasService;

  //----------------------CREAR LISTA-----------------------

    @PostMapping("/{boardId}/listas")
    public ResponseEntity<ListaResponseDTO> crearLista(
            @PathVariable Long boardId,
            @RequestBody ListaRequestDTO listaDto,
            @AuthenticationPrincipal User authenticatedUser
    ) {
        // MAPEO DTO
        Lista listaParaGuardar = new Lista();
        listaParaGuardar.setNombre(listaDto.getNombre());
        listaParaGuardar.setOrden(listaDto.getOrden());

        // 2. Llamada al servicio con la entidad y el ID del padre (boardId)
        // El servicio buscará el Board y asignará la relación
        Lista listaGuardada = listasService.guardarLista(authenticatedUser, boardId, listaParaGuardar);

        // 3. Mapeo Entidad -> DTO de Respuesta
        ListaResponseDTO responseDto = new ListaResponseDTO(listaGuardada);

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);

    }

    // LEER TODAS las listas de un tablero - GET /api/tableros/{boardId}/listas
    @GetMapping("/{boardId}/listas")
    public Set<ListaResponseDTO> listarListasPorTablero(@PathVariable Long boardId) {

        // 1. Llamada al servicio, que devuelve Entidades JPA
        Set<Lista> listas = listasService.obtenerListasPorTablero(boardId);

        // 2. Mapeo de la colección de Entidades a colección de DTOs de Respuesta
        return listas.stream()
                .map(ListaResponseDTO::new) // Usando el constructor de mapeo
                .collect(Collectors.toSet());
    }



    // ---------------------ACTUALIZAR - PUT /api/tableros/listas/{idLista}------------------

    @PutMapping("/listas/{idLista}")
    public ResponseEntity<ListaResponseDTO> actualizarLista(
            @PathVariable Long idLista,
            @RequestBody ListaRequestDTO listaDto,
            @AuthenticationPrincipal User authenticatedUser
    ) {
        // 1. Mapeo DTO -> Entidad (Crear una entidad temporal solo con los campos a actualizar)
        Lista listaParaActualizar = new Lista();
        listaParaActualizar.setNombre(listaDto.getNombre());
        listaParaActualizar.setOrden(listaDto.getOrden());

        // Lógica para mover a otro tablero (si se proporciona idTablero en el DTO)
        if (listaDto.getIdTablero() != null) {
            // Creamos una entidad Board temporal SÓLO con la ID para que el Service la pueda usar.
            Board boardStub = new Board();
            boardStub.setId(listaDto.getIdTablero());
            listaParaActualizar.setBoard(boardStub);
        }

        // 2. Llamada al servicio
        Lista listaActualizada = listasService.actualizarLista(authenticatedUser, idLista, listaParaActualizar);

        // 3. Mapeo Entidad -> DTO de Respuesta
        ListaResponseDTO responseDto = new ListaResponseDTO(listaActualizada);

        return ResponseEntity.ok(responseDto);
    }


    // ELIMINAR - DELETE /api/tableros/listas/{idLista}
    @DeleteMapping("/listas/{idLista}")
    public ResponseEntity<HttpStatus> eliminarLista(
            @PathVariable Long idLista,
            @AuthenticationPrincipal User authenticatedUser) {

        listasService.eliminarLista(authenticatedUser, idLista);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
    }
}
