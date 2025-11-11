package com.medac.trello.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteRequestDTO(
        Long boardId,

        Long workspaceId,

        @Email(message = "Formato de email inválido")
        @NotBlank(message = "El email del invitado no puede ser nulo")
        String invitedEmail) {

    // 🛡️ Lógica de validación para asegurar que AL MENOS un ID está presente
    public InviteRequestDTO {
        if (boardId == null && workspaceId == null) {
            throw new IllegalArgumentException("Se requiere el ID del tablero o el ID del espacio de trabajo.");
        }
        if (boardId != null && workspaceId != null) {
            throw new IllegalArgumentException("La invitación solo puede ser para un tablero O un espacio de trabajo, no ambos.");
        }
    }
}

