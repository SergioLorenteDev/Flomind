package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.UserUpdateRequestDTO;
import com.medac.trello.api.dto.UserResponseDTO;
import com.medac.trello.api.model.User;
import com.medac.trello.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // ⬅️ IMPORTANTE
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(value = "/usuarios", produces = APPLICATION_JSON_VALUE)
public class UserController {

    @Autowired
    private UserService userService;


    @PatchMapping("/username") // ⬅️ Ya no necesita el {userId} en la URL
    public ResponseEntity<UserResponseDTO> editarNombreDeUsuario(
            @RequestBody UserUpdateRequestDTO userDto,
            @AuthenticationPrincipal User authenticatedUser // ⬅️ Usamos el usuario autenticado
    ) {
        // 1. Validar que se recibió un nombre
        if (userDto.getUsername() == null || userDto.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 2. Obtener el ID del usuario autenticado
        Long userId = authenticatedUser.getId(); // ⬅️ ID tomado del token, no de la URL

        // 3. Llamar al servicio para actualizar
        User userActualizado = userService.updateUsername(userId, userDto.getUsername());

        // 4. Mapeo a DTO de Respuesta
        UserResponseDTO responseDto = new UserResponseDTO(userActualizado);

        return ResponseEntity.ok(responseDto);
    }
}