package com.medac.trello.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "suscripcion") // Mapea a la tabla 'suscripcion'
public class Subscription {

    // El ID primario es el ID del usuario (Relación One-to-One con Usuario)
    @Id
    @Column(name = "id_usuario")
    private Long userId;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "estado", nullable = false)
    private String status; // Ej: 'FREE', 'ACTIVE', 'CANCELED'

    @Column(name = "fecha_expiracion")
    private LocalDateTime expirationDate;


    // --- Constructores ---

    // Constructor por defecto requerido por JPA
    public Subscription() {
        this.status = "FREE";
    }

    // Constructor para inicializar una nueva suscripción por ID de usuario
    public Subscription(Long userId) {
        this.userId = userId;
        this.status = "FREE";
    }


    // --- Getters y Setters ---

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public String getStripeSubscriptionId() {
        return stripeSubscriptionId;
    }

    public void setStripeSubscriptionId(String stripeSubscriptionId) {
        this.stripeSubscriptionId = stripeSubscriptionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }
}
