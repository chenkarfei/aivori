'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export default function SuperAdminPortal() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Removed the redirect logic here so the login button can be shown
  }, [role, loading, router]);

  useEffect(() => {
    if (role === 'super_admin') {
      const fetchOrders = async () => {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ords: any[] = [];
        let rev = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ords.push(data);
          rev += data.totalAmount;
        });
        setOrders(ords);
        setTotalRevenue(rev);
      };
      
      const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usrs: any[] = [];
        querySnapshot.forEach((doc) => {
          usrs.push(doc.data());
        });
        setUsersList(usrs);
      };

      fetchOrders();
      fetchUsers();
    }
  }, [role]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsersList(usersList.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role.");
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[var(--color-theme-orange)]">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={handleLogin} className="foodie-button py-4 px-8 text-xl">
          Super Admin Login
        </button>
      </div>
    );
  }

  // ✅ Add this — wait for role to be fetched from Firestore
  if (role === null) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[var(--color-theme-orange)]">Loading...</div>;

  if (role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-theme-brown)] mb-2">Financial Dashboard</h1>
          <p className="text-[var(--color-theme-brown)]/60 font-medium">Overview of your store&apos;s performance and users.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-[var(--color-theme-brown)]/10 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="foodie-card p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-[var(--color-theme-green)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-theme-green)]/20">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-[var(--color-theme-brown)]">RM {totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="foodie-card p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-[var(--color-theme-yellow)] text-[var(--color-theme-brown)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-theme-yellow)]/20">
            <ShoppingBag size={32} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-[var(--color-theme-brown)]">{orders.length}</p>
          </div>
        </div>

        <div className="foodie-card p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-[var(--color-theme-orange)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-theme-orange)]/20">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-[var(--color-theme-brown)]">RM {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>

      <div className="foodie-card overflow-hidden mb-16">
        <div className="p-8 border-b border-[var(--color-theme-brown)]/5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <div className="text-xs font-bold uppercase tracking-widest opacity-40">{orders.length} Total</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="foodie-table-header">
                <th className="p-6">Order ID</th>
                <th className="p-6">Date</th>
                <th className="p-6">Items</th>
                <th className="p-6">Total</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-theme-brown)]/5">
              {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(o => (
                <tr key={o.orderId} className="hover:bg-[var(--color-theme-beige)]/30 transition-colors">
                  <td className="p-6 font-bold text-sm">{o.orderId}</td>
                  <td className="p-6 text-sm font-medium opacity-70">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-6 text-sm font-medium opacity-70">{o.items.length} items</td>
                  <td className="p-6 text-lg font-bold text-[var(--color-theme-orange)]">RM {o.totalAmount.toFixed(2)}</td>
                  <td className="p-6">
                    <span className="foodie-badge bg-[var(--color-theme-green)] text-white">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="foodie-card overflow-hidden">
        <div className="p-8 border-b border-[var(--color-theme-brown)]/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--color-theme-orange)] text-white rounded-xl flex items-center justify-center shadow-md">
            <Users size={20} />
          </div>
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="foodie-table-header">
                <th className="p-6">Email</th>
                <th className="p-6">User ID</th>
                <th className="p-6">Joined</th>
                <th className="p-6">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-theme-brown)]/5">
              {usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(u => (
                <tr key={u.uid} className="hover:bg-[var(--color-theme-beige)]/30 transition-colors">
                  <td className="p-6 font-bold text-sm">{u.email}</td>
                  <td className="p-6 text-[10px] font-mono opacity-40">{u.uid}</td>
                  <td className="p-6 text-sm font-medium opacity-70">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-6">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      disabled={u.email === 'evotech4001@gmail.com'}
                      className="foodie-input py-2 text-xs font-bold w-auto min-w-[140px] disabled:opacity-50"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
