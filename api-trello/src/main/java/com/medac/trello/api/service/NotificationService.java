package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.notification.Notification;
import com.medac.trello.api.model.notification.NotificationDetails;
import com.medac.trello.api.model.repository.NotificationRepository;
import com.medac.trello.api.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Comparator.comparing;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Set<Notification> addNotifications(Long fromUser, Long toUser, Collection<NotificationDetails> notificationDetails) {
        return notificationDetails.stream()
                .map(details -> addNotification(fromUser, toUser, details))
                .collect(Collectors.toSet());
    }

    @Transactional
    public Notification addNotification(Long fromUser, Long toUser, NotificationDetails notificationDetails) {
        return userRepository.findById(fromUser)
                .map(from ->
                        userRepository.findById(toUser)
                                .flatMap(to -> {
                                    final var newNotification = new Notification();
                                    newNotification.setSourceUserId(from.getId());
                                    newNotification.setDestinationUserId(to.getId());
                                    newNotification.setDescription(notificationDetails.buildDescription());
                                    return Optional.of(notificationRepository.save(newNotification));
                                })
                                .orElseThrow(() -> new IllegalArgumentException("No existe usuario destino con id " + toUser)))
                .orElseThrow(() -> new IllegalArgumentException("No existe usuario origen con id " + fromUser));
    }

    @Transactional(readOnly = true)
    public List<Notification> findAllNotificationsForUser(User usuarioAutenticado) {
        return notificationRepository.findAllByDestinationUserId(usuarioAutenticado.getId()).stream()
                .sorted((comparing(Notification::getCreatedOn)))
                .toList();
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.findById(id)
                .ifPresentOrElse(
                        notificationRepository::delete,
                        () -> { throw new ResourceNotFoundException("No se encontro notificacion con id " + id); });
    }
}