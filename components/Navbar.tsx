'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  Globe, 
  ChevronDown, 
  History, 
  LayoutDashboard,
  Home
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const translations = {
  en: { home: 'Home', login: 'Login', logout: 'Logout', admin: 'Admin', superAdmin: 'Dashboard', orders: 'Orders', langName: 'English' },
  zh: { home: '首页', login: '登录', logout: '登出', admin: '管理', superAdmin: '仪表板', orders: '订单', langName: '中文' },
  ms: { home: 'Laman Utama', login: 'Log Masuk', logout: 'Log Keluar', admin: 'Admin', superAdmin: 'Papan Pemuka', orders: 'Pesanan', langName: 'Melayu' }
};

export default function Navbar() {
  const { language, setLanguage, cart, setIsCartOpen, clearCart } = useStore();
  const { user, role, profile } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Hydration fix for persistent store
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const t = translations[language];

  const cartCount = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearCart();
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 foodie-glass w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative">
        {/* Left Section (Logo) */}
        <div className="flex-1 flex items-center h-full shrink-0">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity h-full">
            <Image 
              src="https://i.imghippo.com/files/igKd6266Uz.png" 
              alt="Aivori Logo" 
              width={100} 
              height={25} 
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        {/* Right Section (Actions) */}
        <div className="flex items-center justify-end gap-1 sm:gap-4 h-full">
          {/* Custom Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/40 border border-[var(--color-theme-brown)]/5 hover:bg-white/60 transition-all text-[var(--color-theme-brown)]"
            >
              <Globe size={14} className="text-[var(--color-theme-green)]" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{language}</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-36 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-theme-brown)]/5 p-2 z-20 overflow-hidden"
                  >
                    {(['en', 'zh', 'ms'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${
                          language === lang 
                            ? 'bg-[var(--color-theme-orange)] text-white' 
                            : 'hover:bg-[var(--color-theme-brown)]/5 text-[var(--color-theme-brown)]'
                        }`}
                      >
                        {translations[lang].langName}
                        {language === lang && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 sm:gap-2 h-full">
            <Link href="/" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-1.5 px-2 py-2 rounded-xl transition-colors text-xs whitespace-nowrap group">
              <Home size={16} className="text-[var(--color-theme-green)] group-hover:scale-110 transition-transform" /> 
              <span className="hidden md:inline">{t.home}</span>
            </Link>
            {user && role === 'client' && (
              <Link href="/orders" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-1.5 px-2 py-2 rounded-xl transition-colors text-xs whitespace-nowrap group">
                <History size={16} className="text-[var(--color-theme-green)] group-hover:scale-110 transition-transform" /> 
                <span className="hidden md:inline">{t.orders}</span>
              </Link>
            )}
            {(role === 'admin' || role === 'super_admin') && (
              <Link href="/admin" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-1.5 px-2 py-2 rounded-xl transition-colors text-xs whitespace-nowrap group">
                <ShieldCheck size={16} className="text-[var(--color-theme-green)] group-hover:scale-110 transition-transform" /> 
                <span className="hidden md:inline">{t.admin}</span>
              </Link>
            )}
            {role === 'super_admin' && (
              <Link href="/super-admin" className="font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] flex items-center gap-1.5 px-2 py-2 rounded-xl transition-colors text-xs whitespace-nowrap group">
                <LayoutDashboard size={16} className="text-[var(--color-theme-green)] group-hover:scale-110 transition-transform" /> 
                <span className="hidden md:inline">{t.superAdmin}</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 border-l border-[var(--color-theme-brown)]/10 pl-2 sm:pl-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] transition-colors group"
            >
              <ShoppingCart size={20} className="text-[var(--color-theme-green)] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[var(--color-theme-orange)] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-[var(--color-theme-white)]">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-[var(--color-theme-brown)] font-bold text-[10px] uppercase tracking-wider opacity-60">
                  {profile?.name || user.displayName || user.email?.split('@')[0]}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 font-bold text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] px-2 py-2 rounded-xl transition-colors text-xs group">
                  <LogOut size={16} className="text-[var(--color-theme-green)] group-hover:translate-x-0.5 transition-transform" /> 
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="foodie-button px-3 py-1.5 text-[10px] sm:text-xs flex items-center gap-1.5">
                <LogIn size={14} className="text-white" /> {t.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
