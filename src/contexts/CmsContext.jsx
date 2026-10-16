import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Default Nav Items with rich default metadata
const DEFAULT_NAV_ITEMS = [
  { id: 'ai-labs', name: 'AI LABS', link: '#studio-lab', visible: true },
  { id: 'converters', name: 'CONVERTERS', link: '#converter-tools', visible: true },
  { id: 'optimizer', name: 'OPTIMIZER', link: '#image-compressor', visible: true },
  { id: 'gif-maker', name: 'GIF MAKER', link: '#gif-maker', visible: true },
  { id: 'json-lab', name: 'JSON LAB', link: '#json-lab', visible: true },
  { id: 'collections', name: 'COLLECTIONS', link: '#collections', visible: true },
  { id: 'shop', name: 'SHOP', link: '#shop', visible: true },
  { id: 'ads', name: 'ADS', link: '#ads', visible: true },
  { id: 'about', name: 'ABOUT', link: '#about', visible: true },
  { id: 'journal', name: 'JOURNAL', link: '#journal', visible: true }
];

// Factory Default Copy for All Pages and Sections
const DEFAULT_CMS_CONTENT = {
  navItems: DEFAULT_NAV_ITEMS,
  brand: {
    name: 'RYNELL STUDIO',
    tagline: 'Visuals that connect. Campaigns that perform.',
    supportEmail: 'hello@rynell.org',
    city: 'STOCKHOLM // GLOBAL'
  },
  hero: {
    sectionLabel: 'INTRO',
    title: 'Rynell Studio',
    subtitle: 'Campaign System',
    description: 'Visuals that connect. Campaigns that perform.',
    bottomLine1: 'Creative Strategy.',
    bottomEmphasis: 'Bold Execution.'
  },
  about: {
    sectionLabel: 'ABOUT',
    manifestoHeadline: "WE DON'T FOLLOW TRENDS.",
    manifestoHighlight: 'WE BUILD THEM.',
    studioTitle: 'THE STUDIO',
    readToMeButton: 'READ IT TO ME',
    studioManifestoText: "Rynell Studio is a multi-disciplinary creative force specializing in aggressive, high-impact visual design. From conceptual branding to explosive campaign visuals and AI-driven asset generation, we deliver work that doesn't just look good—it hits hard. We operate at the bleeding edge of visual culture, blending raw human creativity with state-of-the-art AI tooling to deliver uncompromising aesthetics."
  },
  services: {
    sectionLabel: 'SERVICES',
    headlineDesign: 'DESIGN',
    headlineThat: 'THAT',
    headlineHits: 'HITS',
    paragraphBold: 'Bold identity, campaign visuals',
    paragraphNormal: 'and AI-powered assets —',
    paragraphAccent: 'human taste.'
  },
  collections: {
    sectionLabel: 'COLLECTIONS',
    title: 'COLLECTIONS',
    description: 'Curated aesthetic archives. A rotating selection of our latest visual experiments and structural explorations.'
  },
  shop: {
    sectionLabel: 'SHOP',
    title: 'LATEST DROPS',
    description: 'Physical artifacts of our visual philosophy. Limited run apparel and accessories designed for the modern dystopia.',
    viewAllButton: 'VIEW ALL MERCH',
    archiveTitle: 'FULL CATALOG'
  },
  ads: {
    sectionLabel: 'CAMPAIGN',
    title: 'ADS',
    description: 'Visual campaigns that break through the noise. Bold imagery, aggressive typography, and uncompromising art direction.'
  },
  journal: {
    sectionLabel: 'JOURNAL',
    title: 'LATEST DISPATCHES',
    description: 'Transmissions from the bleeding edge of design culture. Thoughts on AI, brutalist architecture, and the future of merch.',
    viewAllButton: 'ALL ARTICLES'
  },
  studioTools: {
    lab: {
      sectionLabel: 'STUDIO LAB',
      title: 'RYNELL AI CREATIVE SUITE',
      subDescription: 'Unified AI production studio with top-tier models, real-time image gen, AI vectorization, super-resolution upscaling & instant client preview.'
    },
    converter: {
      sectionLabel: 'STUDIO CONVERTERS',
      title: 'VECTOR & RASTER CONVERSION ENGINE',
      subDescription: 'High-fidelity image format transcoding: SVG to WebP/PNG/AVIF/JPG and Raster-to-SVG vector tracing with full color quantization and transparency grid.'
    },
    compressor: {
      sectionLabel: 'STUDIO COMPRESSOR',
      title: 'STUDIO ASSET COMPRESSOR & METADATA SCRUBBER',
      subDescription: 'Lossless & Lossy image optimization engine. Strips EXIF/ICC junk, applies MozJPEG trellis quantization & pngquant palette reduction with live before/after inspector.'
    },
    gifMaker: {
      sectionLabel: 'GIF MAKER',
      title: 'ANIMATED GIF STUDIO PRO',
      subDescription: 'Next-gen frame-by-frame GIF & WebP animation builder with frame delay, canvas drawing effects, cross-fade transitions & live multi-format preview.'
    },
    jsonLab: {
      sectionLabel: 'JSON LAB',
      title: 'STUDIO JSON TRANSFORMER & SCHEMA LAB',
      subDescription: 'Transform, flatten, query, sort, and transcode JSON data across YAML, CSV, TypeScript Interfaces, XML, and minified production bundles.'
    }
  },
  footer: {
    logoText: 'RYNELL STUDIO',
    taglinePrefix: 'Bold identity, campaign visuals and AI-powered assets —',
    taglineEmphasis: 'built with human taste.',
    exploreTitle: 'EXPLORE',
    connectTitle: 'CONNECT',
    sayHelloTitle: 'SAY HELLO',
    contactEmail: 'hello@rynell.org',
    copyright: '© 2026 Rynell Studio. All rights reserved.',
    privacyText: 'Privacy Policy',
    termsText: 'Terms of Service'
  }
};

