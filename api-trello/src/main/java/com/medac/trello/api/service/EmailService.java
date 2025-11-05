package com.medac.trello.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
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

    public void sendBoardInvitation(String toEmail, String boardName, String acceptanceLink) {
        System.out.println("📬 Entrando a EmailService.sendBoardInvitation()");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("¡Has sido invitado al tablero de Trello: " + boardName + "!");

            String emailContent = String.format(
                    "¡Hola! Te han invitado a colaborar en el tablero '%s'.\n\n" +
                            "Haz clic en el enlace para aceptar la invitación y unirte:\n%s",
                    boardName, acceptanceLink
            );

            message.setText(emailContent);

            System.out.println("📨 Enviando invitación a " + toEmail);
            mailSender.send(message);
            System.out.println("✅ Correo de invitación enviado correctamente");

        } catch (MailException e) {
            System.err.println("❌ ERROR AL ENVIAR CORREO DE INVITACIÓN:");
            e.printStackTrace();
        }
    }
}