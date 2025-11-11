package com.medac.trello.api.service;

import com.medac.trello.api.model.repository.SubscriptionRepository;
import com.medac.trello.api.model.Subscription;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }


    @Transactional(readOnly = true)
    public boolean isUserPremium(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(Subscription::getStatus)
                .map(status -> status.equalsIgnoreCase("ACTIVE"))
                .orElse(false); // Si no hay registro de suscripción, es GRATUITO
    }


    @Transactional
    public void updateSubscriptionStatus(Long userId, String newStatus, String stripeSubscriptionId) {
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> new Subscription(userId));

        sub.setStatus(newStatus);
        sub.setStripeSubscriptionId(stripeSubscriptionId);

        subscriptionRepository.save(sub);
    }

    // -----MÉTODOS DE SIMULACIÓN VISUAL (PARA PRUEBAS FREEMIUM)

    @Transactional
    public void activateSimulatedPro(Long userId) {
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> new Subscription(userId));

        // Forzamos el estado a ACTIVE (PRO) y añadimos un ID de simulación.
        sub.setStatus("ACTIVE");
        sub.setStripeSubscriptionId("SIMULATED_PRO_" + userId);

        subscriptionRepository.save(sub);
    }


    @Transactional
    public void deactivateSimulatedPro(Long userId) {
        subscriptionRepository.findByUserId(userId)
                .ifPresent(sub -> {
                    // Forzamos el estado a FREE
                    sub.setStatus("FREE");
                    sub.setStripeSubscriptionId(null);
                    subscriptionRepository.save(sub);
                });
    }
}
