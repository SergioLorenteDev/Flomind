
package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.repository.ListaRepository;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.repository.BoardRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Optional;


@Service
public class ListasService {

    @Autowired
    private ListaRepository listaRepository;

    @Autowired
    private BoardRepository boardRepository;

    // ----------------------CREAR LISTA-----------------
    @Transactional
    public Lista guardarLista(Long boardId, Lista lista) {
        // 1. Obtener el Board padre o lanzar excepción si no existe
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + boardId));

        // 2. Asignar la entidad Board completa a la lista
        lista.setBoard(board);

        // 🔑 CORRECCIÓN CRÍTICA: Asignar la posición automáticamente.
        // Las nuevas listas se añaden al final (la última posición + 1).
        Long totalListas = listaRepository.countAllByBoard_Id(boardId);

        // La posición será el número total de listas ya existentes (ej. si hay 0, la posición es 1)
        // O si ya tiene posición definida en la solicitud, se respeta.
        if (lista.getPosition() <= 0) {
            lista.setPosition(totalListas.intValue() + 1);
        } else {
            // Si el cliente envía una posición, se asume que se gestionará el reordenamiento después.
            // Por simplicidad de este método, asumimos que si no la envían, va al final.
        }

        // 3. Guardar la lista
        return listaRepository.save(lista);
    }

 //------------------------------LEER LITAS-----------------------------

    // R - Listar (Todos)
    public List<Lista> obtenerTodasLasListas() {
        return listaRepository.findAll();
    }

    // LISTAR POR TABLERO
    public Set<Lista> obtenerListasPorTablero(Long boardId) {
        // 🔑 CORRECCIÓN CRÍTICA: Usamos el método que definimos en el repositorio
        // para asegurar que estén ORDENADAS por la columna 'position'.
        // Ya no necesitamos verificar la existencia del board si el repositorio lanza una lista vacía,
        // pero es mejor para dar un error 404 claro.
        if (!boardRepository.existsById(boardId)) {
            throw new ResourceNotFoundException("Tablero no encontrado con id: " + boardId);
        }

        // Usamos la firma que definimos en ListaRepository: findAllByBoard_IdOrderByPositionAsc
        return listaRepository.findAllByBoard_IdOrderByPositionAsc(boardId);
    }


    // R - Listar (Por ID)
    public Lista obtenerListaPorId(Long idLista) {
        // Usa ResourceNotFoundException para manejar el caso de no encontrar el recurso
        return listaRepository.findById(idLista)
                .orElseThrow(() -> new ResourceNotFoundException("Lista no encontrada con id: " + idLista));
    }

    // -----------------------U - ACTUALIZAR LISTAS---------------------------
    @Transactional
    public Lista actualizarLista(Long idLista, Lista listaDetalles) {
        Lista listaExistente = listaRepository.findById(idLista)
                .orElseThrow(() -> new ResourceNotFoundException("Lista no encontrada con id: " + idLista));

        // 1. Actualizar campos simples (nombre y position)
        if (listaDetalles.getName() != null) { // ⬅️ CORREGIDO: Usar getName()
            listaExistente.setName(listaDetalles.getName());
        }

        // 🔑 CORREGIDO: Usar getPosition() y setPosition()
        if (listaDetalles.getPosition() > 0 && listaDetalles.getPosition() != listaExistente.getPosition()) {
            listaExistente.setPosition(listaDetalles.getPosition());
            // Nota: La lógica compleja de reordenamiento de otras listas no está aquí, solo se establece la nueva posición.
        }

        // 2. Lógica para mover la lista a otro tablero
        Board nuevoBoardDetalles = listaDetalles.getBoard();

        if (nuevoBoardDetalles != null && nuevoBoardDetalles.getId() != null) {
            Long nuevoBoardId = nuevoBoardDetalles.getId();

            // Solo actualizar si el ID del tablero es diferente al actual
            if (listaExistente.getBoard() == null || !Objects.equals(listaExistente.getBoard().getId(), nuevoBoardId)) {

                Board nuevoBoard = boardRepository.findById(nuevoBoardId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tablero destino no encontrado con id: " + nuevoBoardId));

                listaExistente.setBoard(nuevoBoard);

                // Si se mueve, la posición debe reajustarse al final del nuevo tablero
                if (listaExistente.getPosition() <= 0 || listaExistente.getBoard().getId().equals(nuevoBoardId)) {
                    Long totalListasNuevoBoard = listaRepository.countAllByBoard_Id(nuevoBoardId);
                    listaExistente.setPosition(totalListasNuevoBoard.intValue() + 1);
                }
            }
        }

        return listaRepository.save(listaExistente);
    }
    // -----------------------D - EÑLLIMINAR LISTA-------------------------
    @Transactional
    public void eliminarLista(Long idLista) {
        // Verificar si existe antes de intentar eliminar (opcional, pero buena práctica)
        if (!listaRepository.existsById(idLista)) {
            throw new ResourceNotFoundException("Lista no encontrada con id: " + idLista);
        }
        listaRepository.deleteById(idLista);
    }
}