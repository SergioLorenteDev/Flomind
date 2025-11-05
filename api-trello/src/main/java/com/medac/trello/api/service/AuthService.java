package com.medac.trello.api.service;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.UserRepository;
import com.medac.trello.api.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserService userService;

    // Inyección de dependencias a través del constructor (práctica recomendada)
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.userService = userService;
    }

    /**
     * Procesa la solicitud de registro, crea el usuario, genera el token y envía el correo.
     * @param request Datos del formulario de registro.
     * @throws IllegalStateException Si el email ya existe.
     */
    public void register(RegisterRequest request) {
        System.out.println("🟢 Entrando en AuthService.register()");
        // 1. Verificar si el usuario ya existe por email (¡Debe ir aquí!)
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalStateException("El correo electrónico ya está registrado.");
        }

        // 2. Mapear la petición a la Entidad User
        User newUser = new User(
                request.name(),
                request.userName(),
                request.email(),
                request.password()
        );

        // 3. Llamar al UserService para CIFRAR, GENERAR TOKEN y GUARDAR.
        User registeredUser = userService.registerUser(newUser);
        System.out.println("✅ Usuario guardado: " + registeredUser.getEmail());
        System.out.println("📨 Enviando correo de confirmación...");

        // 4. Envío del Correo de Confirmación
        emailService.sendConfirmationEmail(registeredUser.getEmail(), registeredUser.getConfirmationToken());
        System.out.println("📤 Correo enviado (o intento de envío ejecutado)");
    }


    public String confirmToken(String token) {
        // 1. Buscar al usuario por el token
        User user = userRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalStateException("Token de confirmación inválido o no encontrado."));

        // 2. Verificar si la cuenta ya ha sido verificada
        if (user.isVerified()) {
            return "Tu cuenta ya ha sido verificada. Puedes iniciar sesión.";
        }

        // 3. Activar la cuenta
        user.setVerified(true);
        user.setConfirmationToken(null); // Limpiar el token para evitar reuso
        userRepository.save(user);

        return "¡Cuenta verificada con éxito! Ya puedes iniciar sesión.";
    }
}