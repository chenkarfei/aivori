'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import NextImage from 'next/image';
import { Plus, Edit, Trash2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '@/store/useStore';

const adminTranslations: any = {
  en: {
    image: 'Image',
    price: 'Price',
    stock: 'Stock',
    actions: 'Actions',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    add_product: 'Add Product',
    admin_portal: 'Admin Portal',
    manage_inventory: 'Manage your products and inventory.',
    count: 'Count',
    threshold: 'Threshold',
    reorder_needed: 'Reorder Needed'
  },
  zh: {
    image: '图片',
    price: '价格',
    stock: '库存',
    actions: '操作',
    in_stock: '有现货',
    out_of_stock: '缺货',
    add_product: '添加产品',
    admin_portal: '管理后台',
    manage_inventory: '管理您的产品和库存。',
    count: '数量',
    threshold: '补货阈值',
    reorder_needed: '需要补货'
  },
  ms: {
    image: 'Imej',
    price: 'Harga',
    stock: 'Stok',
    actions: 'Tindakan',
    in_stock: 'Ada Stok',
    out_of_stock: 'Tiada Stok',
    add_product: 'Tambah Produk',
    admin_portal: 'Portal Admin',
    manage_inventory: 'Urus produk dan inventori anda.',
    count: 'Bilangan',
    threshold: 'Ambang Stok',
    reorder_needed: 'Perlu Reorder'
  }
};

export default function AdminPortal() {
  const { language } = useStore();
  const t = adminTranslations[language] || adminTranslations.en;
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<any>({
    id: '', price: 0, image: '', weight: '', isHalal: false, stockStatus: 'in_stock',
    stockCount: 0, reorderThreshold: 10,
    name: { en: '', zh: '', ms: '' },
    description: { en: '', zh: '', ms: '' },
    ingredients: { en: '', zh: '', ms: '' }
  });

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Using 0.6 quality to be safe with Firestore 1MB limit
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (e) => reject(e);
      img.src = base64Str;
    });
  };

  useEffect(() => {
    // Removed the redirect logic here so the login button can be shown
  }, [role, loading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: any[] = [];
      querySnapshot.forEach((doc) => prods.push(doc.data()));
      setProducts(prods);
    };

    if (role === 'admin' || role === 'super_admin') {
      fetchProducts();
    }
  }, [role]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const compressed = await compressImage(event.target?.result as string);
          setFormData({ ...formData, image: compressed });
        } catch (err) {
          setErrorMessage("Failed to compress image.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read image file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing image:", error);
      setErrorMessage(`Failed to process image: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const id = formData.id || `PROD-${Date.now()}`;
      
      // Ensure we are only saving a plain JavaScript object, stripping out any React/DOM events
      const dataToSave = {
        id: id,
        price: Number(formData.price) || 0,
        image: formData.image || '',
        weight: formData.weight || '',
        isHalal: Boolean(formData.isHalal),
        stockStatus: formData.stockStatus || 'in_stock',
        stockCount: Number(formData.stockCount) || 0,
        reorderThreshold: Number(formData.reorderThreshold) || 0,
        name: { 
          en: formData.name?.en || '', 
          zh: formData.name?.zh || '', 
          ms: formData.name?.ms || '' 
        },
        description: { 
          en: formData.description?.en || '', 
          zh: formData.description?.zh || '', 
          ms: formData.description?.ms || '' 
        },
        ingredients: { 
          en: formData.ingredients?.en || '', 
          zh: formData.ingredients?.zh || '', 
          ms: formData.ingredients?.ms || '' 
        },
        createdAt: formData.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'products', id), dataToSave);
      setIsModalOpen(false);
      
      // Re-fetch products after saving
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: any[] = [];
      querySnapshot.forEach((doc) => prods.push(doc.data()));
      setProducts(prods);
    } catch (error: any) {
      console.error("Error saving product:", error);
      setErrorMessage(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      
      // Re-fetch products after deleting
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: any[] = [];
      querySnapshot.forEach((doc) => prods.push(doc.data()));
      setProducts(prods);
      setProductToDelete(null);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setErrorMessage(`Failed to delete product: ${error.message}`);
      setProductToDelete(null);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleAutoTranslate = async () => {
    const hasAnyContent = (obj: any) => Object.values(obj).some(val => !!val);
    
    if (!hasAnyContent(formData.name) && !hasAnyContent(formData.description) && !hasAnyContent(formData.ingredients)) {
      setErrorMessage("Please enter some content in any language first.");
      return;
    }

    setIsTranslating(true);
    setErrorMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `
        You are a professional translator for a Malaysian snack brand. 
        I will provide product information that might be in a mix of English, Chinese (Simplified), and Malay.
        Your task is to detect the languages provided and fill in the missing translations for ALL three languages (en, zh, ms).
        
        Ensure the tone is appetizing and professional.
        Return the result as a JSON object with this structure:
        {
          "name": { "en": "...", "zh": "...", "ms": "..." },
          "description": { "en": "...", "zh": "...", "ms": "..." },
          "ingredients": { "en": "...", "zh": "...", "ms": "..." }
        }

        Current Data (some fields may be empty):
        Name: ${JSON.stringify(formData.name)}
        Description: ${JSON.stringify(formData.description)}
        Ingredients: ${JSON.stringify(formData.ingredients)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  zh: { type: Type.STRING },
                  ms: { type: Type.STRING }
                }
              },
              description: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  zh: { type: Type.STRING },
                  ms: { type: Type.STRING }
                }
              },
              ingredients: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  zh: { type: Type.STRING },
                  ms: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setFormData({
        ...formData,
        name: { ...formData.name, ...result.name },
        description: { ...formData.description, ...result.description },
        ingredients: { ...formData.ingredients, ...result.ingredients }
      });
    } catch (error: any) {
      console.error("Translation failed:", error);
      setErrorMessage(`Translation failed: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAiImageGeneration = async () => {
    if (!formData.name.en) {
      setErrorMessage("Please enter a product name first to generate a relevant image.");
      return;
    }

    setIsGeneratingImage(true);
    setErrorMessage('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const imagePrompt = `A professional, high-quality studio product photograph of ${formData.name.en}. 
      Description: ${formData.description.en}. 
      The image should be appetizing, well-lit, and on a clean background suitable for an e-commerce website. 
      Artisanal Malaysian snack style.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: imagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let generatedImageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (generatedImageUrl) {
        const compressed = await compressImage(generatedImageUrl);
        setFormData({ ...formData, image: compressed });
      } else {
        // Fallback to a better search-based placeholder if generation didn't return an image
        const keywords = formData.name.en.toLowerCase().replace(/[^a-z0-9]/g, ',');
        setFormData({ ...formData, image: `https://loremflickr.com/800/800/${keywords}` });
      }
    } catch (error: any) {
      console.error("AI Image Generation failed, falling back to search:", error);
      // Fallback to a better search-based placeholder on error
      const keywords = formData.name.en.toLowerCase().replace(/[^a-z0-9]/g, ',');
      setFormData({ ...formData, image: `https://loremflickr.com/800/800/${keywords}` });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[var(--color-theme-orange)]">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={handleLogin} className="foodie-button py-4 px-8 text-xl">
          Admin Login
        </button>
      </div>
    );
  }

  // ✅ Add this — wait for role to be fetched from Firestore
  if (role === null) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[var(--color-theme-orange)]">Loading...</div>;

  if (role !== 'admin' && role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-theme-brown)] mb-2">{t.admin_portal}</h1>
          <p className="text-[var(--color-theme-brown)]/60 font-medium">{t.manage_inventory}</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              id: '', price: 0, image: '', weight: '', isHalal: false, stockStatus: 'in_stock',
              stockCount: 0, reorderThreshold: 10,
              name: { en: '', zh: '', ms: '' }, description: { en: '', zh: '', ms: '' }, ingredients: { en: '', zh: '', ms: '' }
            });
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="foodie-button py-3 px-6 flex items-center gap-2"
        >
          <Plus size={20} /> {t.add_product}
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-100 text-red-700 p-4 mb-8 font-bold rounded-2xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600 transition-colors">✕</button>
        </div>
      )}

      <div className="foodie-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="foodie-table-header">
                <th className="p-6">{t.image}</th>
                <th className="p-6">{language === 'en' ? 'Name' : language === 'zh' ? '名称' : 'Nama'} ({language.toUpperCase()})</th>
                <th className="p-6">{t.price}</th>
                <th className="p-6">{t.stock}</th>
                <th className="p-6">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-theme-brown)]/5">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-[var(--color-theme-beige)]/30 transition-colors">
                  <td className="p-6">
                    {p.image ? (
                      <div className="w-14 h-14 rounded-xl border-2 border-[var(--color-theme-brown)]/10 overflow-hidden shadow-sm relative">
                        <NextImage 
                          src={p.image} 
                          alt="product" 
                          fill 
                          className="object-cover" 
                          unoptimized 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[var(--color-theme-brown)]/20 bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">No Img</div>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-[var(--color-theme-brown)]">{p.name[language] || p.name.en}</div>
                    <div className="flex gap-1.5 mt-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${p.name.zh && p.description.zh ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>ZH</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${p.name.ms && p.description.ms ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>MS</span>
                    </div>
                  </td>
                  <td className="p-6 text-lg font-bold text-[var(--color-theme-orange)]">RM {p.price.toFixed(2)}</td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                       <span className={`foodie-badge flex items-center gap-1.5 w-fit ${p.stockStatus === 'in_stock' ? 'bg-[var(--color-theme-green)] text-white' : 'bg-red-500 text-white'}`}>
                        {t[p.stockStatus] || p.stockStatus.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--color-theme-brown)]/60 uppercase tracking-widest">{t.count}: {p.stockCount || 0}</span>
                        {(p.stockCount <= (p.reorderThreshold || 0)) && p.stockStatus === 'in_stock' && (
                          <div className="group relative">
                            <AlertCircle size={14} className="text-red-500 animate-pulse" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-red-600 text-white text-[10px] whitespace-nowrap rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                              {t.reorder_needed}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { 
                          setFormData({
                            ...formData,
                            ...p,
                            name: { ...formData.name, ...(p.name || {}) },
                            description: { ...formData.description, ...(p.description || {}) },
                            ingredients: { ...formData.ingredients, ...(p.ingredients || {}) }
                          }); 
                          setErrorMessage(''); 
                          setIsModalOpen(true); 
                        }} 
                        className="p-2.5 bg-white rounded-xl border-2 border-[var(--color-theme-brown)]/10 text-[var(--color-theme-brown)] hover:border-[var(--color-theme-orange)] hover:text-[var(--color-theme-orange)] transition-all shadow-sm"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(p.id)} 
                        className="p-2.5 bg-white rounded-xl border-2 border-[var(--color-theme-brown)]/10 text-[var(--color-theme-brown)] hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-theme-white)] rounded-[2.5rem] shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold text-[var(--color-theme-brown)]">{formData.id ? 'Edit Product' : 'Add Product'}</h2>
              <button
                onClick={handleAutoTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--color-theme-orange)] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-theme-orange)]/20"
              >
                {isTranslating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                AI Auto-Translate
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Name (EN)</label>
                  <input type="text" value={formData.name.en} onChange={e => setFormData({...formData, name: {...formData.name, en: e.target.value}})} className="foodie-input" placeholder="Product Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Name (ZH)</label>
                  <input type="text" value={formData.name.zh} onChange={e => setFormData({...formData, name: {...formData.name, zh: e.target.value}})} className="foodie-input" placeholder="产品名称" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Name (MS)</label>
                  <input type="text" value={formData.name.ms} onChange={e => setFormData({...formData, name: {...formData.name, ms: e.target.value}})} className="foodie-input" placeholder="Nama Produk" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Price (RM)</label>
                  <input type="number" value={isNaN(formData.price) ? '' : formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="foodie-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Weight</label>
                  <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="foodie-input" placeholder="e.g. 150g" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Product Image</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-grow w-full space-y-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--color-theme-brown)]/20 rounded-2xl cursor-pointer hover:bg-white/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Plus className="w-8 h-8 text-[var(--color-theme-brown)]/40 mb-2" />
                        <p className="text-xs font-bold text-[var(--color-theme-brown)]/40 uppercase tracking-widest">Click to upload image</p>
                      </div>
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                    </label>
                    
                    {!formData.image && !isUploading && (
                      <button
                        onClick={handleAiImageGeneration}
                        disabled={isGeneratingImage}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-theme-orange)]/10 text-[var(--color-theme-orange)] rounded-2xl font-bold text-sm hover:bg-[var(--color-theme-orange)]/20 transition-all disabled:opacity-50 border-2 border-[var(--color-theme-orange)]/20 shadow-sm"
                      >
                        {isGeneratingImage ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        Generate Image with AI
                      </button>
                    )}

                    {isUploading && <p className="text-xs text-[var(--color-theme-orange)] font-bold mt-2 animate-pulse">Uploading image...</p>}
                    {isGeneratingImage && <p className="text-xs text-[var(--color-theme-orange)] font-bold mt-2 animate-pulse">AI is generating image...</p>}
                  </div>
                  {formData.image && !isUploading && (
                    <div className="flex flex-col gap-3 shrink-0">
                      <div className="relative group w-32 h-32">
                        <NextImage 
                          src={formData.image} 
                          alt="Preview" 
                          fill 
                          className="object-cover rounded-2xl border-4 border-white shadow-lg" 
                          unoptimized
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold uppercase tracking-widest">Preview</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRemoveImage}
                          className="flex-1 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center shadow-sm"
                          title="Remove Image"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={handleAiImageGeneration}
                          disabled={isGeneratingImage}
                          className="flex-1 p-3 bg-[var(--color-theme-orange)]/10 text-[var(--color-theme-orange)] rounded-xl hover:bg-[var(--color-theme-orange)]/20 transition-colors border border-[var(--color-theme-orange)]/20 flex items-center justify-center shadow-sm"
                          title="Regenerate with AI"
                        >
                          {isGeneratingImage ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-8 p-6 bg-white/50 rounded-2xl border border-[var(--color-theme-brown)]/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.isHalal} onChange={e => setFormData({...formData, isHalal: e.target.checked})} className="w-6 h-6 rounded-lg border-2 border-[var(--color-theme-brown)]/20 text-[var(--color-theme-orange)] focus:ring-[var(--color-theme-orange)]" />
                  <span className="font-bold text-[var(--color-theme-brown)] group-hover:text-[var(--color-theme-orange)] transition-colors">Halal Certified</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--color-theme-brown)]">Status:</span>
                  <select value={formData.stockStatus} onChange={e => setFormData({...formData, stockStatus: e.target.value})} className="foodie-input py-2 text-sm font-bold w-auto min-w-[150px]">
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--color-theme-brown)]">{t.count}:</span>
                  <input type="number" value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: parseInt(e.target.value) || 0})} className="foodie-input py-2 text-sm font-bold w-24 text-center" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--color-theme-brown)]">{t.threshold}:</span>
                  <input type="number" value={formData.reorderThreshold} onChange={e => setFormData({...formData, reorderThreshold: parseInt(e.target.value) || 0})} className="foodie-input py-2 text-sm font-bold w-24 text-center" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Description (EN)</label>
                  <textarea value={formData.description.en} onChange={e => setFormData({...formData, description: {...formData.description, en: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Description (ZH)</label>
                  <textarea value={formData.description.zh} onChange={e => setFormData({...formData, description: {...formData.description, zh: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Description (MS)</label>
                  <textarea value={formData.description.ms} onChange={e => setFormData({...formData, description: {...formData.description, ms: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Ingredients (EN)</label>
                  <textarea value={formData.ingredients.en} onChange={e => setFormData({...formData, ingredients: {...formData.ingredients, en: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Ingredients (ZH)</label>
                  <textarea value={formData.ingredients.zh} onChange={e => setFormData({...formData, ingredients: {...formData.ingredients, zh: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Ingredients (MS)</label>
                  <textarea value={formData.ingredients.ms} onChange={e => setFormData({...formData, ingredients: {...formData.ingredients, ms: e.target.value}})} className="foodie-input h-32 resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-[var(--color-theme-brown)]/5">
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-bold text-[var(--color-theme-brown)]/60 hover:text-[var(--color-theme-brown)] transition-colors">Cancel</button>
                <button onClick={handleSave} className="foodie-button px-10 py-4">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-theme-white)] rounded-[2.5rem] p-10 w-full max-w-md text-center shadow-2xl border border-white/20">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[var(--color-theme-brown)]">Confirm Deletion</h2>
            <p className="mb-10 font-medium text-[var(--color-theme-brown)]/60">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(productToDelete)} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Delete Product</button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-4 font-bold text-[var(--color-theme-brown)]/60 hover:text-[var(--color-theme-brown)] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
