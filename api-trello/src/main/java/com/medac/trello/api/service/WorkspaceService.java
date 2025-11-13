package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import com.medac.trello.api.model.repository.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final BoardService boardService;

    public WorkspaceService(WorkspaceRepository workspaceRepository, BoardService boardService) {
        this.workspaceRepository = workspaceRepository;
        this.boardService = boardService;
    }

    @Transactional(readOnly = true)
    public List<Workspace> findMyWorkspaces(User owner) {
        return workspaceRepository.findAllByOwner(owner);
    }

    @Transactional(readOnly = true)
    public Workspace findByIdOrThrow(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espacio no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public Workspace findForOwner(Long id, Long ownerId) {
        return workspaceRepository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Espacio no encontrado o sin permisos."));
    }

    @Transactional
    public Workspace create(String name, String description, User owner) {
        var ws = new Workspace(name, description, owner);
        return workspaceRepository.save(ws);
    }

    @Transactional
    public Workspace rename(Long id, String newName, User requester) {
        var ws = findByIdOrThrow(id);
        ensureOwner(ws, requester);
        ws.setName(newName);
        return workspaceRepository.save(ws);
    }

    @Transactional
    public void delete(Long id, User requester) {
        var ws = findByIdOrThrow(id);
        ensureOwner(ws, requester);

        // 🔥 BORRAMOS TODOS SUS TABLEROS CORRECTAMENTE
        for (Board b : ws.getBoards()) {
            boardService.eliminarBoard(b.getId()); // limpia listas, historial, etiquetas, invitaciones
        }

        workspaceRepository.delete(ws);
    }

    private void ensureOwner(Workspace ws, User requester) {
        if (ws.getOwner() == null || requester == null || !ws.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException("No eres el propietario del espacio.");
        }
    }
}
