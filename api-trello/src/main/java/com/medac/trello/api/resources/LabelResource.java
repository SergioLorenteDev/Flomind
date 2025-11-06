package com.medac.trello.api.resources;

import com.medac.trello.api.dto.LabelRequestDTO;
import com.medac.trello.api.dto.LabelResponseDTO;
import com.medac.trello.api.model.Label;
import com.medac.trello.api.service.LabelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(value = "/tableros/{boardId}/etiquetas", produces = APPLICATION_JSON_VALUE)
public class LabelResource {

    private final LabelService labelService;

    public LabelResource(LabelService labelService) {
        this.labelService = labelService;
    }

    @GetMapping
    public ResponseEntity<List<LabelResponseDTO>> list(@PathVariable Long boardId) {
        return ResponseEntity.ok(
                labelService.listBoardLabels(boardId)
                        .stream()
                        .map(LabelResponseDTO::new)
                        .toList()
        );
    }

    @PostMapping(consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<LabelResponseDTO> create(@PathVariable Long boardId,
                                                   @RequestBody LabelRequestDTO request) {
        Label created = labelService.createLabel(boardId, request.getText(), request.getColor());
        return ResponseEntity.status(HttpStatus.CREATED).body(new LabelResponseDTO(created));
    }

    @PutMapping(value = "/{labelId}", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<LabelResponseDTO> update(@PathVariable Long boardId,
                                                   @PathVariable Long labelId,
                                                   @RequestBody LabelRequestDTO request) {
        Label updated = labelService.updateLabel(boardId, labelId, request.getText(), request.getColor());
        return ResponseEntity.ok(new LabelResponseDTO(updated));
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<Void> delete(@PathVariable Long boardId, @PathVariable Long labelId) {
        labelService.deleteLabel(boardId, labelId);
        return ResponseEntity.noContent().build();
    }
}
