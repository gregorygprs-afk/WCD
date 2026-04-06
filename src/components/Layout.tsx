import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Users, FileText, History, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import { logOut } from '../firebase';
import Chatbot from './Chatbot';
import CountdownClock from './CountdownClock';

export default function Layout() {
  const { appUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Calendar },
    { name: 'Atividades', href: '/activities', icon: FileText },
    { name: 'Voluntários', href: '/volunteers', icon: Users },
    { name: 'Ordem do Dia', href: '/od', icon: Sparkles },
    { name: 'Histórico', href: '/logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-orange-600">WCD 2026 Itajaí</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-orange-700' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {appUser?.photoURL ? (
              <img src={appUser.photoURL} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {appUser?.name.charAt(0)}
              </div>
            )}
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{appUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{appUser?.role}</p>
            </div>
            <button onClick={logOut} className="ml-2 text-gray-400 hover:text-gray-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
        <h1 className="text-xl font-bold text-orange-600">WCD 2026</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-20 overflow-y-auto">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  location.pathname === item.href ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => { logOut(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="mr-4 h-6 w-6" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <Chatbot />
      <CountdownClock />
    </div>
  );
}
