import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const STRIPE_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxx'; 
const PRICE_ID = 'price_1NXXXXXXXXXXXXXX'; // ID del plan de Stripe

// Función para cargar dinámicamente el script de Stripe
const loadStripe = (onLoad) => {
    if (window.Stripe) {
        onLoad();
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = onLoad;
    document.head.appendChild(script);
};

const SubscriptionButton = ({ userToken, onMessage, setLoading }) => {
    const [stripe, setStripe] = useState(null);
    const [isStripeReady, setIsStripeReady] = useState(false);

    // Cargar Stripe al montar el componente
    useEffect(() => {
        loadStripe(() => {
            const stripeInstance = window.Stripe(STRIPE_PUBLIC_KEY);
            setStripe(stripeInstance);
            setIsStripeReady(true);
        });
    }, []);

    const redirectToCheckout = async () => {
        if (!isStripeReady || !stripe) {
            onMessage({ type: 'error', text: 'Stripe no está listo. Inténtalo de nuevo.' });
            return;
        }

        if (!userToken) {
            onMessage({ type: 'error', text: 'Error de autenticación. Por favor, inicia sesión.' });
            return;
        }

        setLoading(true);

        try {
          
            const { error } = await stripe.redirectToCheckout({
                lineItems: [{ price: PRICE_ID, quantity: 1 }],
                mode: 'subscription',
                // URL a donde Stripe debe redirigir después del éxito
                successUrl: `${window.location.origin}/suscripcion/exito?session_id={CHECKOUT_SESSION_ID}`,
                // URL a donde Stripe debe redirigir después de la cancelación
                cancelUrl: `${window.location.origin}/suscripcion/fallo`,
                clientReferenceId: userToken, // ID para identificar al usuario en Stripe
            });

            if (error) {
                onMessage({ type: 'error', text: error.message || 'Error al redirigir a Stripe.' });
            }
        } catch (err) {
            onMessage({ type: 'error', text: 'Error inesperado al intentar el pago.' });
        } finally {
            // El setLoading(false) se maneja en las páginas de éxito/fallo o aquí solo en caso de error interno
            setLoading(false);
        }
    };

    return (
        <button
            onClick={redirectToCheckout}
            disabled={!isStripeReady}
            className={`w-full max-w-sm flex items-center justify-center space-x-2 px-6 py-3 font-bold text-lg text-white rounded-xl shadow-lg transition duration-300 transform 
                ${isStripeReady 
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95' 
                    : 'bg-indigo-400 cursor-not-allowed'
                }`}
        >
            <Zap className="w-5 h-5 fill-white" />
            <span>
                {isStripeReady ? 'Suscribirse al Plan Pro' : 'Cargando Stripe...'}
            </span>
        </button>
    );
};

export default SubscriptionButton;