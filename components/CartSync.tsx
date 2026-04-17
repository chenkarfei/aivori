'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useStore } from '@/store/useStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CartSync() {
  const { user, loading } = useAuth();
  const { cart, setCart } = useStore();
  const initialFetchDone = useRef(false);
  const skipNextSync = useRef(false);

  // Restore cart from Firestore on login
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        initialFetchDone.current = false;
        return;
      }
      
      if (initialFetchDone.current) return;

      try {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          const remoteCart = cartDoc.data().items || [];
          
          if (cart.length > 0) {
            // Merge: If same product exists, update quantity, otherwise add new
            const mergedCart = [...remoteCart];
            cart.forEach(localItem => {
              const existingIndex = mergedCart.findIndex(i => i.id === localItem.id);
              if (existingIndex > -1) {
                mergedCart[existingIndex].quantity += localItem.quantity;
              } else {
                mergedCart.push(localItem);
              }
            });
            setCart(mergedCart);
          } else {
            setCart(remoteCart);
          }
        } else if (cart.length > 0) {
          // If no remote cart exists but local does, it will be synced in the other effect
          console.log("No remote cart, local cart will be synced.");
        }
        initialFetchDone.current = true;
      } catch (error) {
        console.error("Error fetching cart from Firestore:", error);
      }
    };

    if (!loading) {
      fetchCart();
    }
  }, [user, loading, setCart, cart]);

  // Sync cart TO Firestore on changes
  useEffect(() => {
    const syncCart = async () => {
      if (!user || !initialFetchDone.current) return;

      try {
        await setDoc(doc(db, 'carts', user.uid), {
          items: cart,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Error syncing cart to Firestore:", error);
      }
    };

    // Debounce slightly or just run on every change
    const timeout = setTimeout(() => {
      syncCart();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [cart, user]);

  return null;
}
