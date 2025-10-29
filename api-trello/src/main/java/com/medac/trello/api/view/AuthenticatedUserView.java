package com.medac.trello.api.view;

public record AuthenticatedUserView(
        String accessToken,
        String refreshToken,
        UserView user) {
}
