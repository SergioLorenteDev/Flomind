package com.medac.trello.api.model.controller;

import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.User;
import com.medac.trello.api.service.InvitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // Para obtener el usuario actual
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

   //--------------------------ENDPOINT PARA ACEPTAR LA INVITACION----------------

    @GetMapping("/accept")
    public ResponseEntity<?> acceptInvitation(@RequestParam String token, @RequestParam String email) {

        // 1. Obtener el email del enlace (no se puede asumir que el usuario esa logeado)

        try {
            // 2. Llamar al servicio para procesar la aceptación
            invitationService.acceptInvitation(token, email);

            return ResponseEntity.ok("Invitation successfully accepted. User added to board.");

        } catch (RuntimeException e) {
            // 3. Manejo de errores (invitación no válida, usuario incorrecto, etc.)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //-------------------------------------ENDPOINT PARA VER LAS INVITACIONES-----------------

    @GetMapping("/invitations/received")
    public ResponseEntity<List<Invitation>> getReceivedInvitations(@AuthenticationPrincipal User authenticatedUser) {

        String userEmail = authenticatedUser.getEmail();

        List<Invitation> invitations = invitationService.getReceivedInvitations(userEmail);

        return ResponseEntity.ok(invitations);
    }
}
