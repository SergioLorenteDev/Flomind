package com.medac.trello.api.model.notification;

public record ListaAddedNotificationDetails(String listName, String boardName)
        implements NotificationDetails {

    @Override
    public String buildDescription() {
        return String.format("La lista %s ha sido añadida al tablero %s",
                listName, boardName);
    }
}
