package com.medac.trello.api.view;

public record UserView(
        long id,
        String username,
        String email,
        String name) {
}
