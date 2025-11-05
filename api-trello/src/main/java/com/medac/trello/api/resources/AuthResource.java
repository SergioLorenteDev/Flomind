package com.medac.trello.api.resources;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.UserRepository;
import com.medac.trello.api.request.CodeGrantRequest;
import com.medac.trello.api.request.LoginRequest;
import com.medac.trello.api.request.RegisterRequest;
import com.medac.trello.api.resources.exception.InvalidLoginCredentialsException;
import com.medac.trello.api.service.JwtManager;
import com.medac.trello.api.view.AuthenticatedUserView;
import com.medac.trello.api.view.GoogleAuthConfig;
import com.medac.trello.api.view.UserView;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.ok;


@RestController
@RequestMapping(value = "/auth", produces = APPLICATION_JSON_VALUE)
public class AuthResource implements TrelloApi {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtManager jwtManager;

    @Autowired
    public AuthResource(PasswordEncoder passwordEncoder, UserRepository userRepository, AuthenticationManager authenticationManager, JwtManager jwtManager) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtManager = jwtManager;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticatedUserView> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()));

        return ResponseEntity.ok(userRepository.findByEmail(request.email())
                .map(user -> new AuthenticatedUserView(
                        jwtManager.generateToken(user),
                        "Bearer", // ⬅️ ¡ARGUMENTO FALTANTE AÑADIDO!
                        new UserView(user.getId(), user.getUsername(), user.getEmail(), user.getName())))
                .orElseThrow(InvalidLoginCredentialsException::new));
    }

    @PostMapping("/register")
    public ResponseEntity<UserView> register(@Valid @RequestBody RegisterRequest request) {
        final var newUser = new User(request.name(),request.userName(), request.email(), passwordEncoder.encode(request.password()));
        final var registeredUser = userRepository.save(newUser);
        return ok(new UserView(
                registeredUser.getId(),
                registeredUser.getUsername(),
                registeredUser.getEmail(),
                registeredUser.getName()));
    }

    @GetMapping("/google/config")
    public ResponseEntity<GoogleAuthConfig> googleAuthConfig() {
        return ok(new GoogleAuthConfig(
                "http://localhost:8080/trello/v1/auth/google/codegrant",
                "",
                Set.of("https://www.googleapis.com/auth/userinfo.email",
                        "https://www.googleapis.com/auth/userinfo.profile",
                        "openid")));
    }

    @PostMapping("/google/codegrant")
    public ResponseEntity<String> codeGrant(@Valid CodeGrantRequest request) {
        // TODO: Implementar cuando se consiga acceso a Google Cloud para poder crear
        // la cuenta y registrar la aplicacion
        return ok("");
    }
}
