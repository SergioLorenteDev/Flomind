import React, { useState } from 'react';
import { RefreshCcw, CheckCircle, XCircle, Zap } from 'lucide-react';
import SubscriptionButton from '../components/ui/SubscriptionButton';
import SuccessPage from './SuccessPage';
import CancelPage from './CancelPage';

const Subscription = () => {
    const [currentPage, setCurrentPage] = useState('subscription');
    const [userToken, setUserToken] = useState('fake-jwt-token-12345'); 
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = (page) => {
        setCurrentPage(page);
        setNotification(null);
    };

    const renderNotification = () => {
        if (!notification) return null;

        const isError = notification.type === 'error';
        const color = isError ? 'bg-red-500' : 'bg-blue-500';
        const icon = isError ? <XCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />;

        return (
            <div className={`fixed top-4 right-4 p-4 text-white rounded-lg shadow-xl flex items-center z-50 ${color}`}>
                {icon}
                <span>{notification.text}</span>
                <button onClick={() => setNotification(null)} className="ml-4 font-bold">×</button>
            </div>
        );
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'success':
                return <SuccessPage navigate={navigate} />;
            case 'cancel':
                return <CancelPage navigate={navigate} />;
            case 'boards':
                return (
                    <div className="text-center p-10">
                        <h2 className="text-3xl font-bold">¡Bienvenido a tus Tableros Premium!</h2>
                        <button onClick={() => navigate('subscription')} className="mt-4 text-blue-500 underline">Volver al Plan</button>
                    </div>
                );
            case 'subscription':
            default:
                return (
                    <div className="flex flex-col items-center space-y-8 w-full">
                        {/* Card de suscripción */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition hover:scale-[1.02]">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                                Plan Pro - Flomind
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                Accede a tableros ilimitados, funcionalidades premium y soporte prioritario.
                            </p>
                            <div className="flex justify-center">
                                <SubscriptionButton 
                                    userToken={userToken} 
                                    onMessage={setNotification}
                                    setLoading={setIsLoading}
                                />
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-500">
                                Pago seguro con Stripe. Cancelación en cualquier momento.
                            </div>
                        </div>

                        {/* Simulación de redirección */}
                        <p className="text-sm text-gray-500">Simulación de Redirección:</p>
                        <div className='flex space-x-4'>
                            <button 
                                onClick={() => navigate('success')} 
                                className="text-sm text-green-600 hover:text-green-800 underline"
                            >
                                [Éxito]
                            </button>
                            <button 
                                onClick={() => navigate('cancel')} 
                                className="text-sm text-red-600 hover:text-red-800 underline"
                            >
                                [Cancelación]
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans relative">
            {renderNotification()}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                Flomind 
                <span className="text-indigo-600 ml-2">Suscripciones</span>
            </h1>
            {isLoading && (
                 <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40">
                    <RefreshCcw className="w-10 h-10 text-white animate-spin" />
                    <span className="ml-4 text-white text-lg font-semibold">Cargando...</span>
                </div>
            )}
            <div className="w-full max-w-2xl">
                {renderPage()}
            </div>
        </div>
    );
};

export default Subscription;