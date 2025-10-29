package com.medac.trello.api.resources;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.RefreshTokenRepository;
import com.medac.trello.api.model.repository.UserRepository;
import com.medac.trello.api.request.*;
import com.medac.trello.api.service.JwtManager;
import com.medac.trello.api.service.RefreshTokenService;
import com.medac.trello.api.view.AuthenticatedUserView;
import com.medac.trello.api.view.GoogleAuthConfig;
import com.medac.trello.api.view.LogoutView;
import com.medac.trello.api.view.UserView;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.badRequest;
import static org.springframework.http.ResponseEntity.ok;


@RestController
@RequestMapping(value = "/auth", produces = APPLICATION_JSON_VALUE)
public class AuthResource implements TrelloApi {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtManager jwtManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public AuthResource(PasswordEncoder passwordEncoder,
                        UserRepository userRepository,
                        AuthenticationManager authenticationManager,
                        JwtManager jwtManager,
                        RefreshTokenRepository refreshTokenRepository,
                        RefreshTokenService refreshTokenService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtManager = jwtManager;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        final var authenticatedUser = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()));
        return userRepository.findOneByEmail(request.email())
                .map(user -> new AuthenticatedUserView(
                        jwtManager.generateToken(user),
                        refreshTokenService.createRefreshToken(user.getId()).getToken(),
                        new UserView(user.getId(), user.getUsername(), user.getEmail(), user.getName())))
                .map(ResponseEntity::ok)
                .orElse(badRequest().body(new AuthenticatedUserView(null, null, null)));
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutView> logout(@Valid @RequestBody LogoutRequest logoutRequest) {
        final var requestToken = logoutRequest.refreshToken();

        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    refreshTokenRepository.delete(token);
                    return ok(new LogoutView("Logged out successfully."));
                })
                .orElse(badRequest().body(new LogoutView("Invalid refresh token.")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return refreshTokenRepository.findByToken(refreshTokenRequest.refreshToken())
                .map(token -> {
                    if (refreshTokenService.isTokenExpired(token)) {
                        refreshTokenRepository.delete(token);
                        return badRequest().body("Refresh token expired. Please login again.");
                    }
                    String newJwtToken = jwtManager.generateToken(token.getOwner());
                    return ok(Map.of("token", newJwtToken));
                })
                .orElse(badRequest().body("Invalid refresh token."));
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
