package com.medac.trello.api.model.controller;

import com.medac.trello.api.dto.CardRequestDTO;
import com.medac.trello.api.dto.CardResponseDTO;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.service.BoardAccessService;
import com.medac.trello.api.service.CardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
//@RequestMapping("/trello/v1/tarjetas")
@RequestMapping(produces = APPLICATION_JSON_VALUE)
public class CardController {

    @Autowired
    private CardService cardService;
    private final BoardAccessService boardAccessService;

    public CardController(CardService cardService, BoardAccessService boardAccessService) {
        this.cardService = cardService;
        this.boardAccessService = boardAccessService;
    }

    // --------------------------------CREAR TARJETA -----------------
    // POST /trello/v1/listas/{listId}/tarjetas
    @PostMapping("/listas/{listId}/tarjetas")
    @PreAuthorize("@boardAccessService.canAccessList(#listId, authentication.principal.id)")
    public ResponseEntity<CardResponseDTO> crearTarjeta(
            @PathVariable Long listId,
           @Valid @RequestBody CardRequestDTO cardDto
    ) {
        // 1. Mapeo DTO
        Card cardParaGuardar = new Card();
        cardParaGuardar.setTitle(cardDto.getTitle());
        cardParaGuardar.setDescription(cardDto.getDescription());
        cardParaGuardar.setCardOrder(cardDto.getCardOrder());

        // 2. Llamada al servicio con la entidad y el ID de la lista padre
        Card cardGuardada = cardService.guardarCard(listId, cardParaGuardar, cardDto.getLabelId());

        // 3. Mapeo Entidad -> DTO de Respuesta
        CardResponseDTO responseDto = new CardResponseDTO(cardGuardada);

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED); // 201
    }


    // ---------------------- R - LEER TODAS LAS TARJETAS DE UNA LISTA ----------------------
    // URI: /listas/{listId}/tarjetas
    @GetMapping("/listas/{listId}/tarjetas")
    @PreAuthorize("@boardAccessService.canAccessList(#listId, authentication.principal.id)")
    public List<CardResponseDTO> listarTarjetasPorLista(@PathVariable Long listId) {

        // 1. Llamada al servicio, que devuelve Entidades JPA
        List<Card> cards = cardService.obtenerCardsPorLista(listId);

        // 2. Mapeo de la colección de Entidades a colección de DTO de Respuesta
        return cards.stream()
                .map(CardResponseDTO::new) // Usando el constructor de mapeo
                .collect(Collectors.toList());
    }


    // ---------------------- R - LEER UNA TARJETA ----------------------
    // URI: /tarjetas/{cardId}
    @GetMapping("/tarjetas/{cardId}")
    @PreAuthorize("@boardAccessService.canAccessCard(#cardId, authentication.principal.id)")
    public ResponseEntity<CardResponseDTO> obtenerTarjetaPorId(@PathVariable Long cardId) {
        Card card = cardService.obtenerCardPorId(cardId);

        CardResponseDTO responseDto = new CardResponseDTO(card);
        return ResponseEntity.ok(responseDto); // 200
    }


// ---------------------- U - ACTUALIZAR TARJETA (Incluye movimiento entre listas) ----------------------
   // URI: /tarjetas/{cardId}
   @PutMapping("/tarjetas/{cardId}")
   @PreAuthorize("@boardAccessService.canAccessCard(#cardId, authentication.principal.id)")

   public ResponseEntity<CardResponseDTO> actualizarTarjeta(
           @PathVariable Long cardId,
           @Valid @RequestBody CardRequestDTO cardDto
   ) {
       // 1. Mapeo DTO
       Card cardParaActualizar = new Card();
       cardParaActualizar.setTitle(cardDto.getTitle());
       cardParaActualizar.setDescription(cardDto.getDescription());
       cardParaActualizar.setCardOrder(cardDto.getCardOrder());

       // Lógica de MOVIMIENTO:
       if (cardDto.getIdLista() != null) {
           Lista listaStub = new Lista();
           // Asume que la entidad Lista tiene public void setIdLista(Long idLista)
           listaStub.setIdLista(cardDto.getIdLista());
           cardParaActualizar.setLista(listaStub);
       }

       // 2. Llamada al servicio
       Card cardActualizada = cardService.actualizarCard(cardId, cardParaActualizar, cardDto.getLabelId());

       // 3. Mapeo Entidad -> DTO de Respuesta
       CardResponseDTO responseDto = new CardResponseDTO(cardActualizada);

       return ResponseEntity.ok(responseDto); // 200
   }


    // ---------------------- D - ELIMINAR ----------------------
    // URI: /tarjetas/{cardId}
    @DeleteMapping("/tarjetas/{cardId}")
    @PreAuthorize("@boardAccessService.canAccessCard(#cardId, authentication.principal.id)")
    public ResponseEntity<HttpStatus> eliminarTarjeta(@PathVariable Long cardId) {
        cardService.eliminarTarjeta(cardId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
    }
}



