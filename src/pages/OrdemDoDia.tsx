import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { generateOD } from '../services/geminiService';
import { Loader2, Printer, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QRCodeSVG } from 'qrcode.react';

export default function OrdemDoDia() {
  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [odContent, setOdContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchDays = async () => {
      const snap = await getDocs(collection(db, 'eventDays'));
      const daysData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDays(daysData);
      if (daysData.length > 0) setSelectedDay(daysData[0].id);
    };
    fetchDays();
  }, []);

  const handleGenerate = async () => {
    if (!selectedDay) return;
    setIsGenerating(true);
    try {
      const dayData = days.find(d => d.id === selectedDay);
      
      // Fetch activities for this day
      const actsSnap = await getDocs(query(collection(db, 'activities'), where('dayId', '==', selectedDay)));
      const activities = actsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch assignments
      const assignmentsSnap = await getDocs(collection(db, 'assignments'));
      const assignments = assignmentsSnap.docs.map(doc => doc.data());

      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const fullData = {
        day: dayData,
        activities: activities.map(act => ({
          ...act,
          assignments: assignments.filter(a => a.activityId === act.id).map(a => ({
            ...a,
            user: users.find(u => u.id === a.userId)
          }))
        }))
      };

      // Mock weather info (in a real app, fetch from an API)
      const weatherInfo = "Previsão: Ensolarado, 25°C. Fonte: Climatempo.";

      const generatedMarkdown = await generateOD(fullData, weatherInfo);
      setOdContent(generatedMarkdown);
    } catch (error) {
      alert('Erro ao gerar O.D.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Ordem do Dia (O.D.)</h1>
        <div className="flex space-x-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            {days.map(day => (
              <option key={day.id} value={day.id}>{day.date} - {day.location}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedDay}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
            Gerar O.D. com IA
          </button>
          {odContent && (
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
            >
              <Printer className="h-5 w-5 mr-2" /> Imprimir
            </button>
          )}
        </div>
      </div>

      {odContent && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
          <div className="prose max-w-none prose-tables:w-full prose-tables:border-collapse prose-th:bg-gray-50 prose-th:p-3 prose-th:border prose-th:border-gray-200 prose-td:p-3 prose-td:border prose-td:border-gray-200">
            <Markdown remarkPlugins={[remarkGfm]}>{odContent}</Markdown>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">Playlist Oficial WCD 2026</p>
            <QRCodeSVG value="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" size={120} />
          </div>
        </div>
      )}

      {!odContent && !isGenerating && (
        <div className="text-center py-12 text-gray-500">
          Selecione um dia e clique em "Gerar O.D. com IA" para criar o documento.
        </div>
      )}
    </div>
  );
}
