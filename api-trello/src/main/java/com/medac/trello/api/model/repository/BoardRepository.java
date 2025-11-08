package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface BoardRepository extends CrudRepository<Board, Long> {

    Set<Board> findAllByCreatedBy(User user);

    @Override
    List<Board> findAll();
}
