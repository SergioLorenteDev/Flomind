package com.medac.trello.api.model.notification;

public record ListaDeletedNotificationDetails(String listName, String boardName)
        implements NotificationDetails {

    @Override
    public String buildDescription() {
        return String.format("La lista %s ha sido borrada del tablero %s",
                listName, boardName);
    }
}
