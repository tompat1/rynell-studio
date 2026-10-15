import { useState, useEffect, useRef } from 'react';
import { useCms } from '../contexts/CmsContext';
import { useAuth } from '../contexts/AuthContext';

const AdminCmsDrawer = () => {
  const {
    content,
    updateField,
    updateNavItems,
    addNavItem,
    removeNavItem,
    toggleNavItemVisibility,
    reorderNavItem,
    resetSection,
    resetAll,
    exportJSON,
    importJSON,
    isCmsOpen,
    closeCms,
    activeTab,
    setActiveTab,
    isLiveEditMode,
    toggleLiveEdit,
    isCmsAdmin,
    unlockAdminWithPin,
    saveToast,
    cloudflareSyncStatus,
    lastSyncedAt,
    edgeSource,
    publishToCloudflare,
    pullFromCloudflare,
    uploadAssetToCloudflare
  } = useCms();

  const { loginAsAdmin } = useAuth();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [newNavName, setNewNavName] = useState('');
  const [newNavLink, setNewNavLink] = useState('');
  const fileInputRef = useRef(null);
  const r2UploadInputRef = useRef(null);
  const [uploadedR2Url, setUploadedR2Url] = useState('');
  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const [copiedR2Url, setCopiedR2Url] = useState(false);

  const handleR2Upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingR2(true);
      const res = await uploadAssetToCloudflare(file);
      if (res && res.url) {
        setUploadedR2Url(res.url);
      }
    } catch {
      // toast shown in context
    } finally {
      setIsUploadingR2(false);
      e.target.value = '';
    }
  };

  // Manage drawer-open class on body
  useEffect(() => {
    if (isCmsOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isCmsOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCmsOpen) {
        closeCms();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmsOpen, closeCms]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const success = unlockAdminWithPin(pinInput);
    if (!success) {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    } else {
      setPinInput('');
    }
  };

  const renderAuthGate = () => (
    <div className="cms-auth-gate">
      <div className="gate-icon">🔒</div>
      <h3 className="gate-title">RESTRICTED TO ADMINS</h3>
      <p className="gate-desc">
        Sign in with Root Admin credentials or enter the studio admin passkey to unlock top-nav menu editing and page copy management.
      </p>
      
      <form onSubmit={handlePinSubmit} className="gate-form">
        <input
          type="password"
          placeholder="ENTER ADMIN PIN (e.g. admin2026)"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className={`gate-input ${pinError ? 'error' : ''}`}
        />
        <button type="submit" className="gate-btn unlock-btn">
          UNLOCK ADMIN CMS
        </button>
      </form>

      <div className="gate-divider"><span>OR</span></div>

      <button 
        type="button" 
        className="gate-btn quick-root-btn"
        onClick={() => {
          loginAsAdmin();
          unlockAdminWithPin('admin');
        }}
      >
        👑 INSTANT 1-CLICK ROOT LOGIN
      </button>
    </div>
  );

  const handleAddNav = (e) => {
    e.preventDefault();
    if (!newNavName.trim()) return;
    addNavItem(newNavName, newNavLink || '#');
    setNewNavName('');
    setNewNavLink('');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        importJSON(result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = [
    { id: 'nav', label: `🧭 TOP NAV (${content.navItems?.length || 0})` },
    { id: 'cloudflare', label: '☁️ CLOUDFLARE EDGE & R2' },
    { id: 'hero', label: '⚡ HERO & INTRO' },
    { id: 'about', label: '📜 ABOUT & MANIFESTO' },
    { id: 'services', label: '💼 SERVICES' },
    { id: 'studioTools', label: '🛠️ STUDIO TOOLS' },
    { id: 'collections', label: '🎨 COLLECTIONS' },
    { id: 'shop', label: '🛍️ SHOP & DROPS' },
    { id: 'ads', label: '📺 CAMPAIGNS & ADS' },
    { id: 'journal', label: '📰 JOURNAL' },
    { id: 'footer', label: '⚓ FOOTER & BRAND' }
  ];

  return (
    <>
      <div 
        className={`drawer-backdrop ${isCmsOpen ? 'open' : ''}`}
        onClick={closeCms}
      />

      <div className={`cart-drawer cms-admin-drawer ${isCmsOpen ? 'open' : ''}`}>
        
        {/* Drawer Header */}
        <div className="cart-header cms-drawer-header">
          <div className="cms-title-lockup">
            <div className="cms-badge-row">
              <span className="cms-crown-badge">👑 ROOT ADMIN</span>
              <span className="cms-version-tag">LIGHTWEIGHT CMS V2</span>
            </div>
            <h2 className="cms-headline">STUDIO CONTENT MANAGER</h2>
          </div>
          <button className="cart-close" onClick={closeCms} aria-label="Close CMS">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Notification Toast */}
        {saveToast && (
          <div className="cms-live-toast">
            <span>⚡ {saveToast}</span>
          </div>
        )}

        <div className="drawer-body-scrollable cms-scrollable-body">

          {/* ADMIN GATE OR EDITING PANELS */}
          {isCmsAdmin ? (
            <>
              {/* Top Controls Toolbar */}
              <div className="cms-toolbar-card">
                <div className="toolbar-top-row">
                  <button 
                    type="button" 
                    className={`cms-pill-action live-edit-btn ${isLiveEditMode ? 'active' : ''}`}
                    onClick={toggleLiveEdit}
                    title="Click any text on the page to jump to its editor"
                  >
                    {isLiveEditMode ? '✏️ LIVE EDIT MODE: ON' : '✏️ LIVE EDIT MODE: OFF'}
                  </button>

                  <div className="json-actions-group">
                    <button 
                      type="button" 
                      className={`cms-pill-action cf-sync-pill ${cloudflareSyncStatus === 'synced' ? 'synced' : ''}`}
                      onClick={publishToCloudflare}
                      title="Save and synchronize CMS content to Cloudflare Edge (KV & R2)"
                      disabled={cloudflareSyncStatus === 'syncing'}
                    >
                      ☁️ {cloudflareSyncStatus === 'syncing' ? 'SYNCING...' : 'PUBLISH TO CLOUDFLARE'}
                    </button>
                    <button 
                      type="button" 
                      className="cms-pill-action"
                      onClick={exportJSON}
                      title="Export entire content configuration as JSON"
                    >
                      📥 EXPORT JSON
                    </button>
                    <button 
                      type="button" 
                      className="cms-pill-action"
                      onClick={() => fileInputRef.current?.click()}
                      title="Import content configuration from JSON"
                    >
                      📤 IMPORT JSON
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept=".json"
                      onChange={handleImportFile}
                    />
                    <button 
                      type="button" 
                      className="cms-pill-action danger"
                      onClick={resetAll}
                      title="Reset all content to original defaults"
                    >
                      🔄 RESET ALL
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="cms-search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search copy across all sections..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="cms-search-input"
                  />
                  {filterQuery && (
                    <button 
                      type="button" 
                      className="clear-search-btn"
                      onClick={() => setFilterQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="cms-tabs-scroller">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`cms-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setFilterQuery('');
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: TOP NAVIGATION MANAGER */}
              {activeTab === 'nav' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <div className="panel-badge-pill">DYNAMIC HEADER MENU</div>
                      <h3 className="panel-title">TOP NAVIGATION MENU MANAGER</h3>
                      <p className="panel-desc">
                        Add, remove, rename, and reorder links displayed in the desktop top-nav and mobile drawer menu.
                      </p>
                    </div>
                    <div className="panel-header-right-actions">
                      <span className="nav-items-count-badge">
                        {content.navItems?.filter(i => i.visible !== false).length || 0} ACTIVE / {content.navItems?.length || 0} TOTAL
                      </span>
                      <button 
                        type="button" 
                        className="cms-reset-btn"
                        onClick={() => {
                          if (window.confirm('Reset top navigation menu to factory defaults?')) {
                            resetSection('navItems');
                          }
                        }}
                        title="Restore original factory menu items"
                      >
                        RESTORE DEFAULTS
                      </button>
                    </div>
                  </div>

                  {/* Add New Item Card */}
                  <div className="add-nav-card">
                    <div className="add-nav-header">
                      <span className="add-nav-title">➕ ADD NEW TOP-MENU ITEM</span>
                      <span className="add-nav-subtitle">Type custom title & link or pick a preset</span>
                    </div>

                    <form onSubmit={handleAddNav} className="add-nav-form">
                      <div className="form-row-grid">
                        <div className="form-field-group">
                          <label className="cms-mini-label">MENU ITEM LABEL</label>
                          <input
                            type="text"
                            placeholder="e.g. SERVICES or DROPS"
                            value={newNavName}
                            onChange={(e) => setNewNavName(e.target.value)}
                            className="cms-input"
                            required
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="cms-mini-label">LINK / ANCHOR TARGET</label>
                          <input
                            type="text"
                            placeholder="e.g. #services, #shop, or https://..."
                            value={newNavLink}
                            onChange={(e) => setNewNavLink(e.target.value)}
                            className="cms-input"
                            required
                          />
                        </div>

                        <div className="form-field-group btn-col">
                          <label className="cms-mini-label">&nbsp;</label>
                          <button type="submit" className="add-nav-submit-btn">
                            ➕ ADD TO MENU
                          </button>
                        </div>
                      </div>

                      {/* Preset Selector Dropdown */}
                      <div className="preset-selector-row">
                        <span className="suggest-lbl">AUTOFILL PRESET:</span>
                        <select 
                          className="cms-select-preset"
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const [name, link] = e.target.value.split('||');
                            setNewNavName(name);
                            setNewNavLink(link);
                            e.target.value = '';
                          }}
                        >
                          <option value="" disabled>Choose a studio section to autofill...</option>
                          <option value="AI LABS||#studio-lab">⚡ AI Creative Suite (#studio-lab)</option>
                          <option value="CONVERTERS||#converter-tools">📐 Vector & Raster Transcoder (#converter-tools)</option>
                          <option value="OPTIMIZER||#image-compressor">🗜️ Asset Compressor & Scrubber (#image-compressor)</option>
                          <option value="GIF MAKER||#gif-maker">🎞️ Animated GIF Studio (#gif-maker)</option>
                          <option value="JSON LAB||#json-lab">📊 JSON Transformer & CSV (#json-lab)</option>
                          <option value="SERVICES||#services">💼 Studio Services & Rates (#services)</option>
                          <option value="COLLECTIONS||#collections">🎨 Lookbooks & Collections (#collections)</option>
                          <option value="SHOP||#shop">🛍️ Limited Drops & Merch (#shop)</option>
                          <option value="ADS||#ads">📺 Commercial Campaigns (#ads)</option>
                          <option value="ABOUT||#about">📜 Manifesto & Studio Story (#about)</option>
                          <option value="JOURNAL||#journal">📰 Articles & Dispatches (#journal)</option>
                          <option value="CONTACT||#contact">✉️ Contact Drawer (#contact)</option>
                        </select>
                      </div>

                      {/* 1-Click Quick Add Chips */}
                      <div className="quick-suggestions-row">
                        <span className="suggest-lbl">QUICK 1-CLICK ADD:</span>
                        {[
                          { name: 'AI LABS', link: '#studio-lab' },
                          { name: 'CONVERTERS', link: '#converter-tools' },
                          { name: 'OPTIMIZER', link: '#image-compressor' },
                          { name: 'GIF MAKER', link: '#gif-maker' },
                          { name: 'JSON LAB', link: '#json-lab' },
                          { name: 'SERVICES', link: '#services' },
                          { name: 'COLLECTIONS', link: '#collections' },
                          { name: 'SHOP', link: '#shop' },
                          { name: 'ADS', link: '#ads' },
                          { name: 'ABOUT', link: '#about' },
                          { name: 'JOURNAL', link: '#journal' }
                        ].map((s) => {
                          const isAlreadyAdded = content.navItems?.some(item => item.name === s.name || item.link === s.link);
                          return (
                            <button
                              key={s.name}
                              type="button"
                              className={`suggest-pill ${isAlreadyAdded ? 'already-added' : ''}`}
                              title={isAlreadyAdded ? `${s.name} is already in the menu (click to add another)` : `Add ${s.name} directly to top menu`}
                              onClick={() => {
                                addNavItem(s.name, s.link);
                              }}
                            >
                              + {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </form>
                  </div>

                  {/* Nav Items List Header */}
                  <div className="nav-items-section-header">
                    <span className="section-sub-title">CURRENT TOP-MENU ITEMS ({content.navItems?.length || 0})</span>
                    <span className="section-sub-hint">Reorder with arrows, rename label/target, toggle visibility, or delete</span>
                  </div>

                  {/* Empty State */}
                  {(!content.navItems || content.navItems.length === 0) ? (
                    <div className="nav-empty-state">
                      <p className="empty-title">NO MENU ITEMS FOUND</p>
                      <p className="empty-desc">Your top navigation menu is currently empty.</p>
                      <button 
                        type="button"
                        className="restore-defaults-cta"
                        onClick={() => resetSection('navItems')}
                      >
                        RESTORE FACTORY DEFAULT MENU ITEMS
                      </button>
                    </div>
                  ) : (
                    <div className="nav-items-list">
                      {content.navItems.map((item, index) => (
                        <div key={item.id || item.name} className={`nav-item-card ${item.visible ? '' : 'hidden-item'}`}>
                          {/* Order index & arrows */}
                          <div className="item-order-controls">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => reorderNavItem(index, 'up')}
                              className="order-btn"
                              title="Move Up in Navbar"
                            >
                              ▲
                            </button>
                            <span className="order-idx">#{index + 1}</span>
                            <button
                              type="button"
                              disabled={index === content.navItems.length - 1}
                              onClick={() => reorderNavItem(index, 'down')}
                              className="order-btn"
                              title="Move Down in Navbar"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Editable fields */}
                          <div className="item-fields-wrap">
                            <div className="field-block">
                              <span className="input-hint-label">LABEL:</span>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const updated = [...content.navItems];
                                  updated[index] = { ...item, name: e.target.value.toUpperCase() };
                                  updateNavItems(updated);
                                }}
                                className="cms-input item-name-input"
                                placeholder="BUTTON LABEL"
                                title="Menu Item Display Name"
                              />
                            </div>

                            <div className="field-block">
                              <span className="input-hint-label">TARGET ANCHOR / URL:</span>
                              <input
                                type="text"
                                value={item.link}
                                onChange={(e) => {
                                  const updated = [...content.navItems];
                                  updated[index] = { ...item, link: e.target.value };
                                  updateNavItems(updated);
                                }}
                                className="cms-input item-link-input"
                                placeholder="#section or URL"
                                title="Link target (anchor or URL)"
                              />
                            </div>
                          </div>

                          {/* Visibility and Remove Actions */}
                          <div className="item-actions">
                            <button
                              type="button"
                              onClick={() => toggleNavItemVisibility(item.id)}
                              className={`visibility-btn ${item.visible ? 'visible' : 'hidden'}`}
                              title={item.visible ? 'Visible on top menu (Click to Hide)' : 'Hidden from top menu (Click to Show)'}
                            >
                              {item.visible ? '👁️ SHOW' : '🚫 HIDE'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove "${item.name}" from the top menu?`)) {
                                  removeNavItem(item.id || item.name);
                                }
                              }}
                              className="delete-nav-item-btn"
                              title={`Remove ${item.name} from top menu`}
                            >
                              🗑️ REMOVE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1.5: CLOUDFLARE EDGE & R2 OBJECT STORAGE */}
              {activeTab === 'cloudflare' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <div className="panel-badge-pill">GLOBAL EDGE INFRASTRUCTURE</div>
                      <h3 className="panel-title">CLOUDFLARE EDGE & R2 STORAGE</h3>
                      <p className="panel-desc">
                        Distribute CMS content to 300+ edge locations with Cloudflare KV and store assets in Cloudflare R2.
                      </p>
                    </div>
                    <div className="panel-header-right-actions">
                      <span className={`cf-status-pill-badge ${cloudflareSyncStatus}`}>
                        {cloudflareSyncStatus === 'synced' && '● EDGE SYNCED'}
                        {cloudflareSyncStatus === 'syncing' && '◌ SYNCING...'}
                        {cloudflareSyncStatus === 'error' && '✕ SYNC FAILED'}
                        {cloudflareSyncStatus === 'idle' && '○ LOCAL ONLY'}
                      </span>
                      <button 
                        type="button" 
                        className="cms-pill-action cf-sync-pill"
                        onClick={publishToCloudflare}
                        disabled={cloudflareSyncStatus === 'syncing'}
                        title="Upload all CMS state to Cloudflare KV and create a backup in R2"
                      >
                        ☁️ {cloudflareSyncStatus === 'syncing' ? 'SYNCING...' : 'PUBLISH TO CLOUDFLARE'}
                      </button>
                      <button 
                        type="button" 
                        className="cms-reset-btn"
                        onClick={pullFromCloudflare}
                        title="Download latest published version from Cloudflare Edge"
                      >
                        📥 PULL FROM EDGE
                      </button>
                    </div>
                  </div>

                  {/* Cloudflare Connection Card */}
                  <div className="cf-edge-card">
                    <div className="cf-card-title-row">
                      <span className="cf-card-title">🌐 ACTIVE CLOUDFLARE EDGE STATUS</span>
                      <span className="cf-data-source-pill">SOURCE: {edgeSource.toUpperCase()}</span>
                    </div>

                    <div className="cf-specs-grid">
                      <div className="cf-spec-box">
                        <span className="spec-label">EDGE WORKER ENDPOINT</span>
                        <span className="spec-value mono">https://rynell-ai-gateway.thomasrynell.workers.dev</span>
                      </div>
                      <div className="cf-spec-box">
                        <span className="spec-label">KV NAMESPACE</span>
                        <span className="spec-value mono">CMS_KV (rynell_studio_cms_kv)</span>
                      </div>
                      <div className="cf-spec-box">
                        <span className="spec-label">R2 STORAGE BUCKET</span>
                        <span className="spec-value mono">R2_BUCKET (rynell-studio-assets)</span>
                      </div>
                      <div className="cf-spec-box">
                        <span className="spec-label">LAST CLOUD SYNC</span>
                        <span className="spec-value mono">
                          {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Not yet synced this session'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct R2 Media Asset Uploader */}
                  <div className="cf-r2-upload-card">
                    <div className="cf-card-title-row">
                      <div>
                        <span className="cf-card-title">📤 UPLOAD MEDIA TO CLOUDFLARE R2</span>
                        <p className="cf-card-desc">
                          Upload high-resolution images, videos, and graphics directly to Cloudflare R2 bucket. Get an instant edge-cached CDN URL to paste anywhere in the CMS.
                        </p>
                      </div>
                    </div>

                    <div className="r2-uploader-action-area">
                      <input 
                        type="file" 
                        ref={r2UploadInputRef} 
                        style={{ display: 'none' }}
                        accept="image/*,video/*,application/pdf"
                        onChange={handleR2Upload}
                      />
                      <button
                        type="button"
                        className="r2-upload-btn"
                        onClick={() => r2UploadInputRef.current?.click()}
                        disabled={isUploadingR2}
                      >
                        {isUploadingR2 ? '⏳ UPLOADING TO R2...' : '📂 SELECT FILE TO UPLOAD TO R2'}
                      </button>
                    </div>

                    {uploadedR2Url && (
                      <div className="cf-upload-result-box">
                        <div className="result-thumb-row">
                          <img src={uploadedR2Url} alt="Uploaded to R2" className="r2-preview-thumb" />
                          <div className="result-info">
                            <span className="result-success-label">✅ FILE STORED IN CLOUDFLARE R2</span>
                            <div className="r2-url-copy-row">
                              <input 
                                type="text" 
                                readOnly 
                                value={uploadedR2Url} 
                                className="cms-input mono r2-url-input" 
                              />
                              <button
                                type="button"
                                className="copy-url-btn"
                                onClick={() => {
                                  navigator.clipboard.writeText(uploadedR2Url);
                                  setCopiedR2Url(true);
                                  setTimeout(() => setCopiedR2Url(false), 2000);
                                }}
                              >
                                {copiedR2Url ? 'COPIED!' : '📋 COPY CDN URL'}
                              </button>
                            </div>
                            <span className="result-hint">
                              Paste this URL into any image field in Hero, Collections, Shop, or Ads!
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edge Sync Information Note */}
                  <div className="cf-info-note">
                    <span className="cf-note-title">💡 HOW CLOUDFLARE PERSISTENCE WORKS</span>
                    <ul className="cf-note-list">
                      <li><strong>Instant Edge Serving:</strong> When visitors load the site, text & navigation are served from Cloudflare Workers KV cache with ultra-low latency.</li>
                      <li><strong>Resilient Dual-Layer:</strong> Publishing mirrors the payload to both Cloudflare KV (instant reads) and Cloudflare R2 (permanent JSON storage + timestamped history).</li>
                      <li><strong>Local Fallback:</strong> If offline or in isolated development, all changes persist locally in browser storage seamlessly.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: HERO & BRAND */}
              {activeTab === 'hero' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">HERO & BRAND INTRO</h3>
                      <p className="panel-desc">Main headlines, taglines, and intro callouts.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('hero')}>
                      RESET HERO
                    </button>
                  </div>

                  <div className="field-group">
                    <label>SECTION COMIC LABEL</label>
                    <input
                      type="text"
                      value={content.hero.sectionLabel}
                      onChange={(e) => updateField('hero', 'sectionLabel', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>HERO MAIN TITLE</label>
                    <input
                      type="text"
                      value={content.hero.title}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>HERO SUBTITLE</label>
                    <input
                      type="text"
                      value={content.hero.subtitle}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>HERO DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={content.hero.description}
                      onChange={(e) => updateField('hero', 'description', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>

                  <div className="field-group">
                    <label>BOTTOM LOCKUP - LINE 1</label>
                    <input
                      type="text"
                      value={content.hero.bottomLine1}
                      onChange={(e) => updateField('hero', 'bottomLine1', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>BOTTOM LOCKUP - EMPHASIS LINE</label>
                    <input
                      type="text"
                      value={content.hero.bottomEmphasis}
                      onChange={(e) => updateField('hero', 'bottomEmphasis', e.target.value)}
                      className="cms-input"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ABOUT & MANIFESTO */}
              {activeTab === 'about' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">ABOUT & MANIFESTO</h3>
                      <p className="panel-desc">Studio manifesto, portrait copy, and text-to-speech narration.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('about')}>
                      RESET ABOUT
                    </button>
                  </div>

                  <div className="field-group">
                    <label>MANIFESTO HEADLINE (UPPER)</label>
                    <input
                      type="text"
                      value={content.about.manifestoHeadline}
                      onChange={(e) => updateField('about', 'manifestoHeadline', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>MANIFESTO HIGHLIGHT (LOWER)</label>
                    <input
                      type="text"
                      value={content.about.manifestoHighlight}
                      onChange={(e) => updateField('about', 'manifestoHighlight', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>STUDIO SECTION TITLE</label>
                    <input
                      type="text"
                      value={content.about.studioTitle}
                      onChange={(e) => updateField('about', 'studioTitle', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>STUDIO MANIFESTO BODY COPY (READ TO ME SOURCE)</label>
                    <textarea
                      rows={6}
                      value={content.about.studioManifestoText}
                      onChange={(e) => updateField('about', 'studioManifestoText', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICES */}
              {activeTab === 'services' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">SERVICES SECTION</h3>
                      <p className="panel-desc">Design headline lockup and introduction text.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('services')}>
                      RESET SERVICES
                    </button>
                  </div>

                  <div className="field-group">
                    <label>HEADLINE WORD 1</label>
                    <input
                      type="text"
                      value={content.services.headlineDesign}
                      onChange={(e) => updateField('services', 'headlineDesign', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>HEADLINE WORD 2</label>
                    <input
                      type="text"
                      value={content.services.headlineThat}
                      onChange={(e) => updateField('services', 'headlineThat', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>HEADLINE ACCENT WORD (HITS)</label>
                    <input
                      type="text"
                      value={content.services.headlineHits}
                      onChange={(e) => updateField('services', 'headlineHits', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>PARAGRAPH LEAD (BOLD)</label>
                    <input
                      type="text"
                      value={content.services.paragraphBold}
                      onChange={(e) => updateField('services', 'paragraphBold', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>PARAGRAPH MIDDLE</label>
                    <input
                      type="text"
                      value={content.services.paragraphNormal}
                      onChange={(e) => updateField('services', 'paragraphNormal', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>PARAGRAPH ACCENT (ORANGE)</label>
                    <input
                      type="text"
                      value={content.services.paragraphAccent}
                      onChange={(e) => updateField('services', 'paragraphAccent', e.target.value)}
                      className="cms-input"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: STUDIO TOOLS */}
              {activeTab === 'studioTools' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">STUDIO INTERACTIVE TOOLS</h3>
                      <p className="panel-desc">Titles and subtitles for all studio applications.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('studioTools')}>
                      RESET TOOLS
                    </button>
                  </div>

                  {/* AI Lab */}
                  <div className="tool-cms-card">
                    <h4 className="tool-card-title">🤖 AI CREATIVE SUITE (STUDIO LAB)</h4>
                    <div className="field-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        value={content.studioTools.lab.title}
                        onChange={(e) => updateField('studioTools.lab', 'title', e.target.value)}
                        className="cms-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>SUB-DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={content.studioTools.lab.subDescription}
                        onChange={(e) => updateField('studioTools.lab', 'subDescription', e.target.value)}
                        className="cms-textarea"
                      />
                    </div>
                  </div>

                  {/* Converter */}
                  <div className="tool-cms-card">
                    <h4 className="tool-card-title">⚡ VECTOR & RASTER CONVERTERS</h4>
                    <div className="field-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        value={content.studioTools.converter.title}
                        onChange={(e) => updateField('studioTools.converter', 'title', e.target.value)}
                        className="cms-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>SUB-DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={content.studioTools.converter.subDescription}
                        onChange={(e) => updateField('studioTools.converter', 'subDescription', e.target.value)}
                        className="cms-textarea"
                      />
                    </div>
                  </div>

                  {/* Compressor */}
                  <div className="tool-cms-card">
                    <h4 className="tool-card-title">🗜️ ASSET COMPRESSOR & SCRUBBER</h4>
                    <div className="field-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        value={content.studioTools.compressor.title}
                        onChange={(e) => updateField('studioTools.compressor', 'title', e.target.value)}
                        className="cms-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>SUB-DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={content.studioTools.compressor.subDescription}
                        onChange={(e) => updateField('studioTools.compressor', 'subDescription', e.target.value)}
                        className="cms-textarea"
                      />
                    </div>
                  </div>

                  {/* GIF Maker */}
                  <div className="tool-cms-card">
                    <h4 className="tool-card-title">🎞️ ANIMATED GIF STUDIO PRO</h4>
                    <div className="field-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        value={content.studioTools.gifMaker.title}
                        onChange={(e) => updateField('studioTools.gifMaker', 'title', e.target.value)}
                        className="cms-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>SUB-DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={content.studioTools.gifMaker.subDescription}
                        onChange={(e) => updateField('studioTools.gifMaker', 'subDescription', e.target.value)}
                        className="cms-textarea"
                      />
                    </div>
                  </div>

                  {/* JSON Lab */}
                  <div className="tool-cms-card">
                    <h4 className="tool-card-title">📊 JSON TRANSFORMER & SCHEMA LAB</h4>
                    <div className="field-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        value={content.studioTools.jsonLab.title}
                        onChange={(e) => updateField('studioTools.jsonLab', 'title', e.target.value)}
                        className="cms-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>SUB-DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={content.studioTools.jsonLab.subDescription}
                        onChange={(e) => updateField('studioTools.jsonLab', 'subDescription', e.target.value)}
                        className="cms-textarea"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 6: COLLECTIONS */}
              {activeTab === 'collections' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">COLLECTIONS</h3>
                      <p className="panel-desc">Curated archive titles and descriptions.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('collections')}>
                      RESET
                    </button>
                  </div>

                  <div className="field-group">
                    <label>TITLE</label>
                    <input
                      type="text"
                      value={content.collections.title}
                      onChange={(e) => updateField('collections', 'title', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={content.collections.description}
                      onChange={(e) => updateField('collections', 'description', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: SHOP & DROPS */}
              {activeTab === 'shop' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">SHOP & MERCH DROPS</h3>
                      <p className="panel-desc">Shop headings, archive labels, and sub-captions.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('shop')}>
                      RESET SHOP
                    </button>
                  </div>

                  <div className="field-group">
                    <label>SHOP SECTION TITLE</label>
                    <input
                      type="text"
                      value={content.shop.title}
                      onChange={(e) => updateField('shop', 'title', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>SHOP DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={content.shop.description}
                      onChange={(e) => updateField('shop', 'description', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>

                  <div className="field-group">
                    <label>VIEW ALL BUTTON TEXT</label>
                    <input
                      type="text"
                      value={content.shop.viewAllButton}
                      onChange={(e) => updateField('shop', 'viewAllButton', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>ARCHIVE OVERLAY TITLE</label>
                    <input
                      type="text"
                      value={content.shop.archiveTitle}
                      onChange={(e) => updateField('shop', 'archiveTitle', e.target.value)}
                      className="cms-input"
                    />
                  </div>
                </div>
              )}

              {/* TAB 8: ADS & CAMPAIGNS */}
              {activeTab === 'ads' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">CAMPAIGNS & ADS</h3>
                      <p className="panel-desc">Commercial work showcase copy.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('ads')}>
                      RESET ADS
                    </button>
                  </div>

                  <div className="field-group">
                    <label>SECTION TITLE</label>
                    <input
                      type="text"
                      value={content.ads.title}
                      onChange={(e) => updateField('ads', 'title', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={content.ads.description}
                      onChange={(e) => updateField('ads', 'description', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>
                </div>
              )}

              {/* TAB 9: JOURNAL */}
              {activeTab === 'journal' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">JOURNAL & FIELD NOTES</h3>
                      <p className="panel-desc">Journal titles and descriptions.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('journal')}>
                      RESET JOURNAL
                    </button>
                  </div>

                  <div className="field-group">
                    <label>SECTION TITLE</label>
                    <input
                      type="text"
                      value={content.journal.title}
                      onChange={(e) => updateField('journal', 'title', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={content.journal.description}
                      onChange={(e) => updateField('journal', 'description', e.target.value)}
                      className="cms-textarea"
                    />
                  </div>

                  <div className="field-group">
                    <label>VIEW ALL BUTTON TEXT</label>
                    <input
                      type="text"
                      value={content.journal.viewAllButton}
                      onChange={(e) => updateField('journal', 'viewAllButton', e.target.value)}
                      className="cms-input"
                    />
                  </div>
                </div>
              )}

              {/* TAB 10: FOOTER & BRAND */}
              {activeTab === 'footer' && !filterQuery && (
                <div className="cms-section-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3 className="panel-title">FOOTER & BRAND IDENTITY</h3>
                      <p className="panel-desc">Logo, taglines, legal copy, and contact email.</p>
                    </div>
                    <button type="button" className="cms-reset-btn" onClick={() => resetSection('footer')}>
                      RESET FOOTER
                    </button>
                  </div>

                  <div className="field-group">
                    <label>FOOTER LOGO TEXT</label>
                    <input
                      type="text"
                      value={content.footer.logoText}
                      onChange={(e) => updateField('footer', 'logoText', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>TAGLINE PREFIX</label>
                    <input
                      type="text"
                      value={content.footer.taglinePrefix}
                      onChange={(e) => updateField('footer', 'taglinePrefix', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>TAGLINE EMPHASIS (ORANGE)</label>
                    <input
                      type="text"
                      value={content.footer.taglineEmphasis}
                      onChange={(e) => updateField('footer', 'taglineEmphasis', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>SUPPORT / CONTACT EMAIL</label>
                    <input
                      type="email"
                      value={content.footer.contactEmail}
                      onChange={(e) => updateField('footer', 'contactEmail', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>COPYRIGHT STATEMENT</label>
                    <input
                      type="text"
                      value={content.footer.copyright}
                      onChange={(e) => updateField('footer', 'copyright', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>PRIVACY POLICY LINK TEXT</label>
                    <input
                      type="text"
                      value={content.footer.privacyText}
                      onChange={(e) => updateField('footer', 'privacyText', e.target.value)}
                      className="cms-input"
                    />
                  </div>

                  <div className="field-group">
                    <label>TERMS OF SERVICE LINK TEXT</label>
                    <input
                      type="text"
                      value={content.footer.termsText}
                      onChange={(e) => updateField('footer', 'termsText', e.target.value)}
                      className="cms-input"
                    />
                  </div>
                </div>
              )}

              {/* SEARCH FILTER MODE */}
              {filterQuery && (
                <div className="cms-section-panel">
                  <h3 className="panel-title">SEARCH RESULTS FOR "{filterQuery.toUpperCase()}"</h3>
                  <p className="panel-desc">Matching copy fields across the studio:</p>
                  
                  <div className="search-results-list">
                    {/* Hero match */}
                    {Object.entries(content.hero)
                      .filter(([k, v]) => typeof v === 'string' && (v.toLowerCase().includes(filterQuery.toLowerCase()) || k.toLowerCase().includes(filterQuery.toLowerCase())))
                      .map(([k, v]) => (
                        <div key={`hero-${k}`} className="search-match-item">
                          <span className="match-tag">HERO → {k}</span>
                          <input
                            type="text"
                            value={v}
                            onChange={(e) => updateField('hero', k, e.target.value)}
                            className="cms-input"
                          />
                        </div>
                      ))}

                    {/* About match */}
                    {Object.entries(content.about)
                      .filter(([k, v]) => typeof v === 'string' && (v.toLowerCase().includes(filterQuery.toLowerCase()) || k.toLowerCase().includes(filterQuery.toLowerCase())))
                      .map(([k, v]) => (
                        <div key={`about-${k}`} className="search-match-item">
                          <span className="match-tag">ABOUT → {k}</span>
                          <textarea
                            rows={3}
                            value={v}
                            onChange={(e) => updateField('about', k, e.target.value)}
                            className="cms-textarea"
                          />
                        </div>
                      ))}

                    {/* Services match */}
                    {Object.entries(content.services)
                      .filter(([k, v]) => typeof v === 'string' && (v.toLowerCase().includes(filterQuery.toLowerCase()) || k.toLowerCase().includes(filterQuery.toLowerCase())))
                      .map(([k, v]) => (
                        <div key={`services-${k}`} className="search-match-item">
                          <span className="match-tag">SERVICES → {k}</span>
                          <input
                            type="text"
                            value={v}
                            onChange={(e) => updateField('services', k, e.target.value)}
                            className="cms-input"
                          />
                        </div>
                      ))}

                    {/* Footer match */}
                    {Object.entries(content.footer)
                      .filter(([k, v]) => typeof v === 'string' && (v.toLowerCase().includes(filterQuery.toLowerCase()) || k.toLowerCase().includes(filterQuery.toLowerCase())))
                      .map(([k, v]) => (
                        <div key={`footer-${k}`} className="search-match-item">
                          <span className="match-tag">FOOTER → {k}</span>
                          <input
                            type="text"
                            value={v}
                            onChange={(e) => updateField('footer', k, e.target.value)}
                            className="cms-input"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </>
          ) : (
            renderAuthGate()
          )}

        </div>
      </div>

      <style>{`
        .cms-admin-drawer {
          width: 580px;
          max-width: 95vw;
          background: #090d16;
          color: #f1f5f9;
          border-left: 3px solid var(--primary-orange);
          box-shadow: -15px 0 45px rgba(0, 0, 0, 0.75);
          display: flex;
          flex-direction: column;
          z-index: 2500;
        }

        .cms-drawer-header {
          background: #03060c;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cms-title-lockup {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cms-badge-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cms-crown-badge {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1.2px;
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.4);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .cms-version-tag {
          font-family: monospace;
          font-size: 0.68rem;
          color: #94a3b8;
        }

        .cms-headline {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          letter-spacing: 1.5px;
          margin: 0;
          color: #ffffff;
        }

        .cms-live-toast {
          background: var(--primary-orange);
          color: #000;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 0.5rem 1.25rem;
          text-align: center;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(255, 106, 0, 0.35);
          animation: slideDown 0.2s ease;
        }

        .cms-scrollable-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Toolbar */
        .cms-toolbar-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .toolbar-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .cms-pill-action {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          padding: 0.35rem 0.75rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cms-pill-action:hover {
          background: #334155;
          color: #ffffff;
        }

        .cms-pill-action.live-edit-btn.active {
          background: var(--primary-orange);
          color: #000;
          font-weight: 700;
          border-color: #000;
        }

        .cms-pill-action.danger:hover {
          background: #ef4444;
          color: #fff;
          border-color: #ef4444;
        }

        .json-actions-group {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .cms-search-wrap {
          display: flex;
          align-items: center;
          background: #050811;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.35rem 0.75rem;
          gap: 0.5rem;
        }

        .cms-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.85rem;
          width: 100%;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        /* Tabs */
        .cms-tabs-scroller {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cms-tab-btn {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          white-space: nowrap;
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cms-tab-btn:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .cms-tab-btn.active {
          background: var(--primary-orange);
          color: #000;
          font-weight: 700;
          border-color: var(--primary-orange);
          box-shadow: 2px 2px 0 #000;
        }

        /* Section Panels */
        .cms-section-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
          padding-bottom: 0.6rem;
        }

        .panel-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          letter-spacing: 1.2px;
          margin: 0;
          color: var(--primary-orange);
        }

        .panel-desc {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 0.2rem 0 0 0;
        }

        .cms-reset-btn {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          letter-spacing: 0.8px;
          background: none;
          border: 1px dashed #64748b;
          color: #94a3b8;
          padding: 0.2rem 0.6rem;
          cursor: pointer;
        }

        .cms-reset-btn:hover {
          color: #f87171;
          border-color: #f87171;
        }

        /* Form elements */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-group label {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          color: #94a3b8;
        }

        .cms-input {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.88rem;
          padding: 0.5rem 0.75rem;
          outline: none;
          transition: border-color 0.15s;
        }

        .cms-input:focus {
          border-color: var(--primary-orange);
        }

        .cms-textarea {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.5;
          padding: 0.5rem 0.75rem;
          outline: none;
          resize: vertical;
        }

        .cms-textarea:focus {
          border-color: var(--primary-orange);
        }

        /* Top Nav Manager Cards */
        .panel-badge-pill {
          display: inline-block;
          font-family: var(--font-heading);
          font-size: 0.68rem;
          letter-spacing: 1px;
          background: rgba(0, 229, 255, 0.15);
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 1px 6px;
          margin-bottom: 0.3rem;
        }

        .panel-header-right-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .nav-items-count-badge {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: #38bdf8;
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 0.35rem 0.6rem;
        }

        .add-nav-card {
          background: #0b111d;
          border: 1px solid rgba(255, 106, 0, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          padding: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .add-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.4rem;
        }

        .add-nav-title {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          letter-spacing: 1px;
          color: var(--primary-orange);
        }

        .add-nav-subtitle {
          font-size: 0.72rem;
          color: #64748b;
        }

        .add-nav-form {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 0.6rem;
          align-items: flex-end;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-field-group.btn-col {
          justify-content: flex-end;
        }

        .cms-mini-label {
          font-family: var(--font-heading);
          font-size: 0.68rem;
          letter-spacing: 1px;
          color: #94a3b8;
        }

        .add-nav-submit-btn {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          letter-spacing: 1px;
          background: var(--primary-orange);
          color: #000;
          font-weight: 700;
          border: 1px solid #000;
          padding: 0.5rem 1.2rem;
          cursor: pointer;
          box-shadow: 2px 2px 0 #000;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .add-nav-submit-btn:hover {
          background: #fff;
          transform: translateY(-1px);
        }

        .preset-selector-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #080c14;
          padding: 0.35rem 0.5rem;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .cms-select-preset {
          flex: 1;
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.35rem 0.5rem;
          font-size: 0.75rem;
          outline: none;
          cursor: pointer;
        }

        .cms-select-preset:focus {
          border-color: var(--primary-orange);
        }

        .quick-suggestions-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .suggest-lbl {
          font-family: var(--font-heading);
          font-size: 0.68rem;
          color: #64748b;
          letter-spacing: 0.8px;
        }

        .suggest-pill {
          font-family: monospace;
          font-size: 0.68rem;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.18rem 0.45rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .suggest-pill:hover {
          color: var(--primary-orange);
          border-color: var(--primary-orange);
          background: #0f172a;
        }

        .suggest-pill.already-added {
          opacity: 0.55;
          border-style: dashed;
        }

        .nav-items-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .section-sub-title {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: var(--primary-orange);
          letter-spacing: 1px;
        }

        .section-sub-hint {
          font-size: 0.7rem;
          color: #64748b;
        }

        .nav-empty-state {
          text-align: center;
          padding: 2.5rem 1rem;
          background: #080c14;
          border: 1px dashed rgba(255, 255, 255, 0.15);
        }

        .nav-empty-state .empty-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: #ef4444;
          letter-spacing: 1px;
          margin-bottom: 0.25rem;
        }

        .nav-empty-state .empty-desc {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .restore-defaults-cta {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 1px;
          background: var(--primary-orange);
          color: #000;
          font-weight: 700;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }

        .nav-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 0.75rem;
          display: grid;
          grid-template-columns: 45px 1fr auto;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }

        .nav-item-card:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: #111a2e;
        }

        .nav-item-card.hidden-item {
          opacity: 0.5;
          background: #080b12;
        }

        .item-order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
        }

        .order-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.65rem;
          cursor: pointer;
          padding: 1px 4px;
        }

        .order-btn:hover:not(:disabled) {
          color: var(--primary-orange);
        }

        .order-btn:disabled {
          opacity: 0.2;
          cursor: default;
        }

        .order-idx {
          font-family: monospace;
          font-size: 0.75rem;
          color: #64748b;
        }

        .item-fields-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .field-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .input-hint-label {
          font-family: monospace;
          font-size: 0.62rem;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        .item-name-input {
          font-family: var(--font-heading);
          font-weight: 700;
          letter-spacing: 1px;
        }

        .item-link-input {
          font-family: monospace;
          font-size: 0.8rem;
          color: #60a5fa;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .visibility-btn {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          padding: 0.35rem 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: #1e293b;
          color: #cbd5e1;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .visibility-btn.hidden {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          color: #f87171;
        }

        .delete-nav-item-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #f87171;
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          font-weight: 700;
          padding: 0.35rem 0.65rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .delete-nav-item-btn:hover {
          background: #ef4444;
          color: #ffffff;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }

        /* Tool Cards */
        .tool-cms-card {
          background: #0b111d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tool-card-title {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          letter-spacing: 1.2px;
          margin: 0;
          color: #60a5fa;
        }

        /* Search Results */
        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .search-match-item {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .match-tag {
          font-family: monospace;
          font-size: 0.72rem;
          color: var(--primary-orange);
        }

        /* Gate Form */
        .cms-auth-gate {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 1rem;
        }

        .gate-icon {
          font-size: 3rem;
        }

        .gate-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          letter-spacing: 1.5px;
          color: #ef4444;
          margin: 0;
        }

        .gate-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          max-width: 400px;
          line-height: 1.5;
          margin: 0;
        }

        .gate-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          max-width: 320px;
        }

        .gate-input {
          background: #0f1523;
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-family: monospace;
          font-size: 0.95rem;
          padding: 0.65rem 0.85rem;
          text-align: center;
          outline: none;
        }

        .gate-input.error {
          border-color: #ef4444;
          animation: shake 0.3s ease;
        }

        .gate-btn {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          letter-spacing: 1px;
          padding: 0.65rem 1rem;
          cursor: pointer;
          border: none;
          font-weight: 700;
        }

        .unlock-btn {
          background: var(--primary-orange);
          color: #000;
        }

        .quick-root-btn {
          background: #1e293b;
          border: 1px solid #fbbf24;
          color: #fbbf24;
          width: 100%;
          max-width: 320px;
        }

        .gate-divider {
          display: flex;
          align-items: center;
          color: #64748b;
          font-size: 0.75rem;
          font-family: monospace;
          margin: 0.5rem 0;
        }

        /* CLOUDFLARE EDGE & R2 STYLES */
        .cf-sync-pill {
          background: #0284c7;
          color: #fff;
          border: 1px solid #38bdf8;
        }

        .cf-sync-pill:hover:not(:disabled) {
          background: #0369a1;
        }

        .cf-sync-pill.synced {
          background: #059669;
          border-color: #34d399;
        }

        .cf-status-pill-badge {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.35rem 0.65rem;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
        }

        .cf-status-pill-badge.synced {
          background: #064e3b;
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.4);
        }

        .cf-status-pill-badge.syncing {
          background: #1e1b4b;
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.4);
        }

        .cf-status-pill-badge.error {
          background: #450a0a;
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.4);
        }

        .cf-status-pill-badge.idle {
          background: #1e293b;
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .cf-edge-card {
          background: #080e1a;
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        .cf-card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .cf-card-title {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          letter-spacing: 1px;
          color: #38bdf8;
        }

        .cf-card-desc {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 0.25rem 0 0.75rem 0;
          line-height: 1.4;
        }

        .cf-data-source-pill {
          font-family: monospace;
          font-size: 0.7rem;
          color: #38bdf8;
          background: #0f172a;
          padding: 0.2rem 0.55rem;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .cf-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
        }

        .cf-spec-box {
          background: #0b1322;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.6rem 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .spec-label {
          font-family: var(--font-heading);
          font-size: 0.65rem;
          letter-spacing: 1px;
          color: #64748b;
        }

        .spec-value {
          font-size: 0.78rem;
          color: #e2e8f0;
          word-break: break-all;
        }

        .spec-value.mono {
          font-family: monospace;
        }

        .cf-r2-upload-card {
          background: #091220;
          border: 1px solid rgba(245, 158, 11, 0.35);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        .r2-uploader-action-area {
          margin: 0.5rem 0;
        }

        .r2-upload-btn {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          letter-spacing: 1px;
          background: #d97706;
          color: #000;
          font-weight: 700;
          padding: 0.75rem 1.25rem;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: background 0.2s;
        }

        .r2-upload-btn:hover:not(:disabled) {
          background: #b45309;
        }

        .cf-upload-result-box {
          background: #06101e;
          border: 1px solid #10b981;
          padding: 0.85rem;
          margin-top: 0.85rem;
        }

        .result-thumb-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .r2-preview-thumb {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border: 2px solid #10b981;
          flex-shrink: 0;
        }

        .result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }

        .result-success-label {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          color: #10b981;
        }

        .r2-url-copy-row {
          display: flex;
          gap: 0.5rem;
        }

        .r2-url-input {
          flex: 1;
          font-size: 0.75rem;
          padding: 0.4rem 0.6rem;
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #38bdf8;
        }

        .copy-url-btn {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 1px;
          background: #10b981;
          color: #000;
          font-weight: 700;
          border: none;
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .copy-url-btn:hover {
          background: #059669;
        }

        .result-hint {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .cf-info-note {
          background: #0b111d;
          border-left: 3px solid #38bdf8;
          padding: 0.85rem 1rem;
          margin-top: 0.5rem;
        }

        .cf-note-title {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 1px;
          color: #38bdf8;
          display: block;
          margin-bottom: 0.4rem;
        }

        .cf-note-list {
          margin: 0;
          padding-left: 1.2rem;
          font-size: 0.78rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </>
  );
};

export default AdminCmsDrawer;
