package com.medac.trello.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "historial_movimiento")
public class HistorialMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación Mucho a Uno con la Tarjeta que se movió
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarjeta", nullable = false)
    private Card tarjeta;

    // Lista de donde vino (puede ser nula si es la primera vez que se asigna a una lista)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lista_origen")
    private Lista listaOrigen;

    // Lista a donde fue (siempre obligatoria)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lista_destino", nullable = false)
    private Lista listaDestino;

    @Column(name = "fecha_movimiento", nullable = false)
    private Instant fechaMovimiento;

    // Constructor sin argumentos (necesario para JPA)
    public HistorialMovimiento() {}

    // Constructor completo (usado en el CardService)
    public HistorialMovimiento(Card tarjeta, Lista listaOrigen, Lista listaDestino, Instant fechaMovimiento) {
        this.tarjeta = tarjeta;
        this.listaOrigen = listaOrigen;
        this.listaDestino = listaDestino;
        this.fechaMovimiento = fechaMovimiento;
    }

    // --- Getters y Setters (Necesarios) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Card getTarjeta() { return tarjeta; }
    public void setTarjeta(Card tarjeta) { this.tarjeta = tarjeta; }

    public Lista getListaOrigen() { return listaOrigen; }
    public void setListaOrigen(Lista listaOrigen) { this.listaOrigen = listaOrigen; }

    public Lista getListaDestino() { return listaDestino; }
    public void setListaDestino(Lista listaDestino) { this.listaDestino = listaDestino; }

    public Instant getFechaMovimiento() { return fechaMovimiento; }
    public void setFechaMovimiento(Instant fechaMovimiento) { this.fechaMovimiento = fechaMovimiento; }
}