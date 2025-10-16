package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Card;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface CardRepository extends CrudRepository<Card, UUID> {

    Set<Card> findAllByOwningListId(Long listId);
}
