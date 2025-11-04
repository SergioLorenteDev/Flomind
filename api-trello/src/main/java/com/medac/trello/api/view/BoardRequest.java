package com.medac.trello.api.view;

import java.util.Objects;

public class BoardRequest {

    private String name;
    private String description;
    private String background;
    private Long createdBy; // Usamos Long, ya que representa un 'id' de usuario

    // 1. CONSTRUCTOR VACÍO (Obligatorio para Spring Boot/Jackson al deserializar el JSON)
    public BoardRequest() {
    }

    // 2. Getters
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public String getBackground() {
        return background;
    }

    // 3. Setters (Necesarios para que Jackson inyecte los valores del JSON)
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    // Opcional: Métodos toString, equals y hashCode, aunque solo son necesarios
    // si usas el objeto en colecciones o para depuración.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BoardRequest that = (BoardRequest) o;
        return Objects.equals(name, that.name) && Objects.equals(createdBy, that.createdBy) && Objects.equals(background, that.background);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, background, createdBy);
    }
}
