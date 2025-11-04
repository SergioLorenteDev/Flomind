package com.medac.trello.api.view;

import java.time.Instant;

public record BoardView(
        Long id,
        String name,
        String description,
        String background,
        Instant createdOn
) {
}
