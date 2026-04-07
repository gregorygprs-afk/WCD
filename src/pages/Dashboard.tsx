import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Calendar as CalendarIcon, Activity as ActivityIcon, Download } from 'lucide-react';
import { seedDatabase } from '../lib/seedData';

export default function Dashboard() {
  const [stats, setStats] = useState({ volunteers: 0, activities: 0, days: 0 });
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    const unsubVols = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(s => ({ ...s, volunteers: snap.size }));
    });
    const unsubActs = onSnapshot(collection(db, 'activities'), (snap) => {
      setStats(s => ({ ...s, activities: snap.size }));
    });
    const unsubDays = onSnapshot(collection(db, 'eventDays'), (snap) => {
      setStats(s => ({ ...s, days: snap.size }));
    });

    return () => { unsubVols(); unsubActs(); unsubDays(); };
  }, []);

  const handleBootstrap = async () => {
    setIsBootstrapping(true);
    try {
      const seeded = await seedDatabase();
      if (seeded) {
        alert('Dados iniciais (Dias, Atividades e Voluntários) carregados com sucesso a partir do PDF!');
      } else {
        alert('Os dados do evento já estão configurados no banco de dados.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dados iniciais.');
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          WCD 2026 Itajaí
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <CalendarIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dias de Evento</p>
            <p className="text-2xl font-bold text-gray-900">{stats.days}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <ActivityIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Atividades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activities}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Voluntários</p>
            <p className="text-2xl font-bold text-gray-900">{stats.volunteers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bem-vindo ao Organizador WCD</h2>
            <p className="text-gray-600">
              Esta ferramenta foi desenvolvida para facilitar a organização do World Creativity Day 2026 em Itajaí.
              Utilize o menu lateral para gerenciar atividades, voluntários e gerar a Ordem do Dia.
              A inteligência artificial integrada ajudará a otimizar a distribuição de tarefas e horários.
            </p>
          </div>
          {stats.days === 0 && (
            <button
              onClick={handleBootstrap}
              disabled={isBootstrapping}
              className="ml-4 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg flex items-center hover:bg-orange-100 whitespace-nowrap"
            >
              <Download className="h-5 w-5 mr-2" />
              {isBootstrapping ? 'Carregando...' : 'Carregar Dias do Evento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
