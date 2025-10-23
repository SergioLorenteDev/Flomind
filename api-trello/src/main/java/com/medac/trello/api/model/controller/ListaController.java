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

import com.medac.trello.api.model.Lista;
import com.medac.trello.api.service.ListasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medac.trello.api.resources.TrelloApi; // Asegúrate de tener esta interfaz importada

import java.util.List;
import java.util.Set;

// ⭐ CORRECCIÓN CLAVE 1: El mapeo debe reflejar la jerarquía: /api/tableros/{boardId}/listas
@RestController
@RequestMapping("/tableros")
public class ListaController {

    @Autowired
    private ListasService listasService;

    // -----------------------------------------------------------------
    // Operaciones basadas en la jerarquía: /api/tableros/{boardId}/listas
    // -----------------------------------------------------------------

    // CREAR - POST /api/tableros/{boardId}/listas
    // La lista se crea asociada al tablero cuyo ID está en la PathVariable.
    @PostMapping("/{boardId}/listas")
    public ResponseEntity<Lista> crearLista(
            @PathVariable Long boardId,
            @RequestBody Lista lista
    ) {
        // ⭐ CORRECCIÓN CLAVE 2: Pasar el boardId al servicio
        Lista nuevaLista = listasService.guardarLista(boardId, lista);
        return new ResponseEntity<>(nuevaLista, HttpStatus.CREATED);
    }

    // LEER TODAS las listas de un tablero - GET /api/tableros/{boardId}/listas
    @GetMapping("/{boardId}/listas")
    public Set<Lista> listarListasPorTablero(@PathVariable Long boardId) {
        return listasService.obtenerListasPorTablero(boardId);
    }


    // -----------------------------------------------------------------
    // Operaciones sobre una lista específica (no necesitan el boardId en la ruta)
    // -----------------------------------------------------------------

    // ACTUALIZAR - PUT /api/tableros/listas/{idLista}
    // Nota: La URL es más clara si se elimina la palabra "tableros"
    @PutMapping("/listas/{idLista}")
    public ResponseEntity<Lista> actualizarLista(@PathVariable Long idLista, @RequestBody Lista listaDetalles) {
        // Si falla, el Handler Global se encarga de devolver 404
        Lista listaActualizada = listasService.actualizarLista(idLista, listaDetalles);
        return ResponseEntity.ok(listaActualizada);
    }


    // ELIMINAR - DELETE /api/tableros/listas/{idLista}
    @DeleteMapping("/listas/{idLista}")
    public ResponseEntity<HttpStatus> eliminarLista(@PathVariable Long idLista) {
        // En un entorno de producción, aquí se usaría un @ControllerAdvice para el manejo de excepciones
        listasService.eliminarLista(idLista);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
    }
}
