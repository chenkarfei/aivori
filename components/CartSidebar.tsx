'use client';

import { useStore } from '@/store/useStore';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const translations = {
  en: { title: 'Your Cart', empty: 'Your cart is empty', checkout: 'Checkout', total: 'Total' },
  zh: { title: '您的购物车', empty: '您的购物车是空的', checkout: '结账', total: '总计' },
  ms: { title: 'Troli Anda', empty: 'Troli anda kosong', checkout: 'Daftar Keluar', total: 'Jumlah' }
};

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, language } = useStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const t = translations[language];

  const displayedCart = mounted ? cart : [];
  const total = displayedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-theme-white)] foodie-glass z-50 flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-[var(--color-theme-brown)]/10 flex items-center justify-between relative overflow-hidden">
              <h2 className="text-2xl font-bold text-[var(--color-theme-brown)]">{t.title}</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:text-[var(--color-theme-orange)] transition-colors">
                <X size={24} className="text-[var(--color-theme-green)]" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {displayedCart.length === 0 ? (
                <div className="text-center mt-20">
                  <div className="text-6xl mb-6 opacity-20">🛒</div>
                  <div className="text-[var(--color-theme-brown)]/40 font-bold uppercase tracking-widest text-sm">{t.empty}</div>
                </div>
              ) : (
                displayedCart.map((item, idx) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[var(--color-theme-brown)]/5"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--color-theme-beige)]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name[language]} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">No Photo</div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold leading-tight text-[var(--color-theme-brown)]">{item.name[language]}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--color-theme-brown)]/30 hover:text-red-500 transition-colors">
                          <Trash2 size={16} className="text-[var(--color-theme-green)]" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-[var(--color-theme-orange)]">RM {item.price.toFixed(2)}</div>
                        <div className="flex items-center gap-3 bg-[var(--color-theme-beige)] rounded-lg px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="hover:text-[var(--color-theme-orange)]"><Minus size={14} className="text-[var(--color-theme-green)]" /></button>
                          <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-[var(--color-theme-orange)]"><Plus size={14} className="text-[var(--color-theme-green)]" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-[var(--color-theme-brown)]/10 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{t.total}</span>
                <span className="text-2xl font-bold text-[var(--color-theme-brown)]">RM {total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                disabled={displayedCart.length === 0}
                className="w-full py-5 foodie-button text-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {t.checkout}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
