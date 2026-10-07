package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    private final JavaMailSender mailSender;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    private static final int PASSWORD_LENGTH = 12;

    // CONSTRUCTOR
    @Autowired
    public PasswordResetService(UserRepository userRepository, 
                                PasswordEncoder passwordEncoder,
                                JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }
    
    // Método para generar la contraseña
    private String generateRandomPassword() {
        return IntStream.range(0, PASSWORD_LENGTH)
                .map(i -> secureRandom.nextInt(CHARACTERS.length()))
                .mapToObj(CHARACTERS::charAt)
                .map(String::valueOf)
                .collect(Collectors.joining());
    }

    // LÓGICA PRINCIPAL
    public void resetPassword(String email) { 
        final var user = userRepository.findByEmail(email) // <-- CORRECCIÓN: Usar findByEmail
            // Usamos la excepción correcta del proyecto
            .orElseThrow(() -> new ResourceNotFoundException("Email no encontrado."));

        String newPassword = generateRandomPassword(); // <-- Llama al método local
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        sendNewPasswordEmail(user.getEmail(), newPassword); // <-- Envío del correo
    }

    // MÉTODO PARA ENVIAR EL CORREO
    private void sendNewPasswordEmail(String toEmail, String newPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // El remitente lo toma JavaMailSender de spring.mail.username (ver .env).
            message.setTo(toEmail);
            message.setSubject("Trello App: Reseteo de Contraseña Exitoso");
            message.setText("Hola,\n\n"
                    + "Tu contraseña ha sido reseteada exitosamente. Tu nueva contraseña es:\n\n"
                    + newPassword + "\n\n"
                    + "Por favor, inicia sesión con esta contraseña y cámbiala lo antes posible.\n\n"
                    + "Gracias,\n"
                    + "El equipo de Trello.");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error al enviar el correo a " + toEmail + ": " + e.getMessage());
            e.printStackTrace(); 
        }
    }
}