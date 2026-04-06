import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from '../lib/firestoreUtils';
import { Loader2, Mail, Shield } from 'lucide-react';

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setVolunteers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, 'list' as any, 'users'));

    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-orange-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Voluntários & Equipe</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {volunteers.map((vol) => (
          <div key={vol.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            {vol.photoURL ? (
              <img src={vol.photoURL} alt={vol.name} className="w-20 h-20 rounded-full mb-4" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl mb-4">
                {vol.name.charAt(0)}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{vol.name}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Mail className="h-4 w-4 mr-1" /> {vol.email}
            </div>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
              <Shield className="h-3 w-3 mr-1" />
              {vol.role === 'admin' ? 'Administrador' : vol.role === 'organizer' ? 'Organizador' : 'Voluntário'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
