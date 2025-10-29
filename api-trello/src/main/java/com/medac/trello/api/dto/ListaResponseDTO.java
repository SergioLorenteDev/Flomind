package com.medac.trello.api.dto;

import com.medac.trello.api.model.Lista;

// Usado para enviar datos al cliente.

public class ListaResponseDTO {

    private Long idLista;
    private String nombre;
    private Integer orden;
    private Long idTablero; // Clave: Solo se envía el ID del tablero padre

    // --- Constructor de Mapeo (desde la Entidad) ---
    public ListaResponseDTO(Lista lista) {
        this.idLista = lista.getIdLista();
        this.nombre = lista.getNombre();
        this.orden = lista.getOrden();
        // Usamos el getter de conveniencia que creamos en Lista
        this.idTablero = lista.getIdTablero();
    }

    // Constructor vacío (necesario para algunas serializaciones)
    public ListaResponseDTO() {}

    // --- Getters y Setters ---

    public Long getIdLista() { return idLista; }
    public void setIdLista(Long idLista) { this.idLista = idLista; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }

    public Long getIdTablero() { return idTablero; }
    public void setIdTablero(Long idTablero) { this.idTablero = idTablero; }
}