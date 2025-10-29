/*package com.medac.trello.api.model;

import jakarta.persistence.*;
import lombok.Data;

// Marca la clase como una tabla de DB
@Entity
@Table(name="Lista")
// Genera getters y setters
@Data
public class Lista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_lista")
    private Long idLista;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    // Relación Many-to-One con Tablero
    // Muchas Listas tienen un Tablero
    @ManyToOne
    @JoinColumn(name = "id_tablero", nullable = false)//COLUMNA FOREIGN KEY
    private Tablero tablero;



}


 */

/*package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lista")
public class Lista {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_lista")
    private Long idLista;
    @Column(name = "nombre", nullable = false)
    private String nombre;
    @Column(name = "orden", nullable = false)
    private int orden;
    @Column(name = "id_tablero", nullable = false)
    private Long idTablero;

    // 1. CONSTRUCTOR SIN ARGUMENTOS
    public Lista() {
    }

    // Constructor con argumentos
    public Lista(String nombre, int orden, long idTablero) {
        this.nombre = nombre;
        this.orden = orden;
        this.idTablero = idTablero;
    }

    //Getters
    public Long getIdLista() {
        return idLista;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getOrden() {
        return orden;
    }

    public Long getIdTablero() {
        return idTablero;
    }

    // Setters
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public void setIdTablero(Long idTablero) {
        this.idTablero = idTablero;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Lista lista = (Lista) o;
        return Objects.equals(idLista, lista.idLista);
    }

    @Override
    public int hashCode() {
        return idLista != null ? idLista.hashCode() : 0;
    }
}

 */

/*package com.medac.trello.api.model;

import jakarta.persistence.*;

import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lista")
public class Lista {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_lista")
    private Long idLista;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "orden", nullable = false)
    private int orden;

    // --- PUNTO CRÍTICO: RELACIÓN MANY-TO-ONE ---
    // El nombre del campo 'board' coincide con el 'mappedBy = "board"' en Board.java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tablero", nullable = false)
    private Board board;

    // 1. CONSTRUCTOR SIN ARGUMENTOS
    public Lista() {
    }

    // Constructor con argumentos
    public Lista(String nombre, int orden, Board board) {
        this.nombre = nombre;
        this.orden = orden;
        this.board = board;
    }

    // Getters
    public Long getIdLista() {
        return idLista;
    }

    public String getNombre() {
        return nombre;
    }

    public int getOrden() {
        return orden;
    }

    public Board getBoard() {
        return board;
    }

    // --- CONVENIENCE GETTER PARA id_tablero ---
    // Proporciona el ID del tablero asociado a esta lista, recuperándolo de la entidad Board.
    // Esto es útil para DTOs o respuestas sencillas sin exponer la relación completa.
    public Long getIdTablero() {
        return (board != null) ? board.getId() : null;
    }

    // Setters
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setOrden(int orden) {
        this.orden = orden;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Lista lista = (Lista) o;
        return Objects.equals(idLista, lista.idLista);
    }

    @Override
    public int hashCode() {
        return idLista != null ? idLista.hashCode() : 0;
    }
}

 */
package com.medac.trello.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "lista")
public class Lista {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_lista")
    private Long idLista;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    // --- PUNTO CRÍTICO: RELACIÓN MANY-TO-ONE ---
    // Usamos @JsonIgnore para romper el bucle de serialización JSON.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tablero", nullable = false)
    @JsonIgnoreProperties({"listas"})
    private Board board;

    // 🎯 RELACIÓN ONE-TO-MANY CON CARD (TARJETAS)
    // El "mappedBy" debe coincidir con el nombre de la propiedad en Card.java (ej: "lista")
    @OneToMany(mappedBy = "lista", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("cardOrder ASC") // Ordena las tarjetas por su campo 'cardOrder'
    @JsonIgnoreProperties({"lista"}) // Evita que la lista serialice de nuevo toda la tarjeta, aunque Card ya tiene @JsonIgnoreProperties({"listas"})
    private List<Card> tarjetas = new ArrayList<>();


    // 1. CONSTRUCTOR SIN ARGUMENTOS
    public Lista() {
    }

    // Constructor con argumentos
    public Lista(String nombre, int orden, Board board) {
        this.nombre = nombre;
        this.orden = orden;
        this.board = board;
    }

    // Getters
    public Long getIdLista() {
        return idLista;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getOrden() {
        return orden;
    }

    public Board getBoard() {
        return board;
    }

    // --- CONVENIENCE GETTER PARA id_tablero ---
    // Este getter es seguro de usar ya que solo devuelve el ID, no el objeto Board.
    public Long getIdTablero() {
        return (board != null) ? board.getId() : null;
    }

    // Setters
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public void setIdLista(Long idLista) {this.idLista = idLista;}

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Lista lista = (Lista) o;
        return Objects.equals(idLista, lista.idLista);
    }

    @Override
    public int hashCode() {
        return idLista != null ? idLista.hashCode() : 0;
    }
}