package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    void deleteAllByOwningCardId(Long owningCardId);
}
