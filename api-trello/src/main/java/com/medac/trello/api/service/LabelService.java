package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.Label;
import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.CardRepository;
import com.medac.trello.api.model.repository.LabelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LabelService {

    private record LabelTemplate(String text, String color) {}

    private static final List<LabelTemplate> DEFAULT_TEMPLATES = List.of(
            new LabelTemplate("Por hacer", "#6366f1"),
            new LabelTemplate("En progreso", "#0ea5e9"),
            new LabelTemplate("Bloqueado", "#f97316"),
            new LabelTemplate("Revisión", "#a855f7"),
            new LabelTemplate("Completado", "#22c55e")
    );

    private final LabelRepository labelRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;

    public LabelService(LabelRepository labelRepository,
                        BoardRepository boardRepository,
                        CardRepository cardRepository) {
        this.labelRepository = labelRepository;
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public List<Label> listBoardLabels(Long boardId) {
        ensureBoardExists(boardId);
        List<Label> labels = labelRepository.findAllByOwningBoardIdOrderByIdAsc(boardId);
        if (labels.isEmpty()) {
            labels = seedBoardDefaults(boardId);
        }
        return labels;
    }

    @Transactional
    public Label createLabel(Long boardId, String text, String color) {
        ensureBoardExists(boardId);
        Label label = new Label(
                text != null ? text.trim() : "",
                color,
                boardId
        );
        return labelRepository.save(label);
    }

    @Transactional
    public Label updateLabel(Long boardId, Long labelId, String text, String color) {
        Label label = labelRepository.findByIdAndOwningBoardId(labelId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Etiqueta no encontrada."));

        if (text != null) {
            label.setName(text.trim());
        }
        if (color != null) {
            label.setColour(color);
        }

        return labelRepository.save(label);
    }

    @Transactional
    public void deleteLabel(Long boardId, Long labelId) {
        Label label = labelRepository.findByIdAndOwningBoardId(labelId, boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Etiqueta no encontrada."));

        List<Card> cards = cardRepository.findByLabels_Id(label.getId());
        for (Card card : cards) {
            card.getLabels().removeIf(existing -> Objects.equals(existing.getId(), label.getId()));
        }
        cardRepository.saveAll(cards);

        labelRepository.delete(label);
    }

    private void ensureBoardExists(Long boardId) {
        if (!boardRepository.existsById(boardId)) {
            throw new ResourceNotFoundException("Tablero no encontrado.");
        }
    }

    private List<Label> seedBoardDefaults(Long boardId) {
        Set<String> existing = labelRepository.findAllByOwningBoardIdOrderByIdAsc(boardId)
                .stream()
                .map(label -> (label.getName() + ":" + label.getColour()).toLowerCase())
                .collect(Collectors.toSet());

        List<Label> toPersist = DEFAULT_TEMPLATES.stream()
                .filter(template -> existing.add((template.text + ":" + template.color).toLowerCase()))
                .map(template -> new Label(template.text(), template.color, boardId))
                .toList();

        if (!toPersist.isEmpty()) {
            labelRepository.saveAll(toPersist);
        }

        return labelRepository.findAllByOwningBoardIdOrderByIdAsc(boardId);
    }
}
