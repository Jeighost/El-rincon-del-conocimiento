// Sistema de Cookies Mejorado - Modal Flotante
// El Rincón del Conocimiento

(function() {
    'use strict';
    
    const COOKIE_NAME = 'cookieConsent';
    
    // Verificar si ya dio consentimiento
    function hasConsent() {
        return localStorage.getItem(COOKIE_NAME) !== null;
    }
    
    // Obtener preferencias guardadas
    function getPreferences() {
        const saved = localStorage.getItem(COOKIE_NAME);
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }
    
    // Guardar preferencias
    function savePreferences(preferences) {
        const data = {
            necessary: true, // Siempre true
            functional: preferences.functional || false,
            analytics: preferences.analytics || false,
            date: new Date().toISOString()
        };
        localStorage.setItem(COOKIE_NAME, JSON.stringify(data));
        return data;
    }
    
    // Crear overlay
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'cookie-overlay';
        overlay.id = 'cookieOverlay';
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // Crear banner principal
    function createBanner() {
        const overlay = createOverlay();
        
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-icon">🍪</div>
                
                <strong>Utilizamos cookies.</strong>
                
                <p>Utilizamos cookies para garantizar la mejor experiencia en nuestro sitio web. <a href="cookies.html" class="cookie-link" target="_blank">Consulta la política de cookies</a>.</p>
                
                <div class="cookie-buttons">
                    <button onclick="window.cookieManager.acceptAll()" class="cookie-btn cookie-btn-primary">
                        Permitir
                    </button>
                    <button onclick="window.cookieManager.openPreferences()" class="cookie-btn cookie-btn-secondary">
                        Personalizar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Mostrar con animación
        setTimeout(() => {
            overlay.classList.add('show');
            banner.classList.add('show');
        }, 300);
        
        return { banner, overlay };
    }
    
    // Crear modal de preferencias
    function createPreferencesModal() {
        const prefs = getPreferences();
        
        const modal = document.createElement('div');
        modal.className = 'cookie-preferences-modal';
        modal.id = 'cookiePreferencesModal';
        modal.innerHTML = `
            <div class="preferences-header">
                <h2>Configuración de Cookies</h2>
                <button onclick="window.cookieManager.closePreferences()" class="close-btn">×</button>
            </div>
            
            <div class="preferences-content">
                <div class="cookie-option">
                    <div class="cookie-option-header">
                        <h3>Cookies Necesarias <span class="required-badge">REQUERIDAS</span></h3>
                        <label class="toggle-switch">
                            <input type="checkbox" checked disabled>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <p>Estas cookies son esenciales para el funcionamiento del sitio. Incluyen seguridad (Cloudflare) y funcionalidades básicas.</p>
                </div>
                
                <div class="cookie-option">
                    <div class="cookie-option-header">
                        <h3>Cookies Funcionales</h3>
                        <label class="toggle-switch">
                            <input type="checkbox" id="functionalCookies" ${prefs?.functional ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <p>Permiten el chat de soporte (Tidio). También usamos almacenamiento local (sin rastreo) para tus preferencias de tema y favoritos.</p>
                </div>
                
                <div class="cookie-option">
                    <div class="cookie-option-header">
                        <h3>Cookies Analíticas</h3>
                        <label class="toggle-switch">
                            <input type="checkbox" id="analyticsCookies" ${prefs?.analytics ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <p>Nos ayudan a entender cómo usas el sitio para mejorarlo. Información recopilada de forma anónima.</p>
                </div>
            </div>
            
            <div class="preferences-footer">
                <button onclick="window.cookieManager.rejectAll()" class="cookie-btn cookie-btn-secondary">
                    Rechazar Todo
                </button>
                <button onclick="window.cookieManager.savePreferences()" class="cookie-btn cookie-btn-primary">
                    Guardar Preferencias
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    // Cerrar banner
    function closeBanner() {
        const banner = document.getElementById('cookieBanner');
        const overlay = document.getElementById('cookieOverlay');
        
        if (banner) {
            banner.classList.remove('show');
            overlay.classList.remove('show');
            
            setTimeout(() => {
                banner.remove();
                overlay.remove();
            }, 300);
        }
    }
    
    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cookie-notification';
        notification.innerHTML = `<span>✓</span> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }
    
    // Cargar servicios según preferencias
    function loadServices(preferences) {
        // Cargar Tidio (chat) si aceptó cookies funcionales
        if (preferences.functional) {
            loadTidioChat();
        }
        
        // Cargar Google Analytics si aceptó cookies analíticas
        if (preferences.analytics) {
            loadGoogleAnalytics();
        }
        
        console.log('🔧 Servicios cargados según preferencias:', preferences);
    }
    
    // Cargar Tidio Chat
    function loadTidioChat() {
        if (document.querySelector('script[src*="tidio"]')) {
            console.log('💬 Tidio ya está cargado');
            return;
        }
        
        setTimeout(function() {
            var script = document.createElement("script");
            script.src = "//code.tidio.co/kax9uycphdnmxhkjrlqanclvwweqsxzz.js";
            script.async = true;
            document.body.appendChild(script);
            console.log("💬 Tidio Chat cargado (cookies funcionales aceptadas)");
        }, 2000);
    }
    
    // Cargar Google Analytics
    function loadGoogleAnalytics() {
        if (window.gtag) {
            console.log('📊 Google Analytics ya está cargado');
            return;
        }
        
        const GA_MEASUREMENT_ID = 'G-CV6RG5X5P1';
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            'send_page_view': true,
            'anonymize_ip': true
        });
        
        console.log('📊 Google Analytics cargado (cookies analíticas aceptadas)');
    }

    // Gestor público de cookies
    window.cookieManager = {
        // Aceptar todas las cookies
        acceptAll: function() {
            const prefs = savePreferences({
                functional: true,
                analytics: true
            });
            closeBanner();
            showNotification('Todas las cookies han sido aceptadas');
            loadServices(prefs);
        },
        
        // Rechazar cookies opcionales
        rejectAll: function() {
            const prefs = savePreferences({
                functional: false,
                analytics: false
            });
            
            const modal = document.getElementById('cookiePreferencesModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
            
            closeBanner();
            showNotification('Solo cookies necesarias activadas');
            // No carga servicios opcionales
            console.log('⚠️ Servicios opcionales no cargados (rechazados por el usuario)');
        },
        
        // Abrir modal de preferencias
        openPreferences: function() {
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.remove('show');
            }
            
            const modal = createPreferencesModal();
            setTimeout(() => modal.classList.add('show'), 100);
        },
        
        // Cerrar modal de preferencias
        closePreferences: function() {
            const modal = document.getElementById('cookiePreferencesModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
            
            // Volver a mostrar el banner principal
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                setTimeout(() => banner.classList.add('show'), 100);
            }
        },
        
        // Guardar preferencias personalizadas
        savePreferences: function() {
            const functional = document.getElementById('functionalCookies')?.checked || false;
            const analytics = document.getElementById('analyticsCookies')?.checked || false;
            
            const prefs = savePreferences({
                functional: functional,
                analytics: analytics
            });
            
            const modal = document.getElementById('cookiePreferencesModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
            
            closeBanner();
            showNotification('Preferencias guardadas correctamente');
            loadServices(prefs);
        },
        
        // Resetear (para pruebas)
        reset: function() {
            localStorage.removeItem(COOKIE_NAME);
            location.reload();
        }
    };
    
    // Inicializar
    function init() {
        // Solo mostrar si no ha dado consentimiento
        if (!hasConsent()) {
            createBanner();
        } else {
            // Si ya dio consentimiento, cargar servicios según preferencias
            const prefs = getPreferences();
            if (prefs) {
                loadServices(prefs);
                console.log('✅ Preferencias previas detectadas, cargando servicios...');
            }
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
