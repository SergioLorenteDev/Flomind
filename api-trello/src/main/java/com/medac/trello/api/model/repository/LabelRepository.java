package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {

    List<Label> findAllByOwningBoardIdOrderByIdAsc(Long boardId);

    Optional<Label> findByIdAndOwningBoardId(Long id, Long boardId);

    void deleteAllByOwningBoardId(Long boardId);
}
