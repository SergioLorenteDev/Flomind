package com.medac.trello.api.view;

import java.time.Instant;
import java.util.Set;

public record BoardView(
        Long id,
        String name,
        String description,
        String background,
        Instant createdOn,
        Long createdBy,
        Set<UserView> members
) {
}
