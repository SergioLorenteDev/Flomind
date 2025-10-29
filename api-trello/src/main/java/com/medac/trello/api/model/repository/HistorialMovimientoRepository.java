package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.HistorialMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Usamos JpaRepository para obtener todas las funcionalidades CRUD y de paginación.
@Repository
public interface HistorialMovimientoRepository extends JpaRepository<HistorialMovimiento, Long> {

    // Spring Data JPA crea la implementación automáticamente.
    // No se necesitan métodos adicionales por ahora, ya que el CardService solo hace un .save()
}
