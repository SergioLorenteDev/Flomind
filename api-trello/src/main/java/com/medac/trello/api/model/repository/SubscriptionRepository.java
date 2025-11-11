package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Subscription; // Asumimos que tu entidad se llama Subscription
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // Necesitas poder encontrar la suscripción por el ID del usuario
    Optional<Subscription> findByUserId(Long userId);
}