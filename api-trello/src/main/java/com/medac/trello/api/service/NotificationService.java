package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Notification;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Comparator.comparing;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<Notification> findAllNotificationsForUser(User usuarioAutenticado) {
        return notificationRepository.findAllByDestinationUserId(usuarioAutenticado.getId()).stream()
                .sorted((comparing(Notification::getCreatedOn)))
                .toList();
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.findById(id).ifPresentOrElse(
                        notificationRepository::delete,
                        () -> {
                            throw new ResourceNotFoundException("No se encontro notificacion con id " + id);
                        });
    }
}