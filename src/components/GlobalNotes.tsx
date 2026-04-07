import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Save, Loader2, Users } from 'lucide-react';

export default function GlobalNotes() {
  const { appUser } = useAuth();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);
  
  const contentRef = useRef(content);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'notes', 'global_notes'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Only update local content if we aren't actively typing (not dirty)
        // Or if the remote change was made by someone else
        if (!isDirtyRef.current || data.lastUpdatedBy !== appUser?.name) {
          setContent(data.content || '');
          contentRef.current = data.content || '';
        }
        setLastUpdatedBy(data.lastUpdatedBy);
        if (data.lastUpdatedAt) {
          setLastSaved(new Date(data.lastUpdatedAt));
        }
      }
    });

    return () => unsub();
  }, [appUser?.name]);

  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (isDirtyRef.current) {
        setIsSaving(true);
        try {
          await setDoc(doc(db, 'notes', 'global_notes'), {
            content: contentRef.current,
            lastUpdatedBy: appUser?.name || 'Unknown',
            lastUpdatedAt: new Date().toISOString()
          }, { merge: true });
          
          isDirtyRef.current = false;
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error saving notes:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 10000); // Autosave every 10 seconds

    return () => clearInterval(saveInterval);
  }, [appUser?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    isDirtyRef.current = true;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-orange-600" />
          Anotações Compartilhadas
        </h2>
        <div className="flex items-center text-xs text-gray-500">
          {isSaving ? (
            <span className="flex items-center text-orange-600"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Salvando...</span>
          ) : lastSaved ? (
            <span className="flex items-center text-green-600"><Save className="h-3 w-3 mr-1" /> Salvo {lastSaved.toLocaleTimeString()} {lastUpdatedBy && `por ${lastUpdatedBy}`}</span>
          ) : (
            <span>Sincronizado na nuvem</span>
          )}
        </div>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Digite suas anotações aqui... Tudo é salvo automaticamente a cada 10 segundos e visível para todos os organizadores."
        className="w-full h-48 p-4 rounded-lg border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 resize-y text-gray-700"
      />
    </div>
  );
}
