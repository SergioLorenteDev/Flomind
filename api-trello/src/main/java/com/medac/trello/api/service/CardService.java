package com.medac.trello.api.service;


import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.medac.trello.api.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class CardService {
    @Autowired
    private CardRepository cardRepository;

    //AÑADIR
    public Card saveCard(Card card) {
        return cardRepository.save(card);
    }

    //LISTAR
    public List<Card> findAllCards() {
        return cardRepository.findAll();
    }
    //OBTENER POR ID
    public Card obtenerCardPorId(Long idTarjeta) {
        // Usa findById y orElseThrow para devolver el objeto o lanzar la excepción 404
        return cardRepository.findById(idTarjeta)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta));
    }
    //EDITAR
    public Card actualizarCard(Long idTarjeta, Card cardDetails) {
        Optional<Card> CardOptional = cardRepository.findById(idTarjeta);
        if (CardOptional.isPresent()) {
            Card cardExistente = CardOptional.get();

            //ACTUALIZAR CAMPOS
            cardExistente.setTitle(cardDetails.getTitle());
            cardExistente.setDescription(cardDetails.getDescription());
            cardExistente.setExpiresOn(cardDetails.getExpiresOn());
            cardExistente.setOrder(cardDetails.getOrder());
            cardExistente.setOwningListId(cardDetails.getOwningListId());
            return cardRepository.save(cardExistente);

        }else {
            throw new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta);
        }
    }

// D - Eliminar
    public void eliminarTarjeta(Long idTarjeta) {
        if (!cardRepository.existsById(idTarjeta)) {
            // Lanza la excepción si no existe
            throw new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta);
        }
        cardRepository.deleteById(idTarjeta);
    }


}
