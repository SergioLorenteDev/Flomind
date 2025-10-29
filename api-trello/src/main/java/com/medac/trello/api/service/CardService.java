package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.HistorialMovimiento;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.repository.CardRepository;
import com.medac.trello.api.model.repository.HistorialMovimientoRepository;
import com.medac.trello.api.model.repository.ListaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ListaRepository listaRepository;

    @Autowired
    private HistorialMovimientoRepository historialMovimientoRepository;

    // ---------------------- C - CREAR TARJETA ----------------------

    @Transactional
    public Card guardarCard(Long listId, Card card) {
        // 1. Obtener la Lista (columna)
        Lista lista = listaRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Lista no encontrada con id: " + listId));

        // 2. Asignar propiedades de creación
        card.setLista(lista);
        if (card.getCreatedOn() == null) {
            card.setCreatedOn(Instant.now());
        }

        // el order se gestiona en ell front.

        // 3. Guardar
        return cardRepository.save(card);
    }

    // ---------------------- R - LEER TARJETAS ----------------------

    /*// Listar todas las tarjetas (principalmente para debug)
    public List<Card> findAllCards() {
        return cardRepository.findAll();
    }

     */
    public List<Card> obtenerCardsPorLista(Long listaId) {
        // Llama al método de consulta derivada que debe existir en CardRepository:
        // List<Card> findByLista_IdListaOrderByCardOrderAsc(Long listaId);
        return (List<Card>) cardRepository.findByLista_IdLista(listaId);
    }
    // Obtener por ID
    public Card obtenerCardPorId(Long idTarjeta) {
        return cardRepository.findById(idTarjeta)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta));
    }


    public List<Card> encontrarTarjetasPorTableroId(Long tableroId) {
        // Llama al método de consulta derivada que debe existir en CardRepository:
        // List<Card> findByLista_Tablero_Id(Long boardId);
        return cardRepository.findByLista_Board_Id(tableroId);
    }



    // ---------------------- U - ACTUALIZAR/MOVER TARJETAS ----------------------

    @Transactional
    public Card actualizarCard(Long idTarjeta, Card cardDetails) {

        // 1. Obtener la tarjeta existente
        Card cardExistente = cardRepository.findById(idTarjeta)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta));
        Lista listaOriginal = cardExistente.getLista(); // Lista de ORIGEN

        // 2. ACTUALIZAR CAMPOS SIMPLES
        if (cardDetails.getTitle() != null) {
            cardExistente.setTitle(cardDetails.getTitle());
        }
        if (cardDetails.getDescription() != null) {
            cardExistente.setDescription(cardDetails.getDescription());
        }
        if (cardDetails.getExpiresOn() != null) {
            cardExistente.setExpiresOn(cardDetails.getExpiresOn());
        }

        // 'Order' se actualiza si no es nulo
        if (cardDetails.getCardOrder() != null) {
            cardExistente.setCardOrder(cardDetails.getCardOrder());
        }

        // 3. MANEJAR MOVIMIENTO (Cambio de Lista/Columna)
        Lista nuevaListaStub = cardDetails.getLista(); // ⬅️ Obtener el objeto Lista stub

        // Verificar si se ha enviado una nueva ID de Lista en el stub
        if (nuevaListaStub != null && nuevaListaStub.getIdLista() != null) {
            Long nuevoOwningListId = nuevaListaStub.getIdLista(); // ⬅️ Obtener el ID del stub

            // Verificar si la tarjeta se está moviendo a una lista diferente
            if (listaOriginal == null || !listaOriginal.getIdLista().equals(nuevoOwningListId)) {

                // 3.1. Buscar la entidad Lista completa para la nueva columna (DESTINO)
                Lista nuevaLista = listaRepository.findById(nuevoOwningListId)
                        .orElseThrow(() -> new ResourceNotFoundException("Lista destino no encontrada con id: " + nuevoOwningListId));

                // 3.2. Asignar el objeto Lista completo (esto actualiza la FK)
                cardExistente.setLista(nuevaLista);

                // 3.3. REGISTRAR EL MOVIMIENTO EN EL BACKEND (AL MOMENTO)
                HistorialMovimiento registro = new HistorialMovimiento(
                        cardExistente,
                        listaOriginal,
                        nuevaLista,
                        Instant.now()
                );

                historialMovimientoRepository.save(registro);
            }
        }

        // 4. Guardar y retornar la tarjeta actualizada
        return cardRepository.save(cardExistente);
    }

    // ---------------------- D - ELIMINAR TARJETA ----------------------

    public void eliminarTarjeta(Long idTarjeta) {
        if (!cardRepository.existsById(idTarjeta)) {
            throw new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta);
        }
        cardRepository.deleteById(idTarjeta);
    }
}