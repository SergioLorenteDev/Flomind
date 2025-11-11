package com.medac.trello.api.model.repository.projection;

public interface BoardMemberProjection {
    Long getUserId();

    String getName();

    String getEmail();

    String getRole();

    Integer getOwnerFlag();
}
