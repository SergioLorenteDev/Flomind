package com.medac.trello.api.model.controller;

import com.medac.trello.api.request.LoginRequest;
import com.medac.trello.api.request.RegisterRequest;
import com.medac.trello.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint para registrar un nuevo usuario y enviar el correo de confirmación.
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return new ResponseEntity<>("Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.", HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Maneja el caso en que el correo ya está en uso
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            // Maneja otros errores (ej. error de base de datos o de correo)
            return new ResponseEntity<>("Error al procesar el registro.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint al que el usuario hace clic en el enlace de correo para confirmar la cuenta.
     * La URL será algo como: http://localhost:8080/api/auth/confirm?token=ABC-123-XYZ
     */
    @GetMapping("/confirm")
    public ResponseEntity<String> confirmAccount(@RequestParam("token") String token) {
        try {
            String result = authService.confirmToken(token);
            // El servicio retorna un mensaje de éxito
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IllegalStateException e) {
            // Maneja errores como token no encontrado o token ya expirado
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint para iniciar sesión y obtener el token JWT.
     * @param request Datos de login (email/username y password).
     */
    /*@PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Llama al servicio para autenticar y generar el token JWT
            String jwtToken = authService.login(request);

            // Devuelve el token en un formato JSON fácil de consumir
            return ResponseEntity.ok(Map.of("token", jwtToken));

        } catch (DisabledException e) {
            // Este error ocurre si isVerified == false
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User is disabled. Please verify your account."));
        } catch (BadCredentialsException e) {
            // Este error ocurre si la contraseña o el nombre de usuario son incorrectos
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Credenciales invalidas."));
        } catch (Exception e) {
            // Maneja otros errores
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor durante el login."));
        }
    }
} // ⬅️ La llave de cierre de la clase

     */

}

