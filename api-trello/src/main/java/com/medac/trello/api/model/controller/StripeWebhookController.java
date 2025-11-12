package com.medac.trello.api.model.controller;

import com.medac.trello.api.model.User;
import com.medac.trello.api.service.SubscriptionService;
import com.medac.trello.api.service.UserService; // Necesario para buscar al User por Stripe ID
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.LineItem;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    private final SubscriptionService subscriptionService;
    private final UserService userService; // Servicio para buscar User

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public StripeWebhookController(SubscriptionService subscriptionService, UserService userService) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        Event event;

        //VERIFICACIÓN DE FIRMA (Seguridad crucial)
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            // Firma inválida. Retornar 400.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Firma del Webhook inválida.");
        } catch (Exception e) {
            // Error en la lectura del payload
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payload inválido.");
        }

        StripeObject dataObject = event.getDataObjectDeserializer().getObject().orElse(null);

        // PROCESAMIENTO DEL EVENTO
        if ("checkout.session.completed".equals(event.getType())) {

            Session session = (Session) dataObject;

            // Obtener IDs y Plan
            String customerId = session.getCustomer();
            String planId = session.getMetadata().get("planId"); // Asume que guardas el planId en metadata

            // Buscar usuario por Stripe ID
            User user = userService.findByStripeCustomerId(customerId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado para Stripe Customer ID: " + customerId));

            // Simulación de fecha de expiración
            LocalDate expirationDate = LocalDate.now().plusMonths(1);

            // ACTIVACIÓN REAL DE LA SUSCRIPCIÓN
            subscriptionService.activateSubscription(user, planId, expirationDate);
        }

        //  RETORNO DE CÓDIGO 200 (Importante: Indica a Stripe que el evento fue recibido correctamente)
        return ResponseEntity.ok("Evento Stripe procesado con éxito");
    }
}