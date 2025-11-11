package com.medac.trello.api.model.controller;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import com.medac.trello.api.dto.WorkspaceRequestDTO;
import com.medac.trello.api.service.BoardService;
import com.medac.trello.api.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/trello/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final BoardService boardService;

    @Autowired
    public WorkspaceController(WorkspaceService workspaceService, BoardService boardService) {
        this.workspaceService = workspaceService;
        this.boardService = boardService;
    }

    // --- ENDPOINT CREAR WORKSPACE ---

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(
            @Valid @RequestBody WorkspaceRequestDTO request,
            @AuthenticationPrincipal User authenticatedUser) { // Obtener el usuario del JWT

        Workspace newWorkspace = workspaceService.createWorkspace(request, authenticatedUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(newWorkspace);
    }

    // --- ENDPOINT LISTAR WORKSPACES DEL USUARIO ---

    @GetMapping
    public ResponseEntity<List<Workspace>> getWorkspacesForUser(
            @AuthenticationPrincipal User authenticatedUser) {

        List<Workspace> workspaces = workspaceService.getWorkspacesForUser(authenticatedUser.getId());

        return ResponseEntity.ok(workspaces);
    }

    // --- ENDPOINT OBTENER WORKSPACE POR ID ---

    @GetMapping("/{workspaceId}")
    @PreAuthorize("@workspaceAccessService.isOwnerOrMember(#workspaceId, authentication.principal.id)")
    public ResponseEntity<Workspace> getWorkspaceById(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal Object principal) {

        try {
            Workspace workspace = workspaceService.getWorkspaceById(workspaceId);
            return ResponseEntity.ok(workspace);

        } catch (ResourceNotFoundException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // -----------------------------------LISTAR MIEMBROS DE WORKSPACE (PROTEGIDO)------------------------------------------------------------------
    @GetMapping("/{workspaceId}/members")
//SOLO si es Dueño O Miembro del Workspace
    @PreAuthorize("@workspaceAccessService.isOwnerOrMember(#workspaceId, authentication.principal.id)")
    public ResponseEntity<Set<User>> getMembers(@PathVariable Long workspaceId) {
        try {
            Set<User> members = workspaceService.getMembers(workspaceId);

            return ResponseEntity.ok(members);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // -------------------------------ENDPOINT 8: ACTUALIZAR WORKSPACE (SOLO DUEÑO)------------------------------------------------------------------

    @PutMapping("/{workspaceId}")
// 🔑 SOLO el Dueño del Workspace puede realizar la actualización.
    @PreAuthorize("@workspaceAccessService.isOwner(#workspaceId, authentication.principal.id)")
    public ResponseEntity<Workspace> updateWorkspace(
            @PathVariable Long workspaceId,
            @Valid @RequestBody WorkspaceRequestDTO request) {

        try {
            Workspace updatedWorkspace = workspaceService.updateWorkspace(workspaceId, request);
            return ResponseEntity.ok(updatedWorkspace);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ------------------ENDPOINT 9: ELIMINAR WORKSPACE (SOLO DUEÑO)

    @DeleteMapping("/{workspaceId}")
//SOLO el Dueño del Workspace puede realizar la eliminación.
    @PreAuthorize("@workspaceAccessService.isOwner(#workspaceId, authentication.principal.id)")
    public ResponseEntity<String> deleteWorkspace(@PathVariable Long workspaceId) {
        try {
            workspaceService.deleteWorkspace(workspaceId);

            return ResponseEntity.ok("Espacio de trabajo con ID " + workspaceId + " eliminado exitosamente.");

        } catch (ResourceNotFoundException e) {
            // Devuelve 404 si el Workspace no existe
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ----------------ENDPOINT 10: LISTAR BOARDS DE WORKSPACE (PROTEGIDO)
    @GetMapping("/{workspaceId}/boards")
    // SOLO si es Dueño O Miembro del Workspace
    @PreAuthorize("@workspaceAccessService.isOwnerOrMember(#workspaceId, authentication.principal.id)")
    public ResponseEntity<List<Board>> getBoardsByWorkspace(
            @PathVariable Long workspaceId) {

        try {
            List<Board> boards = boardService.getBoardsByWorkspace(workspaceId);

            // Nota: Podrías mapear esto a List<BoardResponseDTO> para enviar solo la información necesaria.
            return ResponseEntity.ok(boards);

        } catch (Exception e) {
            // Manejo de errores genérico (ResourceNotFound, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

