package com.medac.trello.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

// Usado para enviar la invitación desde el Frontend
public record InviteRequestDTO(
        @NotNull(message = "El ID del Tablero no puede ser nulo")
        Long boardId,

        @Email(message = "Formato de email inválido")
        @NotNull(message = "El email del invitado no puede ser nulo")
        String invitedEmail) {
}
