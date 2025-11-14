/*package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Board;
import com.medac.trello.api.model.Lista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ListaRepository extends JpaRepository<Lista, Long> {

    Set<Lista> findAllByIdTablero(Long boardId);
}

 */

package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Lista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface ListaRepository extends JpaRepository<Lista, Long> {

    /**
     * Busca todas las listas asociadas a un Board (Tablero) por el ID del Board.
     * CORRECCIÓN: Usamos 'findAllByBoard_Id' porque:
     * 1. 'Board' es el nombre de la propiedad de la entidad dentro de Lista.java.
     * 2. 'Id' es la clave primaria de la entidad Board.
     * La sintaxis es 'findBy[PropiedadEntidad]_[ClavePrimariaRelacionada]'.
     *
     * @param boardId El ID del tablero.
     * @return Un conjunto (Set) de Listas.
     */
    Set<Lista> findAllByBoardId(Long boardId);

    void deleteAllByBoard_Id(Long boardId);
}
