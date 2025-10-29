package com.medac.trello.api.resources;

import org.springframework.web.bind.annotation.CrossOrigin;

//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public interface TrelloApi {
    // Definimos la ruta base de la API
    String BASE_API_PATH = "/trello/v1";
}