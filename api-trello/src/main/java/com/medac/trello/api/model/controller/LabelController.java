package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.LabelRequestDTO;
import com.medac.trello.api.dto.LabelResponseDTO;
import com.medac.trello.api.model.Label;
import com.medac.trello.api.service.BoardAccessService;
import com.medac.trello.api.service.LabelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(value = "/trello/v1/tableros/{boardId}/labels", produces = APPLICATION_JSON_VALUE)
public class LabelController {

    private final LabelService labelService;
    private final BoardAccessService boardAccessService; // Inyección de seguridad

    @Autowired
    public LabelController(LabelService labelService, BoardAccessService boardAccessService) {
        this.labelService = labelService;
        this.boardAccessService = boardAccessService;
    }

    // ---------------------- C - CREAR ETIQUETA ----------------------
    // POST /trello/v1/tableros/{boardId}/labels
    @PostMapping
    @PreAuthorize("@boardAccessService.canAccessBoard(#boardId, authentication.principal.id)")
    public ResponseEntity<LabelResponseDTO> createLabel(
            @PathVariable Long boardId,
            @Valid @RequestBody LabelRequestDTO labelDto) {

        Label nuevaLabel = labelService.createLabel(
                boardId,
                labelDto.getName(),
                labelDto.getColour()
        );

        return new ResponseEntity<>(new LabelResponseDTO(nuevaLabel), HttpStatus.CREATED);
    }

    // ---------------------- R - LISTAR ETIQUETAS ----------------------
    // GET /trello/v1/tableros/{boardId}/labels
    @GetMapping
    @PreAuthorize("@boardAccessService.canAccessBoard(#boardId, authentication.principal.id)")
    public ResponseEntity<List<LabelResponseDTO>> listBoardLabels(@PathVariable Long boardId) {

        List<Label> labels = labelService.listBoardLabels(boardId);

        List<LabelResponseDTO> response = labels.stream()
                .map(LabelResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ---------------------- U - ACTUALIZAR ETIQUETA ----------------------
    // PUT /trello/v1/tableros/{boardId}/labels/{labelId}
    @PutMapping("/{labelId}")
    @PreAuthorize("@boardAccessService.canAccessBoard(#boardId, authentication.principal.id)")
    public ResponseEntity<LabelResponseDTO> updateLabel(
            @PathVariable Long boardId,
            @PathVariable Long labelId,
            @Valid @RequestBody LabelRequestDTO labelDto) {

        Label labelActualizada = labelService.updateLabel(
                boardId,
                labelId,
                labelDto.getName(),
                labelDto.getColour()
        );

        return ResponseEntity.ok(new LabelResponseDTO(labelActualizada));
    }

    // ---------------------- D - ELIMINAR ETIQUETA ----------------------
    // DELETE /trello/v1/tableros/{boardId}/labels/{labelId}
    @DeleteMapping("/{labelId}")
    @PreAuthorize("@boardAccessService.canAccessBoard(#boardId, authentication.principal.id)")
    public ResponseEntity<Void> deleteLabel(
            @PathVariable Long boardId,
            @PathVariable Long labelId) {

        labelService.deleteLabel(boardId, labelId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
    }
}