package com.medac.trello.api.model.controller;


import com.medac.trello.api.model.Card;
import com.medac.trello.api.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarjetas")
public class CardController {
    @Autowired
    private CardService cardService;

    //AÑADIR
    @PostMapping
    public ResponseEntity<Card>crearTarjeta(@RequestBody Card card){
        Card newCard = cardService.saveCard(card);
        return new ResponseEntity<>(newCard, HttpStatus.CREATED);
    }

    //LISTAR GET /api/tarjetas
    @GetMapping
    public List<Card> ListarTodasLasTarjetas(){
        return cardService.findAllCards();
    }

    //EDITAR PUT /api/tarjetas/{idTarjeta}
    @PutMapping("/{idTarjeta}")
    public ResponseEntity<Card> actualizarTarjeta(@PathVariable Long idTarjeta, @RequestBody Card cardDetails){
        try{
            Card cardActualizada  = cardService.actualizarCard(idTarjeta, cardDetails);
            return ResponseEntity.ok(cardActualizada);
        } catch(RuntimeException e){
            //manejar el error de tarjeta no encontrada
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //BORRAR - DELETE /api/tarjetas/{idTarjeta} BORRADO AL INCLUIR GlobalExceptionHandler Y ResourceNotFoundException
    /*@DeleteMapping("/{idTarjeta}")
    public ResponseEntity<HttpStatus> eliminarTarjeta(@PathVariable Long idTarjeta){
        try{
            cardService.deleteCard(idTarjeta);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch(RuntimeException e){
            // Capturamos el error si el servicio lanzó "Tarjeta no encontrada"
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

     */
// BORRAR - DELETE /api/tarjetas/{idTarjeta}
    @DeleteMapping("/{idTarjeta}")
    public ResponseEntity<HttpStatus> eliminarTarjeta(@PathVariable Long idTarjeta){
        cardService.eliminarTarjeta(idTarjeta);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204
    }


}