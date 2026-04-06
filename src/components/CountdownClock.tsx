import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function CountdownClock() {
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Fetch event days to find the first day of the event
    const unsub = onSnapshot(collection(db, 'eventDays'), (snapshot) => {
      const days = snapshot.docs.map(doc => doc.data());
      
      // Default fallback to 21/04/2026 08:00 AM (BRT)
      let targetDate = new Date('2026-04-21T08:00:00-03:00'); 

      if (days.length > 0) {
        // Sort to find the earliest day
        days.sort((a: any, b: any) => a.date.localeCompare(b.date));
        const firstDay = days[0] as any;
        // Use the first day found in the database, default to 08:00 AM
        targetDate = new Date(`${firstDay.date}T08:00:00-03:00`);
      }
      
      setNextEvent({ title: 'Início do WCD Itajaí', eventDate: targetDate });
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
        <span className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1 truncate max-w-[150px]" title={nextEvent.title}>
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
