// ========================================
// SISTEMA DE DONACIONES - JEIGHOST
// VERSIÓN CORREGIDA PARA MODO CLARO/OSCURO
// ========================================

// CONFIGURACIÓN - Cambia por tus datos reales
const DONATE_CONFIG = {
  paypal: {
    enabled: true,
    email: 'yeisongonzales070@gmail.com',
    link: 'https://www.paypal.me/Jeisongon'
  },
  crypto: {
    enabled: true,
    bitcoin: 'bc1qrsznker3dp6gr55x3et4gdmcpza3vmmk5ul8yf',
    ethereum: '0x24abBe06A87e7C2f51d622a269617BE0CAf26A25'
  },
  local: {
    enabled: true,
    nequi: '3126223512',
    daviplata: '3004910033'
  }
};

// Función para detectar el tema actual
function getCurrentTheme() {
  return document.body.getAttribute('data-theme') || 'dark';
}

// Función para obtener colores según el tema
function getThemeColors() {
  const theme = getCurrentTheme();
  if (theme === 'light') {
    return {
      modalBg: 'rgba(255, 255, 255, 0.98)',
      contentBg: 'linear-gradient(135deg, rgba(250,250,250,0.98), rgba(245,245,245,0.98))',
      headerBg: 'rgba(240,240,240,0.5)',
      text: '#2c2c2c',
      textSecondary: '#666',
      border: 'rgba(212,175,55,0.4)',
      methodBg: 'rgba(0,0,0,0.03)',
      methodBgHover: 'rgba(0,0,0,0.06)',
      dataBg: 'rgba(212,175,55,0.15)',
      overlay: 'rgba(0, 0, 0, 0.7)'
    };
  } else {
    return {
      modalBg: 'rgba(0, 0, 0, 0.9)',
      contentBg: 'linear-gradient(135deg, rgba(20,20,20,0.98), rgba(30,25,20,0.98))',
      headerBg: 'rgba(0,0,0,0.3)',
      text: '#f5e6d3',
      textSecondary: '#f5e6d3',
      border: 'rgba(212,175,55,0.5)',
      methodBg: 'rgba(255,255,255,0.03)',
      methodBgHover: 'rgba(255,255,255,0.06)',
      dataBg: 'rgba(212,175,55,0.08)',
      overlay: 'rgba(0, 0, 0, 0.85)'
    };
  }
}

// Abrir modal
function openDonateModal() {
  const existing = document.querySelector('.donate-modal');
  if (existing) existing.remove();

  const colors = getThemeColors();
  const modal = document.createElement('div');
  modal.className = 'donate-modal';
  
  let methodsHTML = '';

  if (DONATE_CONFIG.paypal.enabled) {
    methodsHTML += `
      <div class="donate-method" onclick="toggleDonateMethod(this)">
        <div class="donate-method-header">
          <div class="donate-icon">💳</div>
          <div class="donate-method-info">
            <h3>PayPal</h3>
            <p>Donación segura con PayPal</p>
          </div>
        </div>
        <div class="donate-method-details">
          <button class="donate-btn-action" onclick="window.open('${DONATE_CONFIG.paypal.link}', '_blank')">
            💳 Donar con PayPal
          </button>
        </div>
      </div>
    `;
  }

  if (DONATE_CONFIG.crypto.enabled) {
    methodsHTML += `
      <div class="donate-method" onclick="toggleDonateMethod(this)">
        <div class="donate-method-header">
          <div class="donate-icon">₿</div>
          <div class="donate-method-info">
            <h3>Criptomonedas</h3>
            <p>Bitcoin, Ethereum</p>
          </div>
        </div>
        <div class="donate-method-details">
          ${DONATE_CONFIG.crypto.bitcoin ? `
            <div class="donate-data">
              <span>${DONATE_CONFIG.crypto.bitcoin.substring(0, 25)}...</span>
              <button class="copy-btn" onclick="copyDonateData('${DONATE_CONFIG.crypto.bitcoin}', this)">Copiar BTC</button>
            </div>
          ` : ''}
          ${DONATE_CONFIG.crypto.ethereum ? `
            <div class="donate-data">
              <span>${DONATE_CONFIG.crypto.ethereum.substring(0, 25)}...</span>
              <button class="copy-btn" onclick="copyDonateData('${DONATE_CONFIG.crypto.ethereum}', this)">Copiar ETH</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  if (DONATE_CONFIG.local.enabled) {
    methodsHTML += `
      <div class="donate-method" onclick="toggleDonateMethod(this)">
        <div class="donate-method-header">
          <div class="donate-icon">🇨🇴</div>
          <div class="donate-method-info">
            <h3>Transferencia Local</h3>
            <p>Nequi, Daviplata</p>
          </div>
        </div>
        <div class="donate-method-details">
          ${DONATE_CONFIG.local.nequi ? `
            <div class="donate-data">
              <span>Nequi: ${DONATE_CONFIG.local.nequi}</span>
              <button class="copy-btn" onclick="copyDonateData('${DONATE_CONFIG.local.nequi}', this)">Copiar</button>
            </div>
          ` : ''}
          ${DONATE_CONFIG.local.daviplata ? `
            <div class="donate-data">
              <span>Daviplata: ${DONATE_CONFIG.local.daviplata}</span>
              <button class="copy-btn" onclick="copyDonateData('${DONATE_CONFIG.local.daviplata}', this)">Copiar</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="donate-modal-content">
      <button class="close-donate" onclick="closeDonateModal()">×</button>
      
      <div class="donate-header">
        <h2><span class="heart">💛</span> Apoyar el Proyecto</h2>
        <p>Tu apoyo me ayuda a seguir creando reflexiones y compartiendo conocimiento</p>
      </div>

      <div class="donate-methods">${methodsHTML}</div>

      <div class="thank-you-message">
        <p>Cada donación, sin importar el monto, es profundamente apreciada y me motiva a continuar.</p>
        <p class="signature">— Gracias por tu generosidad</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Aplicar colores dinámicamente
  applyDonateModalColors(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDonateModal();
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeDonateModal();
      document.removeEventListener('keydown', escHandler);
    }
  });

  setTimeout(() => modal.classList.add('show'), 50);
}

