import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const CancelPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="p-10 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl max-w-xl w-full text-center border-t-8 border-red-500">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    ¡Transacción Cancelada! 😥
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    El proceso de pago fue cancelado o hubo un problema con tu tarjeta. No se ha realizado ningún cargo.
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-8">
                    <p className="font-semibold text-red-700 dark:text-red-300">
                        Si crees que esto es un error, por favor inténtalo de nuevo o contacta con soporte.
                    </p>
                </div>
                
                <Link
                    to="/ajustes" //redireccióbn a ajustes
                    className="inline-block w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-[1.01]"
                >
                    Volver a Intentar el Pago
                </Link>
            </div>
        </div>
    );
};

export default CancelPage;
