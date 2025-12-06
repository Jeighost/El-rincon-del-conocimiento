// ========================================
// SISTEMA DE DONACIONES - JEIGHOST
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

// Abrir modal
function openDonateModal() {
  const existing = document.querySelector('.donate-modal');
  if (existing) existing.remove();

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
      <button class="close-donate" onclick="closeDonateModal()">✕</button>
      
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

function closeDonateModal() {
  const modal = document.querySelector('.donate-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}

function toggleDonateMethod(element) {
  document.querySelectorAll('.donate-method').forEach(m => {
    if (m !== element) m.classList.remove('active');
  });
  element.classList.toggle('active');
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

  const notif = document.createElement('div');
  notif.className = 'donate-notification';
  notif.textContent = message;
  
  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('show'), 10);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

console.log('💛 Sistema de donaciones cargado');