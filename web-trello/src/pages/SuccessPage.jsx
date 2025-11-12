import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => {
   
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl max-w-lg w-full mx-auto transform transition duration-500 border-t-8 border-green-500">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Pago Exitoso! 🎉</h2>
                
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Tu suscripción <strong className="text-gray-900 dark:text-white">Premium</strong> se está activando.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-8 text-center w-full">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        La activación final la realiza el Webhook en el backend (Spring Boot).
                    </p>
                </div>
                
                <Link
                    to="/tableros"
                    className="inline-block w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.01] text-center"
                >
                    Ir a Tableros Premium
                </Link>
            </div>
        </div>
    );
};

export default SuccessPage;
