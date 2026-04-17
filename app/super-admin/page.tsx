'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Eye, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  User,
  Edit3,
  Save,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';

export default function SuperAdminPortal() {
  const { user, role, loading } = useAuth();
  const { language } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // User Editing State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

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

      const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const map: Record<string, any> = {};
        querySnapshot.forEach((doc) => {
          map[doc.id] = doc.data();
        });
        setProductsMap(map);
      };

      fetchOrders();
      fetchUsers();
      fetchProducts();
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

  const handleOpenUserEdit = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  };

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdatingUser(true);

    try {
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        address: userFormData.address
      });

      setUsersList(usersList.map(u => u.uid === editingUser.uid ? { ...u, ...userFormData } : u));
      setEditingUser(null);
      alert("User profile updated successfully.");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Failed to update user profile.");
    } finally {
      setIsUpdatingUser(false);
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
                <th className="p-6">Actions</th>
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
                  <td className="p-6">
                    <button 
                      onClick={() => setSelectedOrder(o)}
                      className="p-2 bg-white border border-[var(--color-theme-brown)]/10 rounded-xl text-[var(--color-theme-green)] hover:bg-[var(--color-theme-green)] hover:text-white transition-all shadow-sm group"
                    >
                      <Eye size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-[var(--color-theme-brown)]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[var(--color-theme-beige)] flex items-center justify-between border-b-4 border-[var(--color-theme-green)]">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-theme-brown)]">Order #{selectedOrder?.orderId || 'N/A'}</h3>
                  <p className="text-sm opacity-60 font-medium">Placed on {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Date Unknown'}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[var(--color-theme-brown)]/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[var(--color-theme-beige)]/30 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={14} className="text-[var(--color-theme-green)]" />
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Customer Information</h4>
                    </div>
                    <p className="font-bold text-[var(--color-theme-brown)]">{selectedOrder?.customerInfo?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-70">
                      <Mail size={12} />
                      <p className="text-sm">{selectedOrder?.customerInfo?.email || 'No email'}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 opacity-70">
                      <Phone size={12} />
                      <p className="text-sm">{selectedOrder?.customerInfo?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="bg-[var(--color-theme-beige)]/30 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={14} className="text-[var(--color-theme-green)]" />
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Shipping Address</h4>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed font-medium">
                      {selectedOrder?.customerInfo?.address || 'No address provided (Legacy Order)'}
                    </p>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder?.items?.map((item: any, idx: number) => {
                    const currentProduct = productsMap[item?.productId];
                    const displayImage = item?.image || currentProduct?.image || 'https://picsum.photos/seed/fruit/200/200';
                    
                    return (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-[var(--color-theme-brown)]/5 rounded-2xl shadow-sm">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-theme-beige)] border border-[var(--color-theme-brown)]/5">
                          <Image 
                            src={displayImage} 
                            alt={typeof item?.name === 'string' ? item.name : (item?.name?.[language] || item?.name?.en || 'Snack')} 
                            fill 
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {!displayImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-theme-beige)]/80 text-[var(--color-theme-brown)]/20">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col gap-0.5">
                            <h5 className="font-bold text-[var(--color-theme-brown)] leading-tight">
                              {typeof item?.name === 'string' ? item.name : (item?.name?.[language] || item?.name?.en || 'Unknown Item')}
                            </h5>
                            <p className="text-xs font-bold text-[var(--color-theme-orange)]">
                              RM {typeof (item?.priceAtPurchase ?? item?.price) === 'number' 
                                ? (item?.priceAtPurchase ?? item?.price).toFixed(2) 
                                : parseFloat(item?.priceAtPurchase ?? item?.price ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-center px-3 py-1 bg-[var(--color-theme-beige)] rounded-lg">
                          <span className="text-xs font-bold opacity-40 block leading-none mb-1">QTY</span>
                          <span className="text-sm font-bold text-[var(--color-theme-brown)]">{item?.quantity || 0}</span>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-bold text-[var(--color-theme-brown)]">
                            RM {((item?.priceAtPurchase ?? item?.price ?? 0) * (item?.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-[var(--color-theme-brown)]/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-[var(--color-theme-green)] text-white text-xs font-bold rounded-xl shadow-md">
                    {selectedOrder?.status || 'Unknown Status'}
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40">Total Amount</p>
                  <p className="text-3xl font-bold text-[var(--color-theme-orange)] leading-none">RM {selectedOrder?.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <th className="p-6">Actions</th>
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
                  <td className="p-6">
                    <button 
                      onClick={() => handleOpenUserEdit(u)}
                      className="p-2 bg-white border border-[var(--color-theme-brown)]/10 rounded-xl text-[var(--color-theme-orange)] hover:bg-[var(--color-theme-orange)] hover:text-white transition-all shadow-sm group"
                      title="Edit Profile"
                    >
                      <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-[var(--color-theme-brown)]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-[var(--color-theme-beige)] border-b-4 border-[var(--color-theme-orange)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-theme-orange)] text-white rounded-xl flex items-center justify-center shadow-md">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-theme-brown)]">Edit Profile</h3>
                </div>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-[var(--color-theme-brown)]/5 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateUserProfile} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                    <input 
                      type="text" 
                      required 
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                      className="foodie-input !pl-12" 
                      placeholder="Name" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      className="foodie-input !pl-12" 
                      placeholder="Email" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                    <input 
                      type="tel" 
                      required 
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                      className="foodie-input !pl-12" 
                      placeholder="Phone" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-[var(--color-theme-green)]" size={18} />
                    <textarea 
                      required 
                      rows={3}
                      value={userFormData.address}
                      onChange={(e) => setUserFormData({...userFormData, address: e.target.value})}
                      className="foodie-input !pl-12 resize-none" 
                      placeholder="Address" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdatingUser}
                  className="w-full foodie-button py-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[var(--color-theme-orange)]/10"
                >
                  {isUpdatingUser ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
