'use client';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Loader2, CheckCircle, MapPin, User, Mail, Phone, CreditCard, ChevronLeft, ShoppingBag } from 'lucide-react';

const translations = {
  en: { 
    title: 'Checkout', 
    shippingTitle: 'Shipping Details',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Delivery Address',
    loginRequired: 'Please login to continue', 
    loginBtn: 'Login with Google', 
    confirm: 'Complete Purchase', 
    empty: 'Your cart is empty', 
    success: 'Order Placed Successfully!', 
    orderIdText: 'Order ID:',
    total: 'Grand Total', 
    processing: 'Processing Order...', 
    back: 'Back to Store', 
    loading: 'Loading checkout...',
    summary: 'Order Summary'
  },
  zh: { 
    title: '结账', 
    shippingTitle: '收货详情',
    fullName: '全名',
    email: '电子邮件',
    phone: '电话号码',
    address: '送货地址',
    loginRequired: '请登录以继续', 
    loginBtn: '使用 Google 登录', 
    confirm: '完成购买', 
    empty: '您的购物车是空的', 
    success: '订单已成功提交！', 
    orderIdText: '订单号：',
    total: '总计', 
    processing: '订单处理中...', 
    back: '返回商店', 
    loading: '正在加载结账...',
    summary: '订单摘要'
  },
  ms: { 
    title: 'Daftar Keluar', 
    shippingTitle: 'Butiran Penghantaran',
    fullName: 'Nama Penuh',
    email: 'Alamat Emel',
    phone: 'Nombor Telefon',
    address: 'Alamat Penghantaran',
    loginRequired: 'Sila log masuk untuk meneruskan', 
    loginBtn: 'Log Masuk dengan Google', 
    confirm: 'Lengkapkan Pembelian', 
    empty: 'Troli anda kosong', 
    success: 'Pesanan Berjaya Dibuat!', 
    orderIdText: 'ID Pesanan:',
    total: 'Jumlah Keseluruhan', 
    processing: 'Memproses Pesanan...', 
    back: 'Kembali ke Kedai', 
    loading: 'Memuatkan daftar keluar...',
    summary: 'Ringkasan Pesanan'
  }
};

export default function Checkout() {
  const { cart, language, clearCart } = useStore();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[language];
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: profile?.name || user.displayName || '',
        email: user.email || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
      });
    }
  }, [user, profile]);

  const displayedCart = mounted ? cart : [];
  const total = displayedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || displayedCart.length === 0) return;
    setIsProcessing(true);

    try {
      const orderId = `ORD-${Date.now()}`;
      const orderData = {
        orderId,
        userId: user.uid,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: displayedCart.map(item => ({
          productId: item.id,
          name: item.name,
          priceAtPurchase: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: total,
        status: 'completed',
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-theme-white)]">
      <Loader2 className="animate-spin text-[var(--color-theme-green)] mb-4" size={48} />
      <div className="font-bold text-xl text-[var(--color-theme-brown)]/60 uppercase tracking-widest">{t.loading}</div>
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-theme-white)]">
        <div className="foodie-card p-12 text-center max-w-md w-full border-4 border-[var(--color-theme-green)]/10">
          <div className="w-24 h-24 bg-[var(--color-theme-green)] text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[var(--color-theme-green)]/20 rotate-12 group-hover:rotate-0 transition-transform">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[var(--color-theme-brown)]">{t.success}</h2>
          <div className="bg-[var(--color-theme-beige)]/40 p-4 rounded-2xl mb-10 border border-[var(--color-theme-brown)]/5">
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">{t.orderIdText}</p>
            <p className="text-2xl font-bold font-mono text-[var(--color-theme-orange)]">{orderSuccess}</p>
          </div>
          <button onClick={() => router.push('/')} className="foodie-button py-4 px-8 w-full text-lg shadow-lg">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-theme-white)] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-theme-brown)]/60 hover:text-[var(--color-theme-orange)] font-bold transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-[var(--color-theme-brown)] text-center">{t.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="foodie-card p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[var(--color-theme-green)] text-white rounded-xl flex items-center justify-center shadow-md">
                  <MapPin size={22} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-theme-brown)]">{t.shippingTitle}</h2>
              </div>

              {!user ? (
                <div className="text-center bg-[var(--color-theme-beige)]/30 p-10 rounded-3xl border-2 border-dashed border-[var(--color-theme-brown)]/10">
                  <p className="font-bold mb-6 text-[var(--color-theme-brown)]/60">{t.loginRequired}</p>
                  <button onClick={handleLogin} className="foodie-button py-4 px-10 flex items-center gap-3 mx-auto shadow-lg">
                    <User size={20} />
                    {t.loginBtn}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.fullName}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                        <input 
                          type="text" 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="foodie-input !pl-12" 
                          placeholder="Your Name" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.email}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                        <input 
                          type="email" 
                          required 
                          disabled
                          value={formData.email}
                          className="foodie-input !pl-12 opacity-50 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.phone}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="foodie-input !pl-12" 
                        placeholder="+60 12-345 6789" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.address}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-[var(--color-theme-green)]" size={18} />
                      <textarea 
                        required 
                        rows={4}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="foodie-input !pl-12 resize-none" 
                        placeholder="House No, Street Name, City, Postcode, State" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing || displayedCart.length === 0}
                    className="w-full foodie-button py-5 text-xl flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl mt-10 active:scale-95 transition-transform"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <CreditCard size={24} />
                        {t.confirm}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="foodie-card p-8 sticky top-28 border-2 border-[var(--color-theme-brown)]/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[var(--color-theme-orange)] text-white rounded-xl flex items-center justify-center shadow-md">
                  <ShoppingBag size={22} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-theme-brown)]">{t.summary}</h2>
              </div>

              {displayedCart.length === 0 ? (
                <div className="text-center bg-[var(--color-theme-beige)]/30 py-12 rounded-2xl">
                  <ShoppingBag className="mx-auto text-[var(--color-theme-brown)]/20 mb-4" size={48} />
                  <div className="font-bold opacity-40 uppercase tracking-widest text-sm">{t.empty}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {displayedCart.map(item => (
                      <div key={item.id} className="flex gap-4 p-3 bg-white border border-[var(--color-theme-brown)]/5 rounded-2xl group hover:border-[var(--color-theme-orange)]/30 transition-colors">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-theme-beige)] flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.image} 
                            alt={item.name[language]} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-center gap-1">
                          <h4 className="font-bold text-[var(--color-theme-brown)] leading-tight">{item.name[language]}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold opacity-40 uppercase tracking-wide">Qty: {item.quantity}</span>
                            <span className="font-bold text-[var(--color-theme-brown)] text-sm">RM {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t-2 border-dashed border-[var(--color-theme-brown)]/10 space-y-3">
                    <div className="flex justify-between items-center bg-[var(--color-theme-beige)]/30 p-4 rounded-2xl">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-40">{t.total}</span>
                      <span className="text-3xl font-bold text-[var(--color-theme-orange)]">RM {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