function applyDonateModalColors(modal) {
  const colors = getThemeColors();
  
  modal.style.background = colors.overlay;
  modal.style.backdropFilter = 'blur(10px)';
  
  const content = modal.querySelector('.donate-modal-content');
  if (content) {
    content.style.background = colors.contentBg;
    content.style.borderColor = colors.border;
  }
  
  const header = modal.querySelector('.donate-header');
  if (header) {
    header.style.background = colors.headerBg;
    header.style.borderColor = colors.border;
    
    const h2 = header.querySelector('h2');
    if (h2) h2.style.color = '#d4af37';
    
    const p = header.querySelector('p');
    if (p) p.style.color = colors.text;
  }
  
  const methods = modal.querySelectorAll('.donate-method');
  methods.forEach(method => {
    method.style.background = colors.methodBg;
    method.style.borderColor = colors.border;
    
    const h3 = method.querySelector('h3');
    if (h3) h3.style.color = '#d4af37';
    
    const p = method.querySelector('p');
    if (p) p.style.color = colors.textSecondary;
    
    method.addEventListener('mouseenter', () => {
      method.style.background = colors.methodBgHover;
    });
    method.addEventListener('mouseleave', () => {
      if (!method.classList.contains('active')) {
        method.style.background = colors.methodBg;
      }
    });
  });
  
  const dataBoxes = modal.querySelectorAll('.donate-data');
  dataBoxes.forEach(box => {
    box.style.background = colors.dataBg;
    const span = box.querySelector('span');
    if (span) span.style.color = colors.text;
  });
  
  const thankYou = modal.querySelector('.thank-you-message');
  if (thankYou) {
    thankYou.style.background = colors.headerBg;
    thankYou.style.borderColor = colors.border;
    
    const paragraphs = thankYou.querySelectorAll('p');
    paragraphs.forEach(p => {
      if (p.classList.contains('signature')) {
        p.style.color = '#d4af37';
      } else {
        p.style.color = colors.text;
      }
    });
  }
  
  const closeBtn = modal.querySelector('.close-donate');
  if (closeBtn) {
    closeBtn.style.borderColor = colors.border;
    closeBtn.style.color = '#d4af37';
  }
}

function closeDonateModal() {
  const modal = document.querySelector('.donate-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}

function toggleDonateMethod(element) {
  const colors = getThemeColors();
  
  document.querySelectorAll('.donate-method').forEach(m => {
    if (m !== element) {
      m.classList.remove('active');
      m.style.background = colors.methodBg;
    }
  });
  
  element.classList.toggle('active');
  if (element.classList.contains('active')) {
    element.style.background = colors.methodBgHover;
  } else {
    element.style.background = colors.methodBg;
  }
  
  event.stopPropagation();
}

function copyDonateData(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓ Copiado';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);

    showDonateNotification('Copiado al portapapeles');
  }).catch(() => {
    showDonateNotification('Error al copiar');
  });
  
  event.stopPropagation();
}

function showDonateNotification(message) {
  const existing = document.querySelector('.donate-notification');
  if (existing) existing.remove();

  const colors = getThemeColors();
  const notif = document.createElement('div');
  notif.className = 'donate-notification';
  notif.textContent = message;
  notif.style.background = colors.contentBg;
  notif.style.color = '#d4af37';
  notif.style.borderColor = colors.border;
  
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('show'), 10);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

console.log('💛 Sistema de donaciones cargado (compatible con modo claro/oscuro)');