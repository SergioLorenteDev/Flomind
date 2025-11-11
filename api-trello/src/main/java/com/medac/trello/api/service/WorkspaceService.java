package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Invitation;
import com.medac.trello.api.model.User;
import com.medac.trello.api.model.Workspace;
import com.medac.trello.api.model.repository.InvitationRepository;
import com.medac.trello.api.model.repository.UserRepository;
import com.medac.trello.api.model.repository.WorkspaceRepository;
import com.medac.trello.api.dto.WorkspaceRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final InvitationRepository invitationRepository;
    @Value("${app.base-url}") String baseUrl;

    @Autowired
    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository,  EmailService emailService, InvitationRepository invitationRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.invitationRepository = invitationRepository;
        this.baseUrl = baseUrl;
    }

    public boolean isOwnerOrMember(Long workspaceId, Long userId) {
        // Lógica de acceso:
        return workspaceRepository.findById(workspaceId)
                .map(ws ->
                        ws.getOwner().equals(userId) ||
                                ws.getMembers().stream().anyMatch(member -> member.getId().equals(userId))
                )
                .orElse(false);
    }

    // -------------------------------------------------------------

    @Transactional
    public Workspace createWorkspace(WorkspaceRequestDTO request, Long ownerId) {

        // 1. Cargar el objeto User que será el dueño
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para ser dueño."));

        // 2. Crear la entidad Workspace
        // El constructor se encarga de añadir al Dueño a la colección de Miembros
        Workspace newWorkspace = new Workspace(
                request.getName(),
                request.getType(),
                owner
        );

        // 3. Guardar en la base de datos
        return workspaceRepository.save(newWorkspace);
    }


    public List<Workspace> getWorkspacesForUser(Long userId) {
        return workspaceRepository.findByOwnerIdOrMembersId(userId, userId);
    }


    public Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Espacio de trabajo no encontrado con ID: " + workspaceId));
    }


    @Transactional
    public void createAndSendWorkspaceInvitation(Long workspaceId, String inviteeEmail, Long inviterId) {

        // 1. Cargar el Workspace y verificar el Dueño/Miembro
        Workspace workspace = getWorkspaceById(workspaceId);

        // 2. 🛡️ Verificar si el invitado ya es miembro (Opcional, para evitar spam)
        User potentialMember = userRepository.findByEmail(inviteeEmail).orElse(null);
        if (potentialMember != null && (workspace.isOwner(potentialMember.getId()) || workspace.isMember(potentialMember.getId()))) {
            throw new IllegalArgumentException("El usuario ya es miembro o dueño de este espacio de trabajo.");
        }

        // 3. Generar Token Único
        String token = java.util.UUID.randomUUID().toString();

        // 4. Construir y Guardar la entidad Invitation
        Invitation newInvitation = new Invitation();
        newInvitation.setToken(token);
        newInvitation.setInviteeEmail(inviteeEmail);
        newInvitation.setExpiresAt(java.time.LocalDateTime.now().plusDays(7));
        newInvitation.setInviterId(inviterId);
        newInvitation.setWorkspace(workspace);
        newInvitation.setBoard(null);

        invitationRepository.save(newInvitation); // ⬅️ Ya inyectado y usado

        // 5. Enviar Email
        String acceptanceLink = baseUrl + "/accept-workspace-invite?token=" + token;

        String subject = String.format("Has sido invitado al Espacio de Trabajo '%s'", workspace.getName());
        String emailBody = String.format(
                "Hola,\n\n" +
                        "Has sido invitado al espacio de trabajo '%s'. Haz clic en el siguiente enlace para unirte:\n\n" +
                        "%s\n\n" +
                        "Gracias.",
                workspace.getName(), acceptanceLink
        );
        emailService.sendEmail(inviteeEmail, subject, emailBody); // ⬅️ Ya inyectado y usado
    }



    @Transactional
    public void acceptWorkspaceInvitation(String token, String acceptingUserEmail) {

        // 1. Buscar la invitación por token
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de invitación no válido o ya procesado."));

        // 2. Validaciones básicas
        if (!invitation.getInviteeEmail().equalsIgnoreCase(acceptingUserEmail)) {
            throw new IllegalArgumentException("El email no coincide con el invitado original.");
        }
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            invitationRepository.delete(invitation);
            throw new IllegalArgumentException("La invitación ha expirado.");
        }

        // 3. Cargar el usuario y el Workspace
        User acceptingUser = userRepository.findByEmail(acceptingUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado. Debe registrarse primero."));

        Workspace workspace = invitation.getWorkspace();

        if (workspace == null) {
            throw new IllegalStateException("Invitación de Workspace mal configurada.");
        }

        // 4. AÑADIR EL USUARIO AL WORKSPACE
        if (!workspace.isMember(acceptingUser.getId())) {
            workspace.getMembers().add(acceptingUser);
            workspaceRepository.save(workspace); // Persiste la adición a la tabla workspace_member
        
        }

        // 5. Limpieza
        invitationRepository.delete(invitation);
    }


    @Transactional
    public void removeMember(Long workspaceId, Long userIdToRemove, Long invokerId) {

        Workspace workspace = getWorkspaceById(workspaceId);

        // 1. 🛡️ Verificar que el solicitante es el Dueño
        if (!workspace.isOwner(invokerId)) {
            throw new AccessDeniedException("Solo el dueño del espacio de trabajo puede remover miembros.");
        }

        // 2. 🛡️ Impedir que el dueño se remueva a sí mismo (a menos que haya transferencia de propiedad)
        if (workspace.isOwner(userIdToRemove)) {
            throw new IllegalArgumentException("No puedes remover al dueño del espacio de trabajo sin transferir la propiedad primero.");
        }

        // 3. Cargar el usuario a remover (para evitar errores si el ID no existe)
        User userToRemove = userRepository.findById(userIdToRemove)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario a remover no encontrado."));

        // 4. Remover de la colección de miembros
        if (!workspace.getMembers().remove(userToRemove)) {
            // Si remove devuelve false, el usuario no era miembro
            throw new ResourceNotFoundException("El usuario con ID " + userIdToRemove + " no es miembro de este espacio de trabajo.");
        }

        // 5. Guardar la actualización (se persistirá la eliminación de la fila en workspace_member)
        workspaceRepository.save(workspace);
    }

    public java.util.Set<User> getMembers(Long workspaceId) {
        Workspace workspace = getWorkspaceById(workspaceId);
        return workspace.getMembers();
    }


    @Transactional
    public Workspace updateWorkspace(Long workspaceId, WorkspaceRequestDTO request) {

        // 1. Obtener el Workspace existente (lanza ResourceNotFoundException si no existe)
        Workspace workspace = getWorkspaceById(workspaceId);

        // 2. Aplicar los cambios
        if (request.getName() != null && !request.getName().isBlank()) {
            workspace.setName(request.getName());
        }

        if (request.getType() != null && !request.getType().isBlank()) {
            workspace.setType(request.getType());
        }

        // 3. Guardar y devolver
        return workspaceRepository.save(workspace);
    }

    @Transactional
    public void deleteWorkspace(Long workspaceId) {

        // 1. Obtener el Workspace existente. Si no existe, ResourceNotFoundException se lanza aquí.
        Workspace workspace = getWorkspaceById(workspaceId);

        // 2. Eliminar el Workspace.
        workspaceRepository.delete(workspace);
    }
}