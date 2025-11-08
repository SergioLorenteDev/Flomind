package com.medac.trello.api.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;

import static jakarta.persistence.FetchType.LAZY;
import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "usuario")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "nombre")
    private String name;
    @Column(name = "nombre_usuario")
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false; // Por defecto es FALSE, no verificado
    @Column(name = "fecha_creacion")
    private Instant createdOn = Instant.now(); // Asignar al crear
    @Column(name = "confirmation_token")
    private String confirmationToken;

    @OneToMany(mappedBy = "createdBy", fetch = LAZY) // FetchType.LAZY es recomendable
    private Set<Board> createdBoards;

    @ManyToMany(fetch = LAZY) // FetchType.LAZY es recomendable
    @JoinTable(
            name = "miembro_tablero", //TABLA INTERMEDIAA
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_tablero"))
    private Set<Board> invitedToBoards;

    protected User() {}

    public User(String name, String username, String email, String password) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;

        // ⬅️ ASIGNACIÓN DEL TOKEN AQUÍ
        this.confirmationToken = UUID.randomUUID().toString();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isVerified() { // Getter para el campo boolean
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public String getConfirmationToken() {
        return confirmationToken;
    }

    public void setConfirmationToken(String confirmationToken) {
        this.confirmationToken = confirmationToken;
    }

    @Override
    public String getUsername() {
        // Usa el email como identificador principal para Spring Security
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }

    public Instant getCreatedOn() {return createdOn;}

    public void setCreatedOn(Instant createdOn) {this.createdOn = createdOn;}

    public void setUsername(String username) {this.username = username;}

    public void setPassword(String password) {this.password = password;}

    public Set<Board> getCreatedBoards() {
        return createdBoards;
    }

    public Set<Board> getInvitedToBoards() {
        return invitedToBoards;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isEnabled() {return this.isVerified;}

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
