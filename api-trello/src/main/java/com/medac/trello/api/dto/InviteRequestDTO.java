package com.medac.trello.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

// Usado para enviar la invitación desde el Frontend
public record InviteRequestDTO(

        @NotEmpty(message = "role es obligatorio")
        String role,

        @Email(message = "Formato de email inválido")
        @NotEmpty(message = "El email del invitado no puede estar vacio")
        String email) {
}

