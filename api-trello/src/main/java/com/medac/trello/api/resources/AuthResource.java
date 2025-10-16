package com.medac.trello.api.resources;

import com.medac.trello.api.model.User;
import com.medac.trello.api.model.repository.UserRepository;
import com.medac.trello.api.request.CodeGrantRequest;
import com.medac.trello.api.request.LoginRequest;
import com.medac.trello.api.request.RegisterRequest;
import com.medac.trello.api.resources.exception.InvalidLoginCredentialsException;
import com.medac.trello.api.view.GoogleAuthConfig;
import com.medac.trello.api.view.UserView;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.ok;


@RestController
@RequestMapping(value = "/auth", produces = APPLICATION_JSON_VALUE)
public class UserResource implements TrelloApi {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public UserResource(UserRepository userRepository, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<UserView> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()));
        return ok(userRepository.findOneByEmail(request.email())
                .filter(user -> user.getPassword().equals(request.password().trim()))
                .map(user -> new UserView(user.getName()))
                .orElseThrow(InvalidLoginCredentialsException::new));
    }

    @PostMapping("/register")
    public ResponseEntity<UserView> register(@Valid @RequestBody RegisterRequest request) {
        final var newUser = new User(request.name(),request.userName(), request.email(), request.password());
        return ok(new UserView(userRepository.save(newUser).getName()));
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
