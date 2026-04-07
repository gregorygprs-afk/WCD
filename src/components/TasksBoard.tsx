import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { createDocument, updateDocument, handleFirestoreError } from '../lib/firestoreUtils';
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function TasksBoard() {
  const { appUser } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({ title: '', status: 'pending', startTime: '', projectedEndTime: '', assigneeId: '' });
  const [newComment, setNewComment] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list' as any, 'tasks'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list' as any, 'users'));

    const unsubComments = onSnapshot(query(collection(db, 'taskComments'), orderBy('timestamp', 'asc')), (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list' as any, 'taskComments'));

    return () => { unsubTasks(); unsubUsers(); unsubComments(); };
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument('tasks', {
        ...newTask,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewTask({ title: '', status: 'pending', startTime: '', projectedEndTime: '', assigneeId: '' });
    } catch (error) {
      alert('Erro ao criar tarefa');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDocument('tasks', taskId, { status: newStatus }, appUser?.uid || 'unknown');
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    // Extract mentions (e.g., @John)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedUser = users.find(u => u.name.toLowerCase().includes(match[1].toLowerCase()));
      if (mentionedUser) mentions.push(mentionedUser.id);
    }

    try {
      await createDocument('taskComments', {
        taskId: selectedTask.id,
        text: newComment,
        authorId: appUser?.uid || 'unknown',
        timestamp: new Date().toISOString(),
        mentions
      });
      setNewComment('');
      setShowMentions(false);
    } catch (error) {
      alert('Erro ao adicionar comentário');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 border-orange-300 text-orange-800'; // Faltantes (Laranja)
      case 'in_progress': return 'bg-yellow-100 border-yellow-300 text-yellow-800'; // Em andamento (Amarelo)
      case 'completed': return 'bg-green-100 border-green-300 text-green-800'; // Concluídas (Verde)
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  const columns = [
    { id: 'pending', title: 'Faltantes', color: 'text-orange-600' },
    { id: 'in_progress', title: 'Em Andamento', color: 'text-yellow-600' },
    { id: 'completed', title: 'Concluídas', color: 'text-green-600' }
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quadro de Atividades (Resumo)</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" /> Nova Etapa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className={`font-bold mb-4 flex items-center ${col.color}`}>
              {getStatusIcon(col.id)}
              <span className="ml-2">{col.title}</span>
              <span className="ml-auto bg-white px-2 py-1 rounded-full text-xs text-gray-500 border border-gray-200">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </h3>
            <div className="space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const taskComments = comments.filter(c => c.taskId === task.id);
                return (
                  <div key={task.id} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${getStatusColor(task.status).split(' ')[1]} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setSelectedTask(task)}>
                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(task.startTime).toLocaleDateString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {new Date(task.projectedEndTime).toLocaleDateString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs font-medium text-gray-700">
                        {assignee?.photoURL ? (
                          <img src={assignee.photoURL} alt="" className="h-5 w-5 rounded-full mr-2" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <User className="h-3 w-3 text-gray-500" />
                          </div>
                        )}
                        {assignee?.name || 'Não atribuído'}
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" /> {taskComments.length}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nova Etapa</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Início</label>
                  <input required type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fim (Projeção)</label>
                  <input required type="datetime-local" value={newTask.projectedEndTime} onChange={e => setNewTask({...newTask, projectedEndTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Responsável</label>
                <select required value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option value="">Selecione um responsável</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Inicial</label>
                <select required value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option value="pending">Faltante</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancelar</button>
                <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details & Comments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 transform rotate-45" />
              </button>
            </div>
            
            <div className="flex space-x-2 mb-6">
              <button onClick={() => handleUpdateStatus(selectedTask.id, 'pending')} className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTask.status === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Faltante</button>
              <button onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')} className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTask.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Em Andamento</button>
              <button onClick={() => handleUpdateStatus(selectedTask.id, 'completed')} className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Concluída</button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Comentários</h3>
              {comments.filter(c => c.taskId === selectedTask.id).map(comment => {
                const author = users.find(u => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{author?.name || 'Usuário'}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.text.split(/(@\w+)/g).map((part: string, i: number) => 
                        part.startsWith('@') ? <span key={i} className="text-orange-600 font-medium">{part}</span> : part
                      )}
                    </p>
                  </div>
                );
              })}
              {comments.filter(c => c.taskId === selectedTask.id).length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhum comentário ainda.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="mt-auto relative">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      const lastWord = e.target.value.split(' ').pop() || '';
                      if (lastWord.startsWith('@')) {
                        setMentionSearch(lastWord.substring(1).toLowerCase());
                        setShowMentions(true);
                      } else {
                        setShowMentions(false);
                      }
                    }}
                    placeholder="Adicione um comentário... Use @ para mencionar alguém"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                  {showMentions && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {users.filter(u => u.name.toLowerCase().includes(mentionSearch)).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 focus:bg-orange-50"
                          onClick={() => {
                            const words = newComment.split(' ');
                            words.pop();
                            setNewComment([...words, `@${u.name.split(' ')[0]} `].join(' '));
                            setShowMentions(false);
                          }}
                        >
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!newComment.trim()} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
