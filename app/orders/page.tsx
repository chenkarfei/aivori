'use client';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Calendar, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const translations = {
  en: { title: 'My Orders', empty: 'You haven\'t placed any orders yet.', loading: 'Loading your orders...', back: 'Back to Shop', total: 'Total Amount', date: 'Date', status: 'Status', orderId: 'Order ID' },
  zh: { title: '我的订单', empty: '您还没有任何订单。', loading: '正在加载您的订单...', back: '回到商店', total: '总金额', date: '日期', status: '状态', orderId: '订单号' },
  ms: { title: 'Pesanan Saya', empty: 'Anda belum membuat sebarang pesanan lagi.', loading: 'Memuatkan pesanan anda...', back: 'Kembali ke Kedai', total: 'Jumlah Amaun', date: 'Tarikh', status: 'Status', orderId: 'ID Pesanan' }
};

export default function OrderHistory() {
  const { language } = useStore();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedOrders: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push(doc.data());
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchOrders();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-bold text-2xl text-[var(--color-theme-orange)] animate-pulse">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-[var(--color-theme-orange)]/10 text-[var(--color-theme-orange)] rounded-2xl flex items-center justify-center">
          <Package size={24} />
        </div>
        <h1 className="text-4xl font-bold text-[var(--color-theme-brown)] font-serif">{t.title}</h1>
      </div>

      {orders.length === 0 ? (
        <div className="foodie-card p-16 text-center">
          <div className="text-6xl mb-6 opacity-20">📦</div>
          <p className="text-xl font-bold text-[var(--color-theme-brown)]/40 mb-8">{t.empty}</p>
          <button 
            onClick={() => router.push('/')}
            className="foodie-button px-8 py-4"
          >
            {t.back}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order, idx) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="foodie-card overflow-hidden border border-[var(--color-theme-brown)]/5"
            >
              <div className="p-6 md:p-8 bg-white/50 border-b border-[var(--color-theme-brown)]/5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t.orderId}</div>
                  <div className="font-mono text-sm font-bold text-[var(--color-theme-brown)]">{order.orderId}</div>
                </div>
                <div className="flex flex-wrap gap-6 md:gap-12">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                      <Calendar size={10} /> {t.date}
                    </div>
                    <div className="font-bold text-sm">
                      {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'ms-MY')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                      <CreditCard size={10} /> {t.total}
                    </div>
                    <div className="font-bold text-lg text-[var(--color-theme-orange)]">
                      RM {order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                      <Clock size={10} /> {t.status}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-theme-orange)]/20 group-hover:bg-[var(--color-theme-orange)] transition-colors" />
                      <div>
                        <div className="font-bold text-[var(--color-theme-brown)]">{item.name[language] || item.name.en}</div>
                        <div className="text-xs font-bold opacity-40 uppercase tracking-widest">Qty: {item.quantity} × RM {item.priceAtPurchase.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="font-bold text-[var(--color-theme-brown)]">
                      RM {(item.priceAtPurchase * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
