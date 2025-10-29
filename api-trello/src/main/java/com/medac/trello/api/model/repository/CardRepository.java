package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Card;
import org.springframework.data.jpa.repository.JpaRepository; // Cambiamos a JpaRepository
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;


public interface CardRepository extends JpaRepository<Card, Long> {


    Set<Card> findByLista_IdLista(Long listId);

    List<Card> findByLista_Board_Id(Long boardId);



}