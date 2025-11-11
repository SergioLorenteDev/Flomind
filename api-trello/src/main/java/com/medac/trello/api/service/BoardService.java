package com.medac.trello.api.service;

import com.medac.trello.api.dto.CreateBoardDTO;
import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.exception.SubscriptionLimitException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.HistorialMovimientoRepository;
import com.medac.trello.api.model.repository.LabelRepository;
import com.medac.trello.api.model.repository.ListaRepository;
import com.medac.trello.api.model.repository.UserRepository; // Necesario para crear miembros
import com.medac.trello.api.dto.CreateBoardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException; // Para la seguridad
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class BoardService {

    private static final int MAX_FREE_BOARDS = 5; //los tableros maximos que gratuitamente podemos crear
    private BoardRepository boardRepository;
    private final SubscriptionService subscriptionService;
    private final ListaRepository listaRepository;
    private final HistorialMovimientoRepository historialMovimientoRepository;
    private final LabelRepository labelRepository;
    private final WorkspaceService workspaceService; // ⬅️ NUEVA INYECCIÓN
    private final UserRepository userRepository; // ⬅️ NUEVA INYECCIÓN

    @Autowired
    public BoardService(
            BoardRepository boardRepository,
            SubscriptionService subscriptionService,
            ListaRepository listaRepository,
            HistorialMovimientoRepository historialMovimientoRepository,
            LabelRepository labelRepository,
            WorkspaceService workspaceService,
            UserRepository userRepository
    ) {
        this.boardRepository = boardRepository;
        this.subscriptionService = subscriptionService;
        this.listaRepository = listaRepository;
        this.historialMovimientoRepository = historialMovimientoRepository;
        this.labelRepository = labelRepository;
        this.workspaceService = workspaceService;
        this.userRepository = userRepository;
    }

    //---------------------CREAR/GUARDAR (REFUERZO DE SEGURIDAD)-----------------------
    @Transactional
    public Board createBoard(CreateBoardDTO request, Long creatorId) {

        // 1. Cargar el Workspace y verificar membresía del creador
        Workspace workspace = workspaceService.getWorkspaceById(request.getWorkspaceId());

        // 🛡️ Verificar si el creador es miembro/dueño del Workspace
        if (!workspace.isOwner(creatorId) && !workspace.isMember(creatorId)) {
            throw new AccessDeniedException("Solo miembros del espacio de trabajo pueden crear tableros en él.");
        }

        //-------------------------LOGICA FREEMIUM

        boolean isPremium = subscriptionService.isUserPremium(creatorId);

        if (!isPremium) {
            // boardRepository.countByOwnerId() debe existir en tu repositorio.
            long boardCount = boardRepository.countByOwnerId(creatorId);

            if (boardCount >= MAX_FREE_BOARDS) {
                // Lanza la excepción si es FREE y supera el límite
                throw new SubscriptionLimitException();
            }
        }

        // 2. Crear el Board usando el constructor con DTO
        Board newBoard = new Board(
                request,
                creatorId,
                workspace
        );

        // 3. Añadir el creador como miembro directo del Board
        User creatorUser = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario creador no encontrado."));

        newBoard.getMembers().add(creatorUser);

        return boardRepository.save(newBoard);
    }


    // OBTENER POR ID (MANTENER - necesario para otros servicios/controladores internos)
    @Transactional(readOnly = true)
    public Board obtenerBoardPorId(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));
    }

    /**
     * Obtiene todos los Boards que pertenecen a un Workspace específico.
     * @param workspaceId ID del Workspace.
     * @return Lista de Boards.
     */
    @Transactional(readOnly = true)
    public List<Board> getBoardsByWorkspace(Long workspaceId) {
        return boardRepository.findByWorkspaceId(workspaceId);
    }

    //  ------------------------ACTUALIZAR (MANTENER)-----------------------
    @Transactional
    public Board actualizarBoard(Long id, Board boardDetalles) {
        // ... (Tu lógica de actualización existente es correcta, pero quizás deberías usar un DTO aquí)
        Board boardExistente = obtenerBoardPorId(id); // Reutilizar el método de lectura

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

    //---------------------------ELIMINAR (MANTENER)----------------------------
    @Transactional
    public void eliminarBoard(Long id) {
        // ... (Tu lógica de eliminación existente es buena, asumiendo que las referencias de FK están manejadas)
        Board boardExistente = obtenerBoardPorId(id);

        // ... (lógica de limpieza de HistorialMovimiento y Labels) ...

        // Eliminar el tablero. (Asumimos que la limpieza de Listas es efectiva o se usa Cascade/OrphanRemoval)
        boardRepository.delete(boardExistente);
    }
}
