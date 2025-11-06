package com.medac.trello.api.service;

import com.medac.trello.api.exception.ResourceNotFoundException;
import com.medac.trello.api.model.Card;
import com.medac.trello.api.model.HistorialMovimiento;
import com.medac.trello.api.model.Lista;
import com.medac.trello.api.model.Label;
import com.medac.trello.api.model.repository.CardRepository;
import com.medac.trello.api.model.repository.HistorialMovimientoRepository;
import com.medac.trello.api.model.repository.LabelRepository;
import com.medac.trello.api.model.repository.ListaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ListaRepository listaRepository;

    @Autowired
    private HistorialMovimientoRepository historialMovimientoRepository;

    @Autowired
    private LabelRepository labelRepository;

    // ---------------------- C - CREAR TARJETA ----------------------

    @Transactional
    public Card guardarCard(Long listId, Card card, Long labelId) {
        // 1. Obtener la lista (columna)
        Lista lista = listaRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Lista no encontrada con id: " + listId));

        // 2. Asignar propiedades de creacion
        card.setLista(lista);
        if (card.getCreatedOn() == null) {
            card.setCreatedOn(Instant.now());
        }

        applyLabel(card, labelId, lista);

        // 3. Guardar
        return cardRepository.save(card);
    }

    // ---------------------- R - LEER TARJETAS ----------------------

    /* // Listar todas las tarjetas (principalmente para debug)
    public List<Card> findAllCards() {
        return cardRepository.findAll();
    }
     */

    public List<Card> obtenerCardsPorLista(Long listaId) {
        return cardRepository.findByLista_IdListaOrderByCardOrderAsc(listaId);
    }

    // Obtener por ID
    public Card obtenerCardPorId(Long idTarjeta) {
        return cardRepository.findById(idTarjeta)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta));
    }

    public List<Card> encontrarTarjetasPorTableroId(Long tableroId) {
        // Llama al metodo de consulta derivada que debe existir en CardRepository.
        return cardRepository.findByLista_Board_Id(tableroId);
    }

    // ---------------------- U - ACTUALIZAR/MOVER TARJETAS ----------------------

    @Transactional
    public Card actualizarCard(Long idTarjeta, Card cardDetails, Long labelId) {

        // 1. Obtener la tarjeta existente
        Card cardExistente = cardRepository.findById(idTarjeta)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta));
        Lista listaOriginal = cardExistente.getLista(); // Lista de origen
        Long listaOrigenId = listaOriginal != null ? listaOriginal.getIdLista() : null;

        // 2. Actualizar campos simples
        if (cardDetails.getTitle() != null) {
            cardExistente.setTitle(cardDetails.getTitle());
        }
        if (cardDetails.getDescription() != null) {
            cardExistente.setDescription(cardDetails.getDescription());
        }
        if (cardDetails.getExpiresOn() != null) {
            cardExistente.setExpiresOn(cardDetails.getExpiresOn());
        }

        // 3. Manejar movimiento (cambio de lista/columna)
        Long listaDestinoIdTmp = listaOrigenId;
        Lista nuevaListaStub = cardDetails.getLista();
        if (nuevaListaStub != null && nuevaListaStub.getIdLista() != null) {
            listaDestinoIdTmp = nuevaListaStub.getIdLista();
        }
        final Long listaDestinoId = listaDestinoIdTmp;
        if (listaDestinoId == null) {
            throw new ResourceNotFoundException("Lista destino no encontrada para la tarjeta con id: " + idTarjeta);
        }

        boolean cambioDeLista = !Objects.equals(listaOrigenId, listaDestinoId);
        Lista listaDestino = listaOriginal;

        if (cambioDeLista) {
            listaDestino = listaRepository.findById(listaDestinoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lista destino no encontrada con id: " + listaDestinoId));

            cardExistente.setLista(listaDestino);

            HistorialMovimiento registro = new HistorialMovimiento(
                    cardExistente,
                    listaOriginal,
                    listaDestino,
                    Instant.now()
            );

            historialMovimientoRepository.save(registro);
        }

        applyLabel(cardExistente, labelId, listaDestino);

        // Persistimos cambios simples antes de recalcular el orden
        cardRepository.save(cardExistente);

        if (cambioDeLista && listaOrigenId != null) {
            reindexarTarjetas(listaOrigenId);
        }

        Integer posicionObjetivo = cardDetails.getCardOrder();
        if (posicionObjetivo == null) {
            posicionObjetivo = cambioDeLista ? Integer.MAX_VALUE : cardExistente.getCardOrder();
        }

        reubicarTarjeta(listaDestino.getIdLista(), cardExistente.getId(), posicionObjetivo);

        return cardRepository.findById(cardExistente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + cardExistente.getId()));
    }

    // ---------------------- D - ELIMINAR TARJETA ----------------------

    public void eliminarTarjeta(Long idTarjeta) {
        if (!cardRepository.existsById(idTarjeta)) {
            throw new ResourceNotFoundException("Tarjeta no encontrada con id: " + idTarjeta);
        }
        cardRepository.deleteById(idTarjeta);
    }

    /**
     * Reindexa todas las tarjetas de una lista para que sus posiciones sean consecutivas.
     */
    private void reindexarTarjetas(Long listaId) {
        List<Card> tarjetas = cardRepository.findByLista_IdListaOrderByCardOrderAsc(listaId);
        for (int index = 0; index < tarjetas.size(); index++) {
            tarjetas.get(index).setCardOrder(index);
        }
        cardRepository.saveAll(tarjetas);
    }

    /**
     * Inserta la tarjeta en la posicion solicitada dentro de la lista destino y normaliza los indices.
     * Cuando la posicion es null o Integer.MAX_VALUE se inserta al final.
     */
    private void reubicarTarjeta(Long listaId, Long tarjetaId, Integer posicionDeseada) {
        List<Card> tarjetas = cardRepository.findByLista_IdListaOrderByCardOrderAsc(listaId);
        Card tarjetaEnMovimiento = null;

        for (Iterator<Card> iterator = tarjetas.iterator(); iterator.hasNext(); ) {
            Card tarjeta = iterator.next();
            if (tarjeta.getId().equals(tarjetaId)) {
                tarjetaEnMovimiento = tarjeta;
                iterator.remove();
                break;
            }
        }

        if (tarjetaEnMovimiento == null) {
            tarjetaEnMovimiento = cardRepository.findById(tarjetaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada con id: " + tarjetaId));
        }

        int indiceDestino = (posicionDeseada != null && posicionDeseada >= 0)
                ? Math.min(posicionDeseada, tarjetas.size())
                : tarjetas.size();

        tarjetas.add(indiceDestino, tarjetaEnMovimiento);

        for (int index = 0; index < tarjetas.size(); index++) {
            tarjetas.get(index).setCardOrder(index);
        }

        cardRepository.saveAll(tarjetas);
    }

    private void applyLabel(Card card, Long labelId, Lista lista) {
        card.setPrimaryLabel(null);
        if (labelId == null) {
            return;
        }

        Long boardId = resolveBoardId(lista);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Etiqueta no encontrada con id: " + labelId));

        if (boardId != null && !Objects.equals(label.getOwningBoardId(), boardId)) {
            throw new ResourceNotFoundException("La etiqueta no pertenece al tablero indicado.");
        }

        card.setPrimaryLabel(label);
    }

    private Long resolveBoardId(Lista lista) {
        if (lista == null) {
            return null;
        }
        if (lista.getBoard() != null) {
            return lista.getBoard().getId();
        }
        if (lista.getIdTablero() != null) {
            return lista.getIdTablero();
        }
        return null;
    }
}
