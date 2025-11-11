package com.medac.trello.api.model.controller;

import com.medac.trello.api.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

interface AuthenticationPrincipalDetails {
    Long getId();
}


@RestController
@RequestMapping("/trello/v1/subscription/simulated") // SIMULACION DE LA SUSCRIPCION
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // Endpoint para SIMULAR la activación de la cuenta PRO.

    @PostMapping("/activate")
    public ResponseEntity<String> simulateProActivation(@AuthenticationPrincipal Object principal) {

        // Asumiendo que el ID del usuario está en el principal
        Long userId = ((AuthenticationPrincipalDetails) principal).getId();

        subscriptionService.activateSimulatedPro(userId);

        return ResponseEntity.ok("Suscripción PRO simulada activada. El límite de 5 tableros ha sido levantado.");
    }

    //Endpoint para SIMULAR el downgrade a cuenta FREE.

    @PostMapping("/deactivate")
    public ResponseEntity<String> simulateFreeDowngrade(@AuthenticationPrincipal Object principal) {

        Long userId = ((AuthenticationPrincipalDetails) principal).getId();

        subscriptionService.deactivateSimulatedPro(userId);

        return ResponseEntity.ok("Suscripción simulada desactivada. Has vuelto a la cuenta gratuita.");
    }

    //Opcional: Endpoint para que el frontend obtenga el estado actual de la suscripción.

    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(@AuthenticationPrincipal Object principal) {

        Long userId = ((AuthenticationPrincipalDetails) principal).getId();
        boolean isPremium = subscriptionService.isUserPremium(userId);

        return ResponseEntity.ok(isPremium ?
                "{\"status\": \"PRO\", \"message\": \"El límite de 5 tableros está deshabilitado.\"}" :
                "{\"status\": \"FREE\", \"message\": \"Límite de 5 tableros activo.\"}"
        );
    }

}