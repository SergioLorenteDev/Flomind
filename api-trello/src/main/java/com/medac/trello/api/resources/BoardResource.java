package com.medac.trello.api.resources;


import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.view.BoardView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

import static java.util.stream.Collectors.toSet;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping(value = "/boards", produces = APPLICATION_JSON_VALUE)
public class BoardResource implements TrelloApi {

    private final BoardRepository boardRepository;

    @Autowired
    public BoardResource(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @GetMapping
    public ResponseEntity<Set<BoardView>> boardsOwnedBy(@RequestParam Long ownerId) {

        return ok(boardRepository.findAllByCreatedBy(ownerId).stream()
                .map(b -> new BoardView(
                        b.getId(),
                        b.getName(),
                        b.getDescription(),
                        b.getCreatedOn()
                ))
                .collect(toSet()));
    }
}
