import React from 'react';
import { signInWithGoogle } from '../firebase';
import { Sparkles } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          World Creativity Day 2026
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Itajaí - O Ano da Criatividade no Brasil
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div>
              <button
                onClick={signInWithGoogle}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
                Entrar com Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
