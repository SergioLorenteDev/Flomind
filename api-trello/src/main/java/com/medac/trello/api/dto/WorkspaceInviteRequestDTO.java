package com.medac.trello.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record WorkspaceInviteRequestDTO(
        @Email(message = "Formato de email inválido")
        @NotBlank(message = "El email del invitado no puede ser nulo")
        String invitedEmail) {
}