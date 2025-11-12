package com.medac.trello.api.service;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.UserRepository; // Necesario para guardar el Stripe ID
import com.stripe.Stripe;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.stripe.model.Subscription;

import java.util.Optional;

@Service
public class StripeService {

    @Value("${stripe.api.secretKey}")
    private String secretKey;

    @Value("${app.domain.success-url}")
    private String successUrl;

    @Value("${app.domain.cancel-url}")
    private String cancelUrl;

    private final UserRepository userRepository;

    public StripeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Inicializa la clave de Stripe al iniciar el servicio
    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    //Obtiene el ID de Cliente de Stripe. Si no existe en la BD, lo crea en Stripe y lo guarda.

    private String getOrCreateStripeCustomerId(User user) throws Exception {
        // 1. Si el usuario ya tiene un Stripe ID, lo retornamos
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        // 2. Si no lo tiene, creamos uno nuevo en Stripe
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getName())
                .putMetadata("userId", user.getId().toString())
                .build();

        Customer customer = Customer.create(params);

        // 3. Guardamos el nuevo ID en la base de datos del usuario
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);

        return customer.getId();
    }

    public String createSubscriptionCheckoutSession(User user, String priceId) throws Exception {

        String stripeCustomerId = getOrCreateStripeCustomerId(user);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(stripeCustomerId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build())
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                // Usamos metadata para enviar el ID del plan de vuelta al webhook
                .putMetadata("user_id", user.getId().toString())
                .putMetadata("plan_id", priceId)
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public Optional<User> findUserByStripeCustomerId(String stripeCustomerId) {
        return userRepository.findByStripeCustomerId(stripeCustomerId);
    }

    public Subscription retrieveSubscription(String subscriptionId) throws Exception {
        return Subscription.retrieve(subscriptionId);
    }
}
