import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccountDrawer = ({ isOpen, setIsOpen }) => {
  const { 
    user, 
    isRegistered, 
    isAdmin,
    isPremiumUser, 
    authMode, 
    setAuthMode, 
    login, 
    loginAsAdmin,
    register, 
    logout,
    openForgotPassword,
    requestPasswordReset,
    resetPasswordWithCode
  } = useAuth();

  const [isLogin, setIsLogin] = useState(authMode === 'login' || !authMode);
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS
  const [formData, setFormData] = useState({ name: '', email: '', password: '', resetCode: '', newPassword: '' });
  const [resetMessage, setResetMessage] = useState(null);
  const [sentCode, setSentCode] = useState(null);

  useEffect(() => {
    if (authMode === 'login') setIsLogin(true);
    if (authMode === 'register') setIsLogin(false);
  }, [authMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      setStatus('IDLE');
      setResetMessage(null);
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('PROCESSING');
    
    setTimeout(async () => {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({ name: formData.name, email: formData.email, password: formData.password });
      }
      setStatus('SUCCESS');
    }, 1000);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setStatus('PROCESSING');
    const res = await requestPasswordReset(formData.email);
    setStatus('IDLE');
    if (res.success) {
      setResetMessage(res.message);
      if (res.token) {
        setSentCode(res.token);
        setFormData(prev => ({ ...prev, resetCode: res.token }));
      }
      setAuthMode('reset_password');
    } else {
      setResetMessage(res.message);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setStatus('PROCESSING');
    setTimeout(async () => {
      const res = await resetPasswordWithCode({
        email: formData.email,
        code: formData.resetCode || sentCode,
        newPassword: formData.newPassword
      });
      if (res.success) {
        setStatus('SUCCESS');
      } else {
        setStatus('IDLE');
        setResetMessage(res.message || 'Error updating password.');
      }
    }, 1000);
  };

  const handleCloseAndGoToStudio = () => {
    setIsOpen(false);
    const studioEl = document.getElementById('studio-lab');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getHeaderTitle = () => {
    if (isRegistered) return 'STUDIO ACCOUNT';
    if (authMode === 'forgot_password') return 'RECOVER PASSWORD';
    if (authMode === 'reset_password') return 'NEW PASSWORD';
    return isLogin ? 'LOGIN' : 'CREATE ACCOUNT';
  };

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`cart-drawer account-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{getHeaderTitle()}</h2>
          <button className="cart-close" onClick={() => setIsOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="drawer-body-scrollable">
          {/* STATE 1: ALREADY LOGGED IN */}
          {isRegistered && status !== 'PROCESSING' && (
            <div className="account-profile-view">
              <div className="profile-badge-row">
                <span className={`status-pill ${isAdmin ? 'admin' : (isPremiumUser ? 'deluxe' : 'member')}`}>
                  {isAdmin 
                    ? '👑 ROOT ADMIN (UNLIMITED RENDERS)' 
                    : (isPremiumUser ? '💎 DELUXE PRO MEMBER' : '✨ REGISTERED MEMBER')}
                </span>
              </div>

              <div className="profile-info-box">
                <div className="profile-avatar" style={isAdmin ? { background: '#ff3366' } : {}}>
                  {isAdmin ? '👑' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="profile-details">
                  <h3 className="profile-name">{user.name || 'STUDIO USER'}</h3>
                  <span className="profile-email">{user.email}</span>
                </div>
              </div>

              <div className="account-benefits-list">
                <h4>ACTIVE MEMBERSHIP BENEFITS:</h4>
                <ul>
                  {isAdmin ? (
                    <>
                      <li className="admin-highlight">✔ Unlimited Cloudflare AI Studio Generations (Zero Quota Cap)</li>
                      <li className="admin-highlight">✔ Unlimited 4K Upscaler (Dual Pruna AI & Real-ESRGAN)</li>
                      <li className="admin-highlight">✔ Unlimited Vectorine GPU Raster-to-SVG Tracing</li>
                      <li className="admin-highlight">✔ Edge Diagnostic Tools & Direct R2 Storage Access</li>
                      <li className="admin-highlight">✔ Paywall & Trial Bypass Active</li>
                    </>
                  ) : (
                    <>
                      <li>✔ +10 Free AI Image Studio Renders Unlocked</li>
                      <li>✔ 4K Upscaler (Pruna AI / Real-ESRGAN) Try-Before-Buy Access</li>
                      <li>✔ Vectorine (Raster to SVG) Try-Before-Buy Access</li>
                      <li>✔ Saved Visual Output Workspace</li>
                      {isPremiumUser && <li className="pro-highlight">✔ Unlimited 4K Super-Resolution & SVG Exports</li>}
                    </>
                  )}
                </ul>
              </div>

              <div className="account-actions-group">
                <button 
                  className="checkout-btn" 
                  onClick={handleCloseAndGoToStudio}
                >
                  GO TO AI LAB WORKBENCH →
                </button>

                <button 
                  className="signout-btn" 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  SIGN OUT
                </button>
              </div>
            </div>
          )}

          {/* STATE 2A: FORGOT PASSWORD VIEW */}
          {!isRegistered && status === 'IDLE' && authMode === 'forgot_password' && (
            <div className="password-recovery-view">
              <div className="register-reward-banner" style={{ borderColor: '#00E5FF', background: 'rgba(0, 229, 255, 0.08)' }}>
                <span className="reward-icon">🔑</span>
                <div className="reward-text">
                  <strong style={{ color: '#00E5FF' }}>LOST PASSWORD RECOVERY</strong>
                  <p>Enter your account email below to generate a secure reset token & code.</p>
                </div>
              </div>

              {resetMessage && (
                <div className="reset-notice-box error">
                  {resetMessage}
                </div>
              )}

              <form className="brutalist-form" onSubmit={handleRequestReset}>
                <div className="form-group">
                  <label>REGISTERED EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    placeholder="YOUR@EMAIL.COM" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '1rem', background: '#00E5FF', color: '#000' }}>
                  SEND RESET LINK & CODE →
                </button>
              </form>

              <div className="auth-toggle">
                <p>
                  Remembered your password?
                  <button 
                    type="button" 
                    className="text-btn" 
                    onClick={() => {
                      setIsLogin(true);
                      setAuthMode('login');
                    }}
                  >
                    LOG IN
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STATE 2B: RESET PASSWORD WITH CODE VIEW */}
          {!isRegistered && status === 'IDLE' && authMode === 'reset_password' && (
            <div className="password-reset-view">
              {resetMessage && (
                <div className="reset-notice-box success">
                  {resetMessage}
                </div>
              )}

              <form className="brutalist-form" onSubmit={handleConfirmReset}>
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    placeholder="YOUR@EMAIL.COM" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>6-DIGIT VERIFICATION CODE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 583920" 
                    value={formData.resetCode}
                    onChange={(e) => setFormData({ ...formData, resetCode: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>NEW PASSWORD</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required 
                  />
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '1rem' }}>
                  UPDATE PASSWORD & SIGN IN →
                </button>
              </form>

              <div className="auth-toggle">
                <p>
                  Back to login?
                  <button 
                    type="button" 
                    className="text-btn" 
                    onClick={() => {
                      setIsLogin(true);
                      setAuthMode('login');
                    }}
                  >
                    LOG IN
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STATE 2C: STANDARD LOGIN / REGISTER FORM */}
          {!isRegistered && status === 'IDLE' && authMode !== 'forgot_password' && authMode !== 'reset_password' && (
            <>
              {!isLogin && (
                <div className="register-reward-banner">
                  <span className="reward-icon">🎁</span>
                  <div className="reward-text">
                    <strong>UNPACK +10 FREE RENDERS</strong>
                    <p>Create a free account to continue in AI Image Studio and test the 4K Upscaler & Vectorine.</p>
                  </div>
                </div>
              )}

              <form className="brutalist-form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label>FULL NAME</label>
                    <input 
                      type="text" 
                      placeholder="YOUR NAME" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required 
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    placeholder="YOUR@EMAIL.COM" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>PASSWORD</label>
                    {isLogin && (
                      <button 
                        type="button"
                        className="forgot-password-link"
                        onClick={() => setAuthMode('forgot_password')}
                      >
                        FORGOT PASSWORD?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required 
                  />
                </div>

                <button type="submit" className="checkout-btn" style={{ marginTop: '1.5rem' }}>
                  {isLogin ? 'SIGN IN' : 'REGISTER & UNLOCK +10 RENDERS'}
                </button>
              </form>

              {/* Developer & Admin Quick Login Button */}
              <div className="admin-shortcut-box">
                <div className="admin-shortcut-header">
                  <span className="admin-key-icon">⚡</span>
                  <span>ADMINISTRATOR ACCESS</span>
                </div>
                <button 
                  type="button" 
                  className="admin-quick-btn"
                  onClick={() => {
                    loginAsAdmin();
                    setStatus('SUCCESS');
                  }}
                >
                  👑 INSTANT LOGIN AS ROOT ADMIN (UNLIMITED)
                </button>
                <span className="admin-hint">
                  Or enter <code>admin@rynell.org</code> (password: <code>admin</code>)
                </span>
              </div>

              <div className="auth-toggle">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button" 
                    className="text-btn" 
                    onClick={() => {
                      const nextMode = !isLogin;
                      setIsLogin(nextMode);
                      setAuthMode(nextMode ? 'login' : 'register');
                    }}
                  >
                    {isLogin ? 'CREATE ONE' : 'LOG IN'}
                  </button>
                </p>
              </div>
            </>
          )}

          {/* STATE 3: PROCESSING */}
          {status === 'PROCESSING' && (
            <div className="processing-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
              <div className="spinner"></div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>
                {isLogin ? 'AUTHENTICATING...' : 'CREATING ACCOUNT & ALLOCATING RENDERS...'}
              </h3>
            </div>
          )}

          {/* STATE 4: SUCCESS */}
          {status === 'SUCCESS' && (
            <div className="success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text-primary)' }}>
                {isLogin ? 'WELCOME BACK' : '+10 RENDERS UNLOCKED!'}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                {isLogin 
                  ? 'Your account session is active. Renders and workbenches are available.' 
                  : 'Account created successfully. Your AI Image Studio quota has been increased by 10 renders, and 4K Upscaler & Vectorine trials are ready.'}
              </p>
              <button className="checkout-btn" onClick={handleCloseAndGoToStudio}>
                OPEN AI LAB WORKBENCH →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .drawer-body-scrollable {
          padding: 2rem;
          height: calc(100vh - 150px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .register-reward-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 106, 0, 0.1);
          border: 2px solid var(--primary-orange);
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .reward-icon {
          font-size: 1.8rem;
          flex-shrink: 0;
        }

        .reward-text strong {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: var(--primary-orange);
          letter-spacing: 0.5px;
          display: block;
        }

        .reward-text p {
          margin: 0.2rem 0 0 0;
          font-size: 0.8rem;
          color: #aaa;
          line-height: 1.35;
        }

        .brutalist-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--text-light);
          letter-spacing: 1px;
        }

        .form-group input {
          background: #111118;
          border: 2px solid var(--border-color);
          padding: 0.85rem 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-light);
          outline: none;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          border-color: var(--primary-orange);
          box-shadow: 0 0 10px rgba(255, 106, 0, 0.2);
        }

        .auth-toggle {
          margin-top: 2rem;
          text-align: center;
          font-family: var(--font-body);
          color: var(--text-secondary);
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--primary-orange);
          font-family: var(--font-heading);
          font-size: 1.1rem;
          cursor: pointer;
          margin-left: 0.6rem;
          text-decoration: underline;
        }

        .text-btn:hover {
          color: var(--text-light);
        }

        /* Profile View Styles */
        .account-profile-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .status-pill {
          display: inline-block;
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          letter-spacing: 1px;
        }

        .status-pill.member {
          background: rgba(0, 255, 102, 0.12);
          color: #00FF66;
          border: 1px solid #00FF66;
        }

        .status-pill.deluxe {
          background: rgba(0, 229, 255, 0.12);
          color: #00E5FF;
          border: 1px solid #00E5FF;
        }

        .status-pill.admin {
          background: rgba(255, 51, 102, 0.18);
          color: #ff3366;
          border: 1px solid #ff3366;
          box-shadow: 0 0 10px rgba(255, 51, 102, 0.25);
        }

        .account-benefits-list li.admin-highlight {
          color: #ff3366;
          font-weight: 600;
        }

        .admin-shortcut-box {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(255, 51, 102, 0.06);
          border: 1px dashed rgba(255, 51, 102, 0.4);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .admin-shortcut-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          color: #ff3366;
          letter-spacing: 1px;
        }

        .admin-quick-btn {
          background: #ff3366;
          color: #fff;
          border: none;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .admin-quick-btn:hover {
          background: #ff1a53;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 51, 102, 0.4);
        }

        .admin-hint {
          font-family: monospace;
          font-size: 0.75rem;
          color: #888;
          text-align: center;
        }

        .admin-hint code {
          color: #ff3366;
          background: rgba(255, 51, 102, 0.1);
          padding: 0.1rem 0.3rem;
        }

        .profile-info-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: #0e0e16;
          border: 2px solid #222230;
          padding: 1.25rem;
        }

        .profile-avatar {
          width: 52px;
          height: 52px;
          background: var(--primary-orange);
          color: #fff;
          font-family: var(--font-heading);
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .profile-name {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: #fff;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .profile-email {
          font-family: monospace;
          font-size: 0.8rem;
          color: #888;
        }

        .account-benefits-list {
          background: #11111a;
          border: 2px solid #1f1f2e;
          padding: 1.25rem;
        }

        .account-benefits-list h4 {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--primary-orange);
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
        }

        .account-benefits-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .account-benefits-list li {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #ccc;
          line-height: 1.4;
        }

        .account-benefits-list li.pro-highlight {
          color: #00E5FF;
          font-weight: 600;
        }

        .account-actions-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: var(--primary-orange);
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          transition: color 0.2s ease;
        }

        .forgot-password-link:hover {
          color: #00E5FF;
        }

        .reset-notice-box {
          padding: 0.85rem 1rem;
          margin-bottom: 1.25rem;
          font-family: monospace;
          font-size: 0.85rem;
          line-height: 1.4;
          border-left: 3px solid var(--primary-orange);
        }

        .reset-notice-box.success {
          background: rgba(0, 229, 255, 0.1);
          border-color: #00E5FF;
          color: #00E5FF;
        }

        .reset-notice-box.error {
          background: rgba(255, 51, 102, 0.1);
          border-color: #ff3366;
          color: #ff3366;
        }

        .signout-btn {
          background: transparent;
          border: 2px solid #333344;
          color: #888;
          font-family: var(--font-heading);
          font-size: 1rem;
          padding: 0.85rem;
          cursor: pointer;
          letter-spacing: 1px;
          transition: all 0.2s ease;
        }

        .signout-btn:hover {
          border-color: #ff4d6d;
          color: #ff4d6d;
        }
      `}</style>
    </>
  );
};

export default AccountDrawer;
