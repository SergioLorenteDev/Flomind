package com.medac.trello.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LabelRequestDTO {

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres.")
    private String name; // ⬅️ Campo estandarizado


    @Size(max = 7, message = "El color debe ser un código HEX válido.")
    private String colour; // ⬅️ Campo estandarizado

    // --- Constructor sin argumentos
    public LabelRequestDTO() {}

    // --- Constructor con argumentos (Opcional, útil para tests) ---
    public LabelRequestDTO(String name, String colour) {
        this.name = name;
        this.colour = colour;
    }

    // --- Getters y Setters ---

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }
}

