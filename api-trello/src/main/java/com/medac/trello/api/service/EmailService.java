package com.medac.trello.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @PostConstruct
    public void init() {
        System.out.println("📬 EmailService cargado correctamente");
    }

    @Autowired
    private JavaMailSender mailSender; // Inyecta el componente de envío de Spring


    public void sendConfirmationEmail(String toEmail, String token) {
        System.out.println("📬 Entrando a EmailService.sendConfirmationEmail()");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Confirma tu Cuenta en Trello App");

            String confirmationUrl = "http://localhost:8080/api/auth/confirm?token=" + token;
            String emailContent = String.format(
                    "¡Hola! Gracias por registrarte.\n\nPor favor, haz clic en el siguiente enlace:\n%s",
                    confirmationUrl
            );

            message.setText(emailContent);

            System.out.println("📨 Enviando correo a " + toEmail);
            mailSender.send(message);
            System.out.println("✅ Correo enviado correctamente");

        } catch (Exception e) {
            System.out.println("❌ Error enviando correo: " + e.getMessage());
            e.printStackTrace();
        }
    }
}