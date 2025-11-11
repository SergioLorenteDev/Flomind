package com.medac.trello.api.dto;

import com.medac.trello.api.model.Label;

public record LabelResponseDTO(
        Long id,
        String name,
        String colour,
        Long boardId
) {
    public LabelResponseDTO(Label label) {
        this(
                label.getId(),
                label.getName(),
                label.getColour(),
                label.getOwningBoardId()
        );
    }
}
