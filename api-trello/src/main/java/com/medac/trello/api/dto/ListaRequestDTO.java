package com.medac.trello.api.dto;

// Usado para recibir datos del cliente al crear o actualizar una Lista.

public class ListaRequestDTO {

    private String nombre;
    private Integer orden;
    private Long idTablero; // Clave: Solo se recibe el ID del padre

    // --- Getters y Setters ---

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public Long getIdTablero() { return idTablero; }
    public void setIdTablero(Long idTablero) { this.idTablero = idTablero; }
}