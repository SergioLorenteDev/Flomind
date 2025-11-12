package com.medac.trello.api.model;

import jakarta.persistence.*;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "suscripcion") // Nombre de la tabla en base de datos
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_suscripcion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private User user;

    @Column(name = "plan_nombre", nullable = false)
    private String planName; // Ej: "Premium", "Pro", etc.

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate startDate;

    @Column(name = "fecha_expiracion")
    private LocalDate expirationDate;

    // Campo clave para la lógica de negocio en SubscriptionService
    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Constructores, Getters y Setters

    // Constructor por defecto requerido por JPA
    public Subscription() {
    }

    public Subscription(User user, String planName, LocalDate startDate, LocalDate expirationDate, boolean isActive) {
        this.user = user;
        this.planName = planName;
        this.startDate = startDate;
        this.expirationDate = expirationDate;
        this.isActive = isActive;
        this.lastUpdated = LocalDateTime.now();
    }

    // --- Getters y Setters (Necesitas generarlos en IntelliJ o añadirlos aquí) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
        this.lastUpdated = LocalDateTime.now(); // Actualizar la marca de tiempo al cambiar el estado
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}