const STORAGE_KEY = 'rynell_studio_cms_content_v2';
const CmsContext = createContext();

// Deep merge helper ensuring default keys are never lost
function deepMerge(target, source) {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

const WORKER_ENDPOINT = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://rynell-ai-gateway.thomasrynell.workers.dev';

export const CmsProvider = ({ children }) => {
  const { isAdmin: authIsAdmin, loginAsAdmin } = useAuth();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Effective Admin status (from AuthContext or local CMS key)
  const isCmsAdmin = authIsAdmin || isAdminUnlocked;

  const [content, setContent] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return deepMerge(DEFAULT_CMS_CONTENT, parsed);
      }
    } catch (e) {
      console.warn('Failed to load CMS content from localStorage:', e);
    }
    return DEFAULT_CMS_CONTENT;
  });

  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isLiveEditMode, setIsLiveEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('nav');
  const [saveToast, setSaveToast] = useState(null);

  // Cloudflare Edge Sync & Storage State
  const [cloudflareSyncStatus, setCloudflareSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [edgeSource, setEdgeSource] = useState(null);

  // Persist content to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.warn('Failed to save CMS content:', e);
    }
  }, [content]);

  // Pull latest CMS content from Cloudflare Edge (KV/R2) on initial load
  useEffect(() => {
    let isMounted = true;
    const loadFromCloudflare = async () => {
      try {
        setCloudflareSyncStatus('syncing');
        const res = await fetch(`${WORKER_ENDPOINT}/api/cms/content`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`Edge returned status ${res.status}`);
        }
        const data = await res.json();
        if (data && data.success && data.content && isMounted) {
          const merged = deepMerge(DEFAULT_CMS_CONTENT, data.content);
          setContent(merged);
          setEdgeSource(data.source || 'cloudflare_kv');
          setLastSyncedAt(data.updatedAt || new Date().toISOString());
          setCloudflareSyncStatus('synced');
        } else if (isMounted) {
          setCloudflareSyncStatus('offline');
        }
      } catch (err) {
        console.warn('Cloudflare CMS edge fetch skipped/failed, using local storage:', err);
        if (isMounted) setCloudflareSyncStatus('offline');
      }
    };

    loadFromCloudflare();
    return () => { isMounted = false; };
  }, []);

  // Temporary toast feedback
  const showToast = useCallback((msg) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  /**
   * Safe text lookup helper by dotted path with fallback
   * e.g. t('hero.title', 'Rynell Studio')
   */
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    let curr = content;
    for (const p of parts) {
      if (curr === undefined || curr === null) return fallback;
      curr = curr[p];
    }
    return curr !== undefined && curr !== null && curr !== '' ? curr : fallback;
  }, [content]);

  /**
   * Update a specific field in a section
   */
  const updateField = useCallback((section, key, value) => {
    setContent((prev) => {
      if (section.includes('.')) {
        const [parent, child] = section.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [key]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
    });
    showToast('Changes saved & applied live');
  }, [showToast]);

  /**
   * Update the entire top-nav items array
   */
  const updateNavItems = useCallback((items) => {
    setContent((prev) => ({
      ...prev,
      navItems: items
    }));
    showToast('Navigation updated');
  }, [showToast]);

  /**
   * Add a new nav item
   */
  const addNavItem = useCallback((name, link, insertIndex = null) => {
    const cleanName = (name || 'NEW ITEM').toUpperCase().trim();
    let cleanLink = (link || '#').trim();
    if (
      cleanLink &&
      !cleanLink.startsWith('#') &&
      !cleanLink.startsWith('http://') &&
      !cleanLink.startsWith('https://') &&
      !cleanLink.startsWith('/')
    ) {
      cleanLink = `#${cleanLink.toLowerCase().replace(/\s+/g, '-')}`;
    }

    const newItem = {
      id: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      link: cleanLink,
      visible: true
    };

    setContent((prev) => {
      const currentList = prev.navItems || [];
      const updated = [...currentList];
      if (insertIndex !== null && insertIndex >= 0 && insertIndex <= updated.length) {
        updated.splice(insertIndex, 0, newItem);
      } else {
        updated.push(newItem);
      }
      return {
        ...prev,
        navItems: updated
      };
    });

    showToast(`Added "${cleanName}" to Top Navigation`);
    return newItem;
  }, [showToast]);

  /**
   * Remove a nav item
   */
  const removeNavItem = useCallback((idOrName) => {
    let removedLabel = '';
    setContent((prev) => {
      const currentList = prev.navItems || [];
      const target = currentList.find((item) => item.id === idOrName || item.name === idOrName);
      if (target) {
        removedLabel = target.name;
      }
      return {
        ...prev,
        navItems: currentList.filter((item) => item.id !== idOrName && item.name !== idOrName)
      };
    });
    showToast(removedLabel ? `Removed "${removedLabel}" from Top Navigation` : 'Menu item removed');
  }, [showToast]);

  /**
   * Update a single nav item by ID or name
   */
  const updateNavItem = useCallback((idOrName, updates) => {
    setContent((prev) => ({
      ...prev,
      navItems: (prev.navItems || []).map((item) => {
        if (item.id === idOrName || item.name === idOrName) {
          return {
            ...item,
            ...updates,
            name: updates.name !== undefined ? String(updates.name).toUpperCase() : item.name
          };
        }
        return item;
      })
    }));
  }, []);

  /**
   * Toggle visibility of a nav item
   */
  const toggleNavItemVisibility = useCallback((id) => {
    setContent((prev) => ({
      ...prev,
      navItems: (prev.navItems || []).map((item) => 
        item.id === id || item.name === id ? { ...item, visible: !item.visible } : item
      )
    }));
  }, []);

  /**
   * Move nav item up or down in order
   */
  const reorderNavItem = useCallback((index, direction) => {
    setContent((prev) => {
      const items = [...prev.navItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, navItems: items };
    });
  }, []);

  /**
   * Reset a specific section to factory default
   */
  const resetSection = useCallback((sectionKey) => {
    setContent((prev) => {
      if (sectionKey === 'navItems') {
        return { ...prev, navItems: DEFAULT_NAV_ITEMS };
      }
      if (sectionKey.includes('.')) {
        const [parent, child] = sectionKey.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: DEFAULT_CMS_CONTENT[parent][child]
          }
        };
      }
      return {
        ...prev,
        [sectionKey]: DEFAULT_CMS_CONTENT[sectionKey]
      };
    });
    showToast(`Reset ${sectionKey} to default`);
  }, [showToast]);

  /**
   * Reset everything to factory defaults
   */
  const resetAll = useCallback(() => {
    if (window.confirm('Reset all CMS copy and menu items to factory defaults?')) {
      setContent(DEFAULT_CMS_CONTENT);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Could not reset CMS storage:', err);
      }
      showToast('All CMS content reset to defaults');
    }
  }, [showToast]);

  /**
   * Export CMS configuration as a JSON file
   */
  const exportJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rynell-studio-cms-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('CMS JSON configuration exported');
  }, [content, showToast]);

  /**
   * Import CMS configuration from JSON string or file
   */
  const importJSON = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const merged = deepMerge(DEFAULT_CMS_CONTENT, parsed);
      setContent(merged);
      showToast('CMS configuration successfully imported!');
      return { success: true };
    } catch (err) {
      alert('Invalid JSON file format: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [showToast]);

  /**
   * Quick Admin Unlock via PIN
   */
  const unlockAdminWithPin = useCallback((pin) => {
    const validPins = ['admin', 'admin2026', 'rynell', 'rynelladmin', '1337'];
    if (validPins.includes((pin || '').trim().toLowerCase())) {
      setIsAdminUnlocked(true);
      if (loginAsAdmin) loginAsAdmin();
      showToast('👑 Admin mode unlocked!');
      return true;
    }
    return false;
  }, [loginAsAdmin, showToast]);

  const openCms = useCallback((tab = 'nav') => {
    setActiveTab(tab);
    setIsCmsOpen(true);
  }, []);

  const closeCms = useCallback(() => {
    setIsCmsOpen(false);
  }, []);

  /**
   * Publish current CMS content to Cloudflare Edge (KV & R2)
   */
  const publishToCloudflare = useCallback(async () => {
    try {
      setCloudflareSyncStatus('syncing');
      showToast('☁️ Publishing to Cloudflare Edge (KV & R2)...');
      const res = await fetch(`${WORKER_ENDPOINT}/api/cms/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin'
        },
        body: JSON.stringify({
          content,
          updatedBy: 'admin@rynell.org',
          note: 'Published via Rynell Studio Admin CMS'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Cloudflare Edge returned status ${res.status}`);
      }

      const data = await res.json();
      setLastSyncedAt(data.savedAt || new Date().toISOString());
      setCloudflareSyncStatus('synced');
      setEdgeSource('cloudflare_kv');
      showToast('☁️ Successfully saved to Cloudflare KV & R2 Edge!');
      return { success: true, data };
    } catch (err) {
      console.error('Failed to sync to Cloudflare:', err);
      setCloudflareSyncStatus('error');
      showToast(`❌ Cloudflare sync error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }, [content, showToast]);

  /**
   * Pull content from Cloudflare Edge
   */
  const pullFromCloudflare = useCallback(async () => {
    try {
      setCloudflareSyncStatus('syncing');
      showToast('☁️ Fetching from Cloudflare Edge...');
      const res = await fetch(`${WORKER_ENDPOINT}/api/cms/content`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data && data.content) {
        const merged = deepMerge(DEFAULT_CMS_CONTENT, data.content);
        setContent(merged);
        setLastSyncedAt(data.updatedAt || new Date().toISOString());
        setEdgeSource(data.source);
        setCloudflareSyncStatus('synced');
        showToast('☁️ Updated from Cloudflare Edge!');
        return true;
      }
      showToast('ℹ️ No remote content on Cloudflare edge yet.');
      setCloudflareSyncStatus('offline');
      return false;
    } catch (err) {
      setCloudflareSyncStatus('error');
      showToast(`❌ Cloudflare pull error: ${err.message}`);
      return false;
    }
  }, [showToast]);

  /**
   * Upload an asset to Cloudflare R2 Bucket
   */
  const uploadAssetToCloudflare = useCallback(async (file, folder = 'cms/uploads') => {
    try {
      showToast('☁️ Uploading asset to Cloudflare R2...');
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${WORKER_ENDPOINT}/api/cms/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/png',
          imageBase64: base64,
          folder
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Upload failed');
      }

      const data = await res.json();
      showToast('☁️ Asset uploaded to Cloudflare R2!');
      return data; // { success: true, url, key }
    } catch (err) {
      showToast(`❌ Cloudflare R2 upload error: ${err.message}`);
      throw err;
    }
  }, [showToast]);

  const toggleLiveEdit = useCallback(() => {
    setIsLiveEditMode((prev) => !prev);
    showToast(isLiveEditMode ? 'Live In-Page Edit Mode: OFF' : 'Live In-Page Edit Mode: ON');
  }, [isLiveEditMode, showToast]);

  return (
    <CmsContext.Provider
      value={{
        content,
        t,
        updateField,
        updateNavItems,
        updateNavItem,
        addNavItem,
        removeNavItem,
        toggleNavItemVisibility,
        reorderNavItem,
        resetSection,
        resetAll,
        exportJSON,
        importJSON,
        isCmsOpen,
        openCms,
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
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
