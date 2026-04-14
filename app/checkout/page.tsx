'use client';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

const translations = {
  en: { title: 'Checkout', loginRequired: 'Please login to continue', loginBtn: 'Login with Google', confirm: 'Confirm & Pay', empty: 'Your cart is empty', success: 'Payment Successful! Order ID:', total: 'Total', processing: 'Processing...', back: 'Back to Store', loading: 'Loading...' },
  zh: { title: '结账', loginRequired: '请登录以继续', loginBtn: '使用 Google 登录', confirm: '确认并付款', empty: '您的购物车是空的', success: '付款成功！订单号：', total: '总计', processing: '处理中...', back: '返回商店', loading: '正在加载...' },
  ms: { title: 'Daftar Keluar', loginRequired: 'Sila log masuk untuk meneruskan', loginBtn: 'Log Masuk dengan Google', confirm: 'Sahkan & Bayar', empty: 'Troli anda kosong', success: 'Pembayaran Berjaya! ID Pesanan:', total: 'Jumlah', processing: 'Memproses...', back: 'Kembali ke Kedai', loading: 'Memuatkan...' }
};

export default function Checkout() {
  const { cart, language, clearCart } = useStore();
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = translations[language];
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    setIsProcessing(true);

    try {
      const orderId = `ORD-${Date.now()}`;
      const orderData = {
        orderId,
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          name: item.name
        })),
        totalAmount: total,
        status: 'completed', // Mocking successful payment
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      setOrderSuccess(orderId);
      clearCart();
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[var(--color-theme-orange)]">{t.loading}</div>;

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="foodie-card p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-[var(--color-theme-green)] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--color-theme-green)]/20 text-4xl">✓</div>
          <h2 className="text-3xl font-bold mb-4">{t.success}</h2>
          <p className="text-xl font-bold text-[var(--color-theme-orange)] mb-10">{orderSuccess}</p>
          <button onClick={() => router.push('/')} className="foodie-button py-4 px-8 w-full text-lg">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-[var(--color-theme-brown)]">{t.title}</h1>

      <div className="foodie-card p-8 md:p-12">
        {cart.length === 0 ? (
          <div className="text-center font-bold text-xl py-12 opacity-40">{t.empty}</div>
        ) : (
          <>
            <div className="space-y-6 mb-10">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-[var(--color-theme-brown)]/10 pb-6">
                  <div>
                    <div className="font-bold text-lg">{item.name[language]}</div>
                    <div className="text-sm font-bold opacity-40 uppercase tracking-widest">Quantity: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-xl text-[var(--color-theme-brown)]">RM {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-6">
                <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{t.total}</span>
                <span className="text-3xl font-bold text-[var(--color-theme-brown)]">RM {total.toFixed(2)}</span>
              </div>
            </div>

            {!user ? (
              <div className="text-center bg-[var(--color-theme-beige)]/50 p-8 rounded-3xl border-2 border-dashed border-[var(--color-theme-brown)]/10">
                <p className="font-bold mb-6 text-[var(--color-theme-brown)]/60">{t.loginRequired}</p>
                <button onClick={handleLogin} className="foodie-button py-4 px-10">
                  {t.loginBtn}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="w-full foodie-button py-5 text-lg disabled:opacity-50 uppercase tracking-widest"
              >
                {isProcessing ? t.processing : t.confirm}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
