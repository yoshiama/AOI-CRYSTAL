'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: number;
  order_id: number;
  created_at: number;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchNotifications();
    const sse = new EventSource('/api/notifications/stream');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notifications' && data.data?.length > 0) {
        setNotifications(prev => [...data.data, ...prev]);
        setUnread(prev => prev + data.data.length);
        if (audioRef.current) audioRef.current.play().catch(() => {});
      }
    };
    return () => sse.close();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  async function fetchNotifications() {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    }
  }

  async function markRead() {
    await fetch('/api/notifications', { method: 'PUT' });
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/equipo/login');
  }

  const navItems = [
    { href: '/equipo/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/equipo/productos', label: 'Productos', icon: '💎' },
    { href: '/equipo/pedidos', label: 'Pedidos', icon: '📦' },
    { href: '/equipo/finanzas', label: 'Finanzas', icon: '💰' },
    { href: '/equipo/galeria', label: 'Galería', icon: '🖼️' },
    { href: '/equipo/configuracion', label: 'Configuración', icon: '⚙️' },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-purple-700">✨ AOI</div>
          <div className="text-xs text-gray-400">Panel de equipo</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 p-1">✕</button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname.startsWith(item.href)
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex
      `}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition text-gray-600"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <h1 className="text-gray-800 font-semibold text-sm md:text-base">
              {navItems.find(n => pathname.startsWith(n.href))?.label || 'Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markRead(); }}
                className="relative p-2 rounded-xl hover:bg-gray-50 transition"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-10 w-72 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800 text-sm">
                    Notificaciones
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">Sin notificaciones</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-purple-50' : ''}`}>
                        <div className="font-medium text-sm text-gray-800">{n.title}</div>
                        <div className="text-xs text-gray-500">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at * 1000).toLocaleString('es-ES')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden sm:block text-sm text-gray-500">AOI Crystal</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2ozLS1gr9jmvHFHRFCR0OrWn2hBOkqJ1fLmp2pIOUSHze7jpGY..." type="audio/wav" />
      </audio>
    </div>
  );
}
