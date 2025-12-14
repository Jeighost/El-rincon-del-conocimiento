// Sistema Profesional de Cookies
// El Rincón del Conocimiento

(function() {
    'use strict';
    
    const COOKIE_NAME = 'cookieConsent';
    
    // Verificar si ya aceptó cookies
    function hasConsent() {
        return localStorage.getItem(COOKIE_NAME) !== null;
    }
    
    // Guardar consentimiento
    function saveConsent(type) {
        const data = {
            type: type,
            date: new Date().toISOString()
        };
        localStorage.setItem(COOKIE_NAME, JSON.stringify(data));
    }
    
    // Crear el banner
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-icon">🍪</div>
                
                <div class="cookie-text">
                    <strong>Valoramos tu privacidad</strong>
                    <p>Utilizamos cookies para mejorar tu experiencia, incluyendo Cloudflare (seguridad), Tidio (chat) y análisis. Puedes elegir qué cookies aceptar.</p>
                </div>
                
                <div class="cookie-buttons">
                    <button onclick="acceptCookies('necessary')" class="cookie-btn cookie-btn-secondary">
                        Solo Necesarias
                    </button>
                    <button onclick="acceptCookies('all')" class="cookie-btn cookie-btn-primary">
                        Aceptar Todas
                    </button>
                </div>
                
                <div class="cookie-links">
                    <a href="cookies.html" target="_blank">Política de Cookies</a>
                    <span>•</span>
                    <a href="privacidad.html" target="_blank">Política de Privacidad</a>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Mostrar con animación después de 500ms
        setTimeout(() => {
            banner.classList.add('show');
        }, 500);
    }
    
    // Cerrar banner
    function closeBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        }
    }
    
    // Aceptar cookies
    window.acceptCookies = function(type) {
        saveConsent(type);
        closeBanner();
        
        const message = type === 'all' 
            ? '✓ Todas las cookies aceptadas' 
            : '✓ Solo cookies necesarias activas';
        
        showNotification(message);
    };
    
    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cookie-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }
    
    // Resetear cookies (para pruebas)
    window.resetCookies = function() {
        localStorage.removeItem(COOKIE_NAME);
        location.reload();
    };
    
    // Iniciar
    function init() {
        if (!hasConsent()) {
            createBanner();
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
