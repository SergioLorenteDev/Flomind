package com.medac.trello.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Esto asegura que Spring Boot devuelva un código 403 Forbidden cuando se lanza.
@ResponseStatus(HttpStatus.FORBIDDEN)
public class SubscriptionLimitException extends RuntimeException {

    public SubscriptionLimitException() {
        super("Has alcanzado el límite máximo de " +
                "tableros permitidos para la cuenta gratuita. Por favor, actualiza a PRO.");
    }
}