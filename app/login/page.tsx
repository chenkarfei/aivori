'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, Chrome, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

const translations = {
  en: {
    title: 'Welcome Back',
    subtitle: 'Login to your account',
    signupTitle: 'Create Account',
    signupSubtitle: 'Join our foodie community',
    email: 'Email Address',
    password: 'Password',
    login: 'Login',
    signup: 'Sign Up',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    error: 'Authentication failed. Please check your credentials.',
    back: 'Back to Home'
  },
  zh: {
    title: '欢迎回来',
    subtitle: '登录您的账户',
    signupTitle: '创建账户',
    signupSubtitle: '加入我们的美食社区',
    email: '电子邮件地址',
    password: '密码',
    login: '登录',
    signup: '注册',
    google: '使用 Google 继续',
    noAccount: '还没有账户？',
    hasAccount: '已经有账户了？',
    error: '身份验证失败。请检查您的凭据。',
    back: '返回首页'
  },
  ms: {
    title: 'Selamat Kembali',
    subtitle: 'Log masuk ke akaun anda',
    signupTitle: 'Cipta Akaun',
    signupSubtitle: 'Sertai komuniti foodie kami',
    email: 'Alamat Emel',
    password: 'Kata Laluan',
    login: 'Log Masuk',
    signup: 'Daftar',
    google: 'Teruskan dengan Google',
    noAccount: 'Tiada akaun?',
    hasAccount: 'Sudah mempunyai akaun?',
    error: 'Pengesahan gagal. Sila semak kredensial anda.',
    back: 'Kembali ke Laman Utama'
  }
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { language } = useStore();
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        if (err.code === 'auth/account-exists-with-different-credential') {
          setError(language === 'zh' ? '该电子邮件已关联到其他登录方式。' : language === 'ms' ? 'Emel ini telah dikaitkan dengan kaedah log masuk yang lain.' : 'This email is already linked to a different login method.');
        } else {
          console.error("Google Auth Error:", err.code, err.message);
          setError(t.error);
        }
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError(
            language === 'zh' 
              ? '电子邮件或密码错误。如果您之前使用 Google 登录，请先通过“注册”设置密码。' 
              : language === 'ms' 
              ? 'Emel atau kata laluan salah. Jika anda sebelum ini menggunakan Google, sila tetapkan kata laluan melalui "Daftar" terlebih dahulu.' 
              : 'Invalid email or password. If you previously used Google, please set a password via "Sign Up" first.'
          );
          break;
        case 'auth/email-already-in-use':
          setError(language === 'zh' ? '该电子邮件已被使用。' : language === 'ms' ? 'Emel ini telah digunakan.' : 'This email is already in use.');
          break;
        case 'auth/weak-password':
          setError(language === 'zh' ? '密码太弱。请使用至少 6 个字符。' : language === 'ms' ? 'Kata laluan terlalu lemah. Sila gunakan sekurang-kurangnya 6 aksara.' : 'Password is too weak. Please use at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError(language === 'zh' ? '电子邮件格式无效。' : language === 'ms' ? 'Format emel tidak sah.' : 'Invalid email format.');
          break;
        case 'auth/too-many-requests':
          setError(language === 'zh' ? '尝试次数过多。请稍后再试。' : language === 'ms' ? 'Terlalu banyak percubaan. Sila cuba sebentar lagi.' : 'Too many attempts. Please try again later.');
          break;
        default:
          console.error("Auth Error:", err.code, err.message);
          setError(t.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-theme-white)]">
      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] transition-colors font-bold group"
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform text-[var(--color-theme-green)]" />
        {t.back}
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="foodie-card p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[var(--color-theme-brown)] mb-2">
              {isLogin ? t.title : t.signupTitle}
            </h1>
            <p className="text-[var(--color-theme-brown)]/60 font-medium">
              {isLogin ? t.subtitle : t.signupSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="foodie-input !pl-12" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-green)]" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="foodie-input !pl-12" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full foodie-button py-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isLogin ? <LogIn size={20} /> : <UserPlus size={20} />
              )}
              {isLogin ? t.login : t.signup}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-theme-brown)]/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-[var(--color-theme-brown)]/40">Or</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 px-6 bg-white border-2 border-[var(--color-theme-brown)]/10 rounded-2xl font-bold text-[var(--color-theme-brown)] hover:border-[var(--color-theme-orange)] hover:text-[var(--color-theme-orange)] transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Chrome size={20} className="text-[var(--color-theme-green)]" />
            {t.google}
          </button>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-[var(--color-theme-brown)]/60 hover:text-[var(--color-theme-orange)] transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount} <span className="text-[var(--color-theme-orange)]">{isLogin ? t.signup : t.login}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
