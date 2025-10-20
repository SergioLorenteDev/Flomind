package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lista")
public class List {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_lista")
    private long id;
    @Column(name = "nombre", nullable = false)
    private String name;
    @Column(name = "orden", nullable = false)
    private int order;
    @Column(name = "id_tablero", nullable = false)
    private long owningBoardId;

    public List(String name, int order, long owningBoardId) {
        this.name = name;
        this.order = order;
        this.owningBoardId = owningBoardId;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getOrder() {
        return order;
    }

    public long getOwningBoardId() {
        return owningBoardId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        List list = (List) o;
        return id == list.id;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
