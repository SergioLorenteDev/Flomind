package com.medac.trello.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN) // 403 Forbidden: El usuario no tiene permiso (suscripción)
public class SubscriptionLimitException extends RuntimeException {
    public SubscriptionLimitException(String message) {
        super(message);
    }
}