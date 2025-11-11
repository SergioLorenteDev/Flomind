package com.medac.trello.api.service;

import com.medac.trello.api.model.repository.BoardRepository;
import com.medac.trello.api.model.repository.ListaRepository;
import com.medac.trello.api.model.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("boardAccessService")
public class BoardAccessService {

    private final BoardRepository boardRepository;
    private final ListaRepository listaRepository;
    private final CardRepository cardRepository;
    private final WorkspaceAccessService workspaceAccessService;

    @Autowired
    public BoardAccessService(
            BoardRepository boardRepository,
            ListaRepository listaRepository,
            CardRepository cardRepository,
            WorkspaceAccessService workspaceAccessService) {

        this.boardRepository = boardRepository;
        this.listaRepository = listaRepository;
        this.cardRepository = cardRepository;
        this.workspaceAccessService = workspaceAccessService;
    }


     //Verifica si el usuario puede acceder al tablero.

    public boolean canAccessBoard(Long boardId, Long userId) {
        return boardRepository.findById(boardId)
                .map(board -> {
                    // 1. Verificar Dueño del Board
                    if (board.getOwnerId() != null && board.getOwnerId().equals(userId)) {
                        return true;
                    }

                    // 2. Verificar Miembro Directo del Board
                    if (board.isMember(userId)) {
                        return true;
                    }

                    // 3. Verificar Miembro del Workspace
                    Long workspaceId = board.getWorkspace().getId();
                    return workspaceAccessService.isOwnerOrMember(workspaceId, userId);
                })
                .orElse(false);
    }


    public boolean isBoardOwner(Long boardId, Long userId) {
        return boardRepository.findById(boardId)
                .map(board -> board.getOwnerId() != null && board.getOwnerId().equals(userId))
                .orElse(false);
    }

   //acceder a lista
    public boolean canAccessList(Long listId, Long userId) {
        return listaRepository.findById(listId)
                .map(lista -> {
                    Long boardId = lista.getBoard().getId();
                    return canAccessBoard(boardId, userId);
                })
                .orElse(false);
    }

   //verifica si el usuario puede acceder a una tarjeta
    public boolean canAccessCard(Long cardId, Long userId) {
        return cardRepository.findById(cardId)
                .map(card -> {
                    // Obtener el ID del tablero padre a través de Lista.
                    Long boardId = card.getLista().getBoard().getId();

                    return canAccessBoard(boardId, userId);
                })
                .orElse(false);
    }
}
