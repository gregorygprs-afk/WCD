import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Clock } from 'lucide-react';

export default function CountdownClock() {
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Fetch the next upcoming activity
    const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const q = query(
      collection(db, 'activities'),
      orderBy('startTime')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Find the first activity that is in the future
      // Since we don't have full Date objects easily queryable without complex indexes, we filter client side for simplicity
      const nowTime = new Date();
      
      // We need to match activity with its day to get the full date
      // For simplicity, let's just fetch days too
      // Actually, let's just fetch days and find the next day
      // To avoid complex joins, let's just fetch eventDays
      const daysUnsub = onSnapshot(collection(db, 'eventDays'), (daysSnap) => {
        const days = daysSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        let upcoming: any = null;
        let minDiff = Infinity;

        activities.forEach(act => {
          const day = days.find(d => d.id === act.dayId);
          if (day && day.date && act.startTime) {
            const eventDate = new Date(`${day.date}T${act.startTime}:00`);
            const diff = eventDate.getTime() - nowTime.getTime();
            if (diff > 0 && diff < minDiff) {
              minDiff = diff;
              upcoming = { ...act, eventDate };
            }
          }
        });

        setNextEvent(upcoming);
      });

      return () => daysUnsub();
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextEvent.eventDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  if (!nextEvent) return null;

  // Calculate rotation for analog hands
  const secondsDegrees = ((timeLeft.seconds / 60) * 360) + 90;
  const minsDegrees = ((timeLeft.minutes / 60) * 360) + ((timeLeft.seconds/60)*6) + 90;
  const hoursDegrees = ((timeLeft.hours / 12) * 360) + ((timeLeft.minutes/60)*30) + 90;

  return (
    <div className="fixed top-20 right-4 z-40 bg-white p-3 rounded-xl shadow-lg border border-orange-100 flex items-center space-x-4 hover:scale-105 transition-transform cursor-default">
      <div className="relative w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center bg-orange-50">
        {/* Clock Center */}
        <div className="absolute w-1.5 h-1.5 bg-orange-800 rounded-full z-10"></div>
        {/* Hour Hand */}
        <div 
          className="absolute w-3.5 h-0.5 bg-orange-800 origin-left rounded-full"
          style={{ transform: `rotate(${hoursDegrees}deg)`, left: '50%' }}
        ></div>
        {/* Minute Hand */}
        <div 
          className="absolute w-4.5 h-0.5 bg-orange-600 origin-left rounded-full"
          style={{ transform: `rotate(${minsDegrees}deg)`, left: '50%' }}
        ></div>
        {/* Second Hand */}
        <div 
          className="absolute w-5 h-px bg-red-500 origin-left"
          style={{ transform: `rotate(${secondsDegrees}deg)`, left: '50%' }}
        ></div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1 truncate max-w-[120px]" title={nextEvent.title}>
          {nextEvent.title}
        </span>
        <div className="flex space-x-2 text-center">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">{timeLeft.days}</span>
            <span className="text-[10px] text-gray-500">Dias</span>
          </div>
          <span className="text-gray-300 font-bold">:</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] text-gray-500">Hrs</span>
          </div>
          <span className="text-gray-300 font-bold">:</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] text-gray-500">Min</span>
          </div>
          <span className="text-gray-300 font-bold">:</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-orange-600 leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[10px] text-gray-500">Seg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
