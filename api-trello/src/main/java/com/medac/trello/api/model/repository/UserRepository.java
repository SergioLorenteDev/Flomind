package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Método que usará Spring Security para buscar al usuario por email durante el LOGIN
    Optional<User> findByEmail(String email);

    // 🔑 MÉTODO CLAVE PARA LA CONFIRMACIÓN DE CUENTA
    // Spring Data JPA genera automáticamente la consulta SQL:
    // SELECT * FROM usuario WHERE confirmation_token = ?
    Optional<User> findByConfirmationToken(String confirmationToken);

    // ✅ MÉTODO AÑADIDO PARA LA LÓGICA DE ACTUALIZACIÓN DEL NOMBRE DE USUARIO
    // Spring Data JPA lo interpreta como: SELECT * FROM user WHERE username = ?
    Optional<User> findByUsername(String username);
}
