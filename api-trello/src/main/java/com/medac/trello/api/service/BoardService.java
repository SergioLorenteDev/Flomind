package com.medac.trello.api.service;

import com.medac.trello.api.dto.BoardMemberDTO;
import com.medac.trello.api.dto.BoardRequestDTO;
import com.medac.trello.api.dto.BoardResponseDTO;
import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.exception.SubscriptionLimitException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.*;
import com.medac.trello.api.model.Workspace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static com.medac.trello.api.model.Invitation.Estado.ACEPTADA;
import static java.util.stream.Collectors.toSet;

@Service
public class BoardService {

    private static final int BOARD_LIMIT = 5;

    private final BoardRepository boardRepository;
    private final ListaRepository listaRepository;
    private final HistorialMovimientoRepository historialMovimientoRepository;
    private final LabelRepository labelRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    // 🔹 NUEVO
    private final WorkspaceRepository workspaceRepository;

    @Autowired
    public BoardService(
            BoardRepository boardRepository,
            ListaRepository listaRepository,
            HistorialMovimientoRepository historialMovimientoRepository,
            LabelRepository labelRepository,
            InvitationRepository invitationRepository,
            UserRepository userRepository,
            SubscriptionService subscriptionService,
            WorkspaceRepository workspaceRepository  // 👈
    ) {
        this.boardRepository = boardRepository;
        this.listaRepository = listaRepository;
        this.historialMovimientoRepository = historialMovimientoRepository;
        this.labelRepository = labelRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
        this.workspaceRepository = workspaceRepository; // 👈
    }

