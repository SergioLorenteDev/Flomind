package com.medac.trello.api.model.controller;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import com.medac.trello.api.service.WorkspaceService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/espacios-trabajo", produces = MediaType.APPLICATION_JSON_VALUE)
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public List<Workspace> myWorkspaces(@AuthenticationPrincipal User user) {
        return workspaceService.findMyWorkspaces(user);
    }

    @GetMapping("/{id}")
    public Workspace getOne(@PathVariable Long id, @AuthenticationPrincipal User user) {
        // opcional: validar que el usuario puede verlo; si sólo owner, usa findForOwner(id, user.getId())
        return workspaceService.findByIdOrThrow(id);
    }

    public static record CreateWorkspaceRequest(@NotBlank String name, String description) {}

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Workspace> create(
            @RequestBody CreateWorkspaceRequest body,
            @AuthenticationPrincipal User user
    ) {
        var ws = workspaceService.create(body.name(), body.description(), user);
        return ResponseEntity.ok(ws);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        workspaceService.delete(id, user); // 👈 aquí se borran los tableros del espacio y luego el espacio
        return ResponseEntity.noContent().build();
    }
}
