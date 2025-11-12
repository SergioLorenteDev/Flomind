package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //PARA BUSCAR AL USUARIO POR EMAIL DURANTE EL LOGIN
    Optional<User> findByEmail(String email);

    // CONFIRMACION DE LA CUENTA
    Optional<User> findByConfirmationToken(String confirmationToken);

    //ACTUALIZACION DEL NOMBRE DE USUARIO
    Optional<User> findByUsername(String username);

    //stripe
    Optional<User> findByStripeCustomerId(String stripeCustomerId);
}

