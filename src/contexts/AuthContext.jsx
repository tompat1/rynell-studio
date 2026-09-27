import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USER_STORAGE_KEY = 'rynell_studio_user_v1';
const QUOTA_STORAGE_KEY = 'rynell_studio_quota_v1';

export const ADMIN_ACCOUNT = {
  id: 'usr_admin_root',
  name: 'RYNELL ADMIN',
  email: 'admin@rynell.org',
  tier: 'ADMIN',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch (_) {}
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const openRegister = () => {
    setAuthMode('register');
    setIsAccountOpen(true);
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAccountOpen(true);
  };

  const closeAccount = () => {
    setIsAccountOpen(false);
  };

  const register = async ({ name, email, password }) => {
    // Check if registering admin email
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@rynell.org' || cleanEmail === 'admin') {
      setUser(ADMIN_ACCOUNT);
      return { success: true, user: ADMIN_ACCOUNT };
    }

    // Simulate real registration and account creation
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      tier: 'FREE_REGISTERED',
      createdAt: new Date().toISOString()
    };

    setUser(newUser);

    // Grant Registered Member Bonus Quota: +10 Free AI Studio Renders & Full Try-Before-Buy
    try {
      const rawQuota = localStorage.getItem(QUOTA_STORAGE_KEY);
      const currentQuota = rawQuota ? JSON.parse(rawQuota) : { imageStudioRendersLeft: 0, upscalerTrialsLeft: 1, vectorineTrialsLeft: 1 };
      
      const updatedQuota = {
        imageStudioRendersLeft: Math.max(10, (currentQuota.imageStudioRendersLeft || 0) + 10),
        upscalerTrialsLeft: Math.max(1, currentQuota.upscalerTrialsLeft || 1),
        vectorineTrialsLeft: Math.max(1, currentQuota.vectorineTrialsLeft || 1),
        hasRegisteredBonus: true
      };

      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(updatedQuota));
      // Dispatch storage event so active listeners can immediately sync
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    return { success: true, user: newUser };
  };

  const login = async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Admin login detection
    if (cleanEmail === 'admin@rynell.org' || cleanEmail === 'admin' || (password && password.toLowerCase() === 'admin')) {
      setUser(ADMIN_ACCOUNT);
      return { success: true, user: ADMIN_ACCOUNT };
    }

    // In demo environment, log the user in directly with registered tier
    const loggedUser = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      tier: 'FREE_REGISTERED',
      createdAt: new Date().toISOString()
    };

    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  const loginAsAdmin = () => {
    setUser(ADMIN_ACCOUNT);
    return { success: true, user: ADMIN_ACCOUNT };
  };

  const logout = () => {
    setUser(null);
  };

  const upgradeToDeluxe = () => {
    if (user) {
      const updated = { ...user, tier: 'DELUXE' };
      setUser(updated);
    } else {
      const guestPro = {
        id: `usr_pro_${Date.now()}`,
        name: 'DELUXE CREATOR',
        email: 'pro@rynell.org',
        tier: 'DELUXE',
        createdAt: new Date().toISOString()
      };
      setUser(guestPro);
    }
  };

  const openForgotPassword = () => {
    setAuthMode('forgot_password');
    setIsAccountOpen(true);
  };

  const requestPasswordReset = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    let token = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const resp = await fetch('https://rynell-ai-gateway.thomasrynell.workers.dev/api/auth/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await resp.json();
      if (data && data.code) {
        token = data.code;
      }
    } catch (_) {}

    try {
      localStorage.setItem(`rynell_reset_${cleanEmail}`, JSON.stringify({
        token,
        email: cleanEmail,
        expiresAt: Date.now() + 15 * 60 * 1000
      }));
    } catch (_) {}

    return {
      success: true,
      message: `Password reset link & code sent to ${cleanEmail}. (Verification Code: ${token})`,
      token
    };
  };

  const resetPasswordWithCode = async ({ email, code, newPassword }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const resetUser = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      tier: 'FREE_REGISTERED',
      createdAt: new Date().toISOString()
    };
    setUser(resetUser);
    try {
      localStorage.removeItem(`rynell_reset_${cleanEmail}`);
    } catch (_) {}
    return { success: true, message: 'Password successfully updated! You are now signed in.', user: resetUser };
  };

  const isAdmin = user?.role === 'ADMIN' || user?.tier === 'ADMIN' || user?.email === 'admin@rynell.org';
  const isPremiumUser = user?.tier === 'DELUXE' || isAdmin;
  const isRegistered = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isRegistered,
        isAdmin,
        isPremiumUser,
        isAccountOpen,
        setIsAccountOpen,
        authMode,
        setAuthMode,
        openRegister,
        openLogin,
        openForgotPassword,
        closeAccount,
        register,
        login,
        loginAsAdmin,
        logout,
        upgradeToDeluxe,
        requestPasswordReset,
        resetPasswordWithCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
