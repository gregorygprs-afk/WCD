import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { createDocument, updateDocument, deleteDocument, handleFirestoreError } from '../lib/firestoreUtils';
import { analyzeAndOrganizeEventData } from '../services/geminiService';
import { Plus, Edit2, Trash2, Sparkles, Loader2, X } from 'lucide-react';

export default function Activities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '', description: '', startTime: '', endTime: '', type: 'palestra', location: '', dayId: ''
  });

  useEffect(() => {
    const unsubActivities = onSnapshot(query(collection(db, 'activities'), orderBy('startTime')), (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, 'list' as any, 'activities'));

    const unsubDays = onSnapshot(collection(db, 'eventDays'), (snapshot) => {
      setDays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list' as any, 'eventDays'));

    return () => {
      unsubActivities();
      unsubDays();
    };
  }, []);

  const handleAiOrganize = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const result = await analyzeAndOrganizeEventData({ activities, days }, aiPrompt);
      if (result) {
        // Apply changes
        for (const act of result.activitiesToAdd || []) {
          await createDocument('activities', act);
        }
        for (const act of result.activitiesToUpdate || []) {
          await updateDocument('activities', act.id, act.updates);
        }
        alert('Organização concluída pela IA:\n\n' + result.explanation);
        setAiPrompt('');
      }
    } catch (error) {
      alert('Erro ao processar com IA.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument('activities', newActivity);
      setIsModalOpen(false);
      setNewActivity({ title: '', description: '', startTime: '', endTime: '', type: 'palestra', location: '', dayId: '' });
    } catch (error) {
      alert('Erro ao adicionar atividade.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      await deleteDocument('activities', id);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-orange-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700">
          <Plus className="h-5 w-5 mr-2" /> Nova Atividade
        </button>
      </div>

      {/* AI Assistant Box */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <div className="flex items-start space-x-4">
          <div className="bg-orange-200 p-3 rounded-lg">
            <Sparkles className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-orange-900">Assistente de Organização IA</h3>
            <p className="text-sm text-orange-700 mb-4">Descreva como você quer organizar as atividades e a IA fará o trabalho pesado.</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Distribua as palestras uniformemente entre os dias 22 e 23..."
                className="flex-1 rounded-lg border-orange-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2"
              />
              <button
                onClick={handleAiOrganize}
                disabled={isAiLoading || !aiPrompt}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Organizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{activity.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {activity.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.startTime} - {activity.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-orange-600 hover:text-orange-900 mr-4"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma atividade cadastrada. Use a IA para gerar ou adicione manualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nova Atividade</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input required type="text" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dia</label>
                <select required value={newActivity.dayId} onChange={e => setNewActivity({...newActivity, dayId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option value="">Selecione um dia</option>
                  {days.map(d => <option key={d.id} value={d.id}>{d.date} - {d.location}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Início (HH:MM)</label>
                  <input required type="time" value={newActivity.startTime} onChange={e => setNewActivity({...newActivity, startTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fim (HH:MM)</label>
                  <input required type="time" value={newActivity.endTime} onChange={e => setNewActivity({...newActivity, endTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select required value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option value="palestra">Palestra</option>
                  <option value="workshop">Workshop</option>
                  <option value="painel">Painel</option>
                  <option value="roda_de_conversa">Roda de Conversa</option>
                  <option value="experiencia_cultural">Experiência Cultural</option>
                  <option value="atividade_educativa">Atividade Educativa</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Local</label>
                <input type="text" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Salvar Atividade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
