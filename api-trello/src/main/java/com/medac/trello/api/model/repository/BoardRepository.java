package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.projection.BoardMemberProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    Set<Board> findAllByCreatedBy(User user);

    Set<Board> findDistinctByCreatedByOrMembersContaining(User owner, User member);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "UPDATE miembro_tablero SET rol = :role WHERE id_tablero = :boardId AND id_usuario = :userId", nativeQuery = true)
    void updateMemberRole(@Param("boardId") Long boardId, @Param("userId") Long userId, @Param("role") String role);

    @Query(value = "SELECT rol FROM miembro_tablero WHERE id_tablero = :boardId AND id_usuario = :userId LIMIT 1", nativeQuery = true)
    Optional<String> findMemberRole(@Param("boardId") Long boardId, @Param("userId") Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "DELETE FROM miembro_tablero WHERE id_tablero = :boardId AND id_usuario = :userId", nativeQuery = true)
    void deleteMember(@Param("boardId") Long boardId, @Param("userId") Long userId);

    @Query(value = """
            SELECT
                u.id_usuario as userId,
                u.nombre as name,
                u.email as email,
                mt.rol as role,
                CASE WHEN t.id_usuario_creador = u.id_usuario THEN 1 ELSE 0 END AS ownerFlag
            FROM miembro_tablero mt
            JOIN usuario u ON u.id_usuario = mt.id_usuario
            JOIN tablero t ON t.id_tablero = mt.id_tablero
            WHERE mt.id_tablero = :boardId
            """, nativeQuery = true)
    List<BoardMemberProjection> findBoardMembers(@Param("boardId") Long boardId);
}
