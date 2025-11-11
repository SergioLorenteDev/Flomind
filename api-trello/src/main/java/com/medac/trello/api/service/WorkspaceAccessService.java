package com.medac.trello.api.service;

import com.medac.trello.api.model.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("workspaceAccessService") // ⬅️ Nombre de Bean para la seguridad
public class WorkspaceAccessService {

    private final WorkspaceRepository workspaceRepository;

    @Autowired
    public WorkspaceAccessService(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }


    public boolean isOwnerOrMember(Long workspaceId, Long userId) {
        return workspaceRepository.findById(workspaceId)
                .map(workspace -> workspace.isOwner(userId) || workspace.isMember(userId))
                .orElse(false);
    }


    public boolean isOwner(Long workspaceId, Long userId) {
        return workspaceRepository.findById(workspaceId)
                .map(workspace -> workspace.isOwner(userId))
                .orElse(false);
    }
}