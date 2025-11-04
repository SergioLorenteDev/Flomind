package com.medac.trello.api.dto;

// Nota: Puedes usar Lombok para simplificar getters/setters si lo tienes.

public class BoardRequestDTO {

    private String name;
    private String description;
    private String background;
    private Long createdBy; // Opcional: si el cliente puede especificar el creador (en un entorno real, vendra del token de seguridad)

    // --- Getters y Setters (simplicidad) ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBackground() { return background; }
    public void setBackground(String background) { this.background = background; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