    // ---------- CREAR
    @Transactional
    public Board guardarBoard(BoardRequestDTO board, User user) {

        long boardCount = boardRepository.countByCreatedBy(user);
        if (boardCount >= BOARD_LIMIT) {
            boolean isSubscribed = subscriptionService.isUserSubscribed(user);
            if (!isSubscribed) {
                throw new SubscriptionLimitException("Has alcanzado el límite de " + BOARD_LIMIT +
                        " tableros. Suscríbete para crear más.");
            }
        }

        Board newBoard = new Board(
                board.getName(),
                board.getDescription(),
                board.getBackground(),
                Instant.now(),
                user
        );

        // 🔹 asignar workspace si viene
        if (board.getWorkspaceId() != null) {
            Workspace ws = workspaceRepository.findById(board.getWorkspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Espacio no encontrado"));
            newBoard.setWorkspace(ws);
        }

        return boardRepository.save(newBoard);
    }

    // ---------- LEER
    @Transactional(readOnly = true)
    public List<Board> obtenerTodosLosBoards() {
        return boardRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Board obtenerBoardPorId(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public Set<Board> obtenerTablerosPorUsuario(Long userId) {
        if (userId == null) {
            return Set.of();
        }
        return userRepository.findById(userId)
                .map(user -> boardRepository.findDistinctByCreatedByOrMembersContaining(user, user))
                .orElse(Set.of());
    }

    @Transactional(readOnly = true)
    public BoardResponseDTO obtenerBoardConRol(Long boardId, Long userId) {
        Board board = obtenerBoardPorId(boardId);
        return mapToBoardResponse(board, userId);
    }

    public BoardResponseDTO mapToBoardResponse(Board board, Long userId) {
        BoardResponseDTO dto = new BoardResponseDTO(board);
        dto.setCurrentUserRole(resolveUserRole(board, userId));
        return dto;
    }

    private String resolveUserRole(Board board, Long userId) {
        if (board == null || userId == null) return null;
        if (board.getCreatedBy() != null && userId.equals(board.getCreatedBy().getId())) {
            return "admin";
        }
        return boardRepository.findMemberRole(board.getId(), userId)
                .orElseGet(() -> recoverRoleFromInvitation(board, userId));
    }

    private String recoverRoleFromInvitation(Board board, Long userId) {
        if (board == null || userId == null) return null;
        return userRepository.findById(userId)
                .flatMap(user -> invitationRepository
                        .findFirstByBoard_IdAndInviteeEmailAndStatusOrderByCreationDateDesc(
                                board.getId(),
                                user.getEmail(),
                                ACEPTADA
                        )
                )
                .map(invitation -> {
                    String normalized = normalizeRoleValue(invitation.getRole());
                    if (normalized != null) {
                        boardRepository.updateMemberRole(board.getId(), userId, normalized);
                    }
                    return normalized;
                })
                .orElse(null);
    }

    private String normalizeRoleValue(String role) {
        if (role == null) return null;
        String normalized = role.trim().toLowerCase();
        return switch (normalized) {
            case "admin", "editor", "lector" -> normalized;
            default -> null;
        };
    }

    @Transactional(readOnly = true)
    public List<BoardMemberDTO> obtenerMiembros(Long boardId, Long requesterId) {
        Board board = obtenerBoardPorId(boardId);
        assertUserCanViewBoard(board, requesterId);

        List<BoardMemberDTO> members = new ArrayList<>();
        var owner = board.getCreatedBy();
        if (owner != null) {
            members.add(new BoardMemberDTO(
                    owner.getId(),
                    owner.getName(),
                    owner.getEmail(),
                    "admin",
                    true
            ));
        }

        boardRepository.findBoardMembers(boardId).forEach(projection -> {
            boolean isOwner = projection.getOwnerFlag() != null && projection.getOwnerFlag() == 1;
            if (isOwner && owner != null && owner.getId().equals(projection.getUserId())) {
                return;
            }
            members.add(new BoardMemberDTO(
                    projection.getUserId(),
                    projection.getName(),
                    projection.getEmail(),
                    normalizeAssignableRole(projection.getRole()),
                    isOwner
            ));
        });

        return members;
    }

    @Transactional
    public BoardMemberDTO actualizarRolMiembro(Long boardId, Long requesterId, Long memberId, String requestedRole) {
        Board board = obtenerBoardPorId(boardId);
        assertUserCanManageBoard(board, requesterId);
        ensureNotOwner(board, memberId);

        var normalizedRole = normalizeAssignableRole(requestedRole);
        if (normalizedRole == null) {
            throw new IllegalArgumentException("Rol inválido. Usa 'lector' o 'editor'.");
        }

        boardRepository.findMemberRole(boardId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro no encontrado en este tablero."));

        boardRepository.updateMemberRole(boardId, memberId, normalizedRole);

        var memberUser = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        return new BoardMemberDTO(
                memberUser.getId(),
                memberUser.getName(),
                memberUser.getEmail(),
                normalizedRole,
                false
        );
    }

    @Transactional
    public void eliminarMiembro(Long boardId, Long requesterId, Long memberId) {
        Board board = obtenerBoardPorId(boardId);
        assertUserCanManageBoard(board, requesterId);
        ensureNotOwner(board, memberId);

        boardRepository.findMemberRole(boardId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro no encontrado en este tablero."));

        boardRepository.deleteMember(boardId, memberId);
    }

    private void assertUserCanViewBoard(Board board, Long userId) {
        if (board == null || userId == null) {
            throw new AccessDeniedException("No autorizado para ver los miembros de este tablero.");
        }
        if (board.getCreatedBy() != null && userId.equals(board.getCreatedBy().getId())) return;
        boolean isMember = boardRepository.findMemberRole(board.getId(), userId).isPresent();
        if (!isMember) {
            throw new AccessDeniedException("No autorizado para ver este tablero.");
        }
    }

    private void assertUserCanManageBoard(Board board, Long userId) {
        if (board == null || userId == null || board.getCreatedBy() == null) {
            throw new AccessDeniedException("No autorizado para modificar miembros.");
        }
        if (!userId.equals(board.getCreatedBy().getId())) {
            throw new AccessDeniedException("Solo el propietario puede modificar los miembros.");
        }
    }

    private void ensureNotOwner(Board board, Long memberId) {
        if (board.getCreatedBy() != null && board.getCreatedBy().getId().equals(memberId)) {
            throw new IllegalArgumentException("No se puede modificar al propietario del tablero.");
        }
    }

    private String normalizeAssignableRole(String role) {
        if (role == null) return null;
        return switch (role.trim().toLowerCase()) {
            case "editor", "lector" -> role.trim().toLowerCase();
            default -> null;
        };
    }

    // ---------- ACTUALIZAR
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

        // (si quisieras mover el tablero de espacio, aquí podrías setear workspace)

        return boardRepository.save(boardExistente);
    }

    // ---------- ELIMINAR
    @Transactional
    public void eliminarBoard(Long id) {
        Board boardExistente = boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tablero no encontrado con id: " + id));

        Set<Lista> listas = listaRepository.findAllByBoard_Id(id);
        Set<Long> cardIds = listas.stream()
                .flatMap(lista -> lista.getTarjetas().stream())
                .map(Card::getId)
                .collect(toSet());

        if (!cardIds.isEmpty()) {
            historialMovimientoRepository.deleteAllByTarjetaIdIn(cardIds);
        }

        labelRepository.deleteAllByOwningBoardId(id);
        listaRepository.deleteAllByBoard_Id(id);
        invitationRepository.deleteAllByBoardId(boardExistente.getId());
        boardRepository.delete(boardExistente);
    }
}
