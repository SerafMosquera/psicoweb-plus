// ============================================================
// webmail.js — Lógica compartida del Experimento 1: "W Mail"
// La MISMA lógica corre en Experimento A y Experimento B.
// Lo único que cambia entre A y B es el CSS (visual), no esto.
// Todo es 100% simulado: no se envía ni recibe nada real.
// ============================================================

const STORAGE_KEY = window.WEBMAIL_KEY || 'webmail_state_default';

// -------------------- Datos iniciales (seed) --------------------
function seedMessages() {
  return [
    {
      id: 'm1',
      from: 'Letterboxd',
      initial: 'L',
      color: '#2c3440',
      subject: 'Please validate your Letterboxd account',
      preview: 'Hola, gracias por registrarte en Letterboxd. Para activar tu cuenta necesitamos que confirmes tu correo...',
      body: 'Hola,\n\nGracias por crear una cuenta en Letterboxd. Antes de continuar, necesitamos que confirmes que esta dirección de correo te pertenece.\n\nHaz clic en el botón de abajo (simulado) para validar tu cuenta. Si no creaste esta cuenta, puedes ignorar este mensaje.\n\n— El equipo de Letterboxd',
      date: '16 Jul',
      folder: 'inbox',
      starred: false,
      read: false,
      attachments: []
    },
    {
      id: 'm2',
      from: 'Roblox',
      initial: 'R',
      color: '#e2231a',
      subject: 'Solicitud de inicio de sesión de Roblox',
      preview: 'Detectamos un intento de inicio de sesión en tu cuenta desde un dispositivo nuevo...',
      body: 'Hola,\n\nDetectamos un intento de inicio de sesión en tu cuenta de Roblox desde un dispositivo no reconocido.\n\nSi fuiste tú, no necesitas hacer nada. Si no reconoces esta actividad, te recomendamos cambiar tu contraseña de inmediato.\n\nDispositivo: Desconocido\nUbicación aproximada: Panamá\n\n— Equipo de Seguridad de Roblox',
      date: '17 Jul',
      folder: 'inbox',
      starred: false,
      read: false,
      attachments: []
    },
    {
      id: 'm3',
      from: 'Steam',
      initial: 'S',
      color: '#1b2838',
      subject: 'Codigo de verificacion de inicio de sesion',
      preview: 'Tu código de acceso de Steam Guard es: 4K7R2Q. Este código expira en 15 minutos...',
      body: 'Tu código de acceso de Steam Guard es:\n\n4K7R2Q\n\nEste código expira en 15 minutos y solo puede usarse una vez.\n\nSi no intentaste iniciar sesión, alguien más podría estar intentando acceder a tu cuenta. Te recomendamos revisar tu contraseña.\n\n— Steam Support',
      date: '18 Jul',
      folder: 'inbox',
      starred: false,
      read: false,
      attachments: []
    },
    {
      id: 'm4',
      from: 'Epic Games',
      initial: 'E',
      color: '#313131',
      subject: 'Codigo de verificacion de inicio de sesion',
      preview: 'Usa el siguiente código para verificar tu identidad e iniciar sesión en tu cuenta de Epic Games...',
      body: 'Hola,\n\nUsa el siguiente código para verificar tu identidad e iniciar sesión en tu cuenta de Epic Games:\n\n913-582\n\nEste código expira en 10 minutos. No compartas este código con nadie, ni siquiera con el soporte de Epic Games.\n\n— Epic Games',
      date: '19 Jul',
      folder: 'inbox',
      starred: false,
      read: false,
      attachments: []
    },
    {
      id: 'm5',
      from: 'Instagram',
      initial: 'I',
      color: '#c13584',
      subject: 'Codigo de verificacion de inicio de sesion',
      preview: 'Tu código de seguridad de Instagram es 208 461. No lo compartas con nadie...',
      body: 'Tu código de seguridad de Instagram es:\n\n208 461\n\nNo compartas este código con nadie. El personal de Instagram nunca te lo pedirá.\n\nSi no solicitaste este código, alguien puede estar tratando de acceder a tu cuenta de Instagram.\n\n— Instagram',
      date: '20 Jul',
      folder: 'inbox',
      starred: false,
      read: false,
      attachments: []
    }
  ];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const initial = { messages: seedMessages(), currentFolder: 'inbox', openMessageId: null };
  saveState(initial);
  return initial;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let pendingAttachments = []; // {name, size, url} para el modal de redactar

// -------------------- Utilidades --------------------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showToast(text) {
  let toast = document.getElementById('wmToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wmToast';
    toast.className = 'wm-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

// -------------------- Navegación de bandejas --------------------
function switchFolder(folder) {
  state.currentFolder = folder;
  state.openMessageId = null;
  saveState(state);
  render();
}

function getFolderMessages() {
  const q = (document.getElementById('wmSearch') || {}).value || '';
  const query = q.trim().toLowerCase();

  let list;
  if (state.currentFolder === 'starred') {
    list = state.messages.filter(m => m.starred);
  } else if (state.currentFolder === 'sent') {
    list = state.messages.filter(m => m.folder === 'sent');
  } else {
    list = state.messages.filter(m => m.folder === 'inbox');
  }

  if (query) {
    list = list.filter(m =>
      m.from.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.preview.toLowerCase().includes(query)
    );
  }
  return list;
}

function folderTitle() {
  if (state.currentFolder === 'starred') return 'Destacados';
  if (state.currentFolder === 'sent') return 'Enviados';
  return 'Recibidos';
}

// -------------------- Render --------------------
function render() {
  renderSidebarActive();
  renderBadge();

  const detailView = document.getElementById('wmDetail');
  const listView = document.getElementById('wmListView');

  if (state.openMessageId) {
    listView.style.display = 'none';
    detailView.style.display = 'block';
    renderDetail();
  } else {
    listView.style.display = 'block';
    detailView.style.display = 'none';
    renderList();
  }
}

function renderSidebarActive() {
  document.querySelectorAll('.folder-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.folder === state.currentFolder);
  });
}

function renderBadge() {
  const badge = document.getElementById('wmInboxBadge');
  if (!badge) return;
  const unread = state.messages.filter(m => m.folder === 'inbox' && !m.read).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

function renderList() {
  const titleEl = document.getElementById('wmViewTitle');
  if (titleEl) titleEl.textContent = folderTitle();

  const ul = document.getElementById('wmMessageList');
  const messages = getFolderMessages();

  if (messages.length === 0) {
    ul.innerHTML = `<li class="wm-empty">No hay mensajes en "${escapeHtml(folderTitle())}" por ahora.</li>`;
    return;
  }

  ul.innerHTML = messages.map(m => `
    <li class="wm-msg-row ${m.read ? '' : 'unread'}" data-id="${m.id}">
      <button class="wm-star-btn ${m.starred ? 'starred' : ''}" data-id="${m.id}" title="Destacar" aria-label="Destacar mensaje">
        <img src="images/icon_estrella.png" alt="Estrella" class="wm-star-icon">
      </button>
      <div class="wm-msg-avatar" style="background:${m.color}">${m.initial}</div>
      <div class="wm-msg-main">
        <span class="wm-msg-from">${escapeHtml(m.from)}</span>
        <span class="wm-msg-subject">${escapeHtml(m.subject)}</span>
      </div>
      <span class="wm-msg-date">${escapeHtml(m.date)}</span>
    </li>
  `).join('');

  ul.querySelectorAll('.wm-star-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStar(btn.dataset.id);
    });
  });

  ul.querySelectorAll('.wm-msg-row').forEach(row => {
    row.addEventListener('click', () => openMessage(row.dataset.id));
  });
}

function renderDetail() {
  const m = state.messages.find(x => x.id === state.openMessageId);
  if (!m) { state.openMessageId = null; render(); return; }

  document.getElementById('wmDetailFrom').textContent = m.from;
  document.getElementById('wmDetailAvatar').textContent = m.initial;
  document.getElementById('wmDetailAvatar').style.background = m.color;
  document.getElementById('wmDetailSubject').textContent = m.subject;
  document.getElementById('wmDetailDate').textContent = m.date;
  document.getElementById('wmDetailBody').textContent = m.body;

  const starBtn = document.getElementById('wmDetailStar');
  starBtn.classList.toggle('starred', m.starred);
  starBtn.dataset.id = m.id;

  const attWrap = document.getElementById('wmDetailAttachments');
  if (m.attachments && m.attachments.length) {
    attWrap.style.display = 'flex';
    attWrap.innerHTML = m.attachments.map(a => `
      <div class="wm-attachment-chip">
        ${a.url ? `<img src="${a.url}" alt="${escapeHtml(a.name)}">` : '📎'}
        <span>${escapeHtml(a.name)}</span>
      </div>
    `).join('');
  } else {
    attWrap.style.display = 'none';
    attWrap.innerHTML = '';
  }
}

function openMessage(id) {
  const m = state.messages.find(x => x.id === id);
  if (!m) return;
  m.read = true;
  state.openMessageId = id;
  saveState(state);
  render();
}

function backToList() {
  state.openMessageId = null;
  saveState(state);
  render();
}

function toggleStar(id) {
  const m = state.messages.find(x => x.id === id);
  if (!m) return;
  m.starred = !m.starred;
  saveState(state);
  render();
}

// -------------------- Redactar / Enviar --------------------
function openCompose() {
  pendingAttachments = [];
  document.getElementById('wmComposeTo').value = '';
  document.getElementById('wmComposeSubject').value = '';
  document.getElementById('wmComposeBody').value = '';
  renderPendingAttachments();
  document.getElementById('wmComposeOverlay').classList.add('open');
  document.getElementById('wmComposeTo').focus();
}

function closeCompose() {
  document.getElementById('wmComposeOverlay').classList.remove('open');
}

function handleFileAttach(e) {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    const isImage = file.type.startsWith('image/');
    const item = { name: file.name, size: file.size, url: null };
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        item.url = ev.target.result;
        renderPendingAttachments();
      };
      reader.readAsDataURL(file);
    }
    pendingAttachments.push(item);
  });
  renderPendingAttachments();
  e.target.value = '';
}

function renderPendingAttachments() {
  const wrap = document.getElementById('wmPendingAttachments');
  if (!wrap) return;
  if (pendingAttachments.length === 0) {
    wrap.innerHTML = '';
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'flex';
  wrap.innerHTML = pendingAttachments.map((a, idx) => `
    <div class="wm-attachment-chip">
      ${a.url ? `<img src="${a.url}" alt="${escapeHtml(a.name)}">` : '📎'}
      <span>${escapeHtml(a.name)} <small>(${formatSize(a.size)})</small></span>
      <button type="button" class="wm-remove-att" data-idx="${idx}" aria-label="Quitar adjunto">✕</button>
    </div>
  `).join('');
  wrap.querySelectorAll('.wm-remove-att').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingAttachments.splice(Number(btn.dataset.idx), 1);
      renderPendingAttachments();
    });
  });
}

function sendMessage(e) {
  e.preventDefault();
  const to = document.getElementById('wmComposeTo').value.trim() || '(sin destinatario)';
  const subject = document.getElementById('wmComposeSubject').value.trim() || '(sin asunto)';
  const body = document.getElementById('wmComposeBody').value.trim() || '(sin contenido)';

  const newMsg = {
    id: 'm' + Date.now(),
    from: 'Para: ' + to,
    initial: 'Y',
    color: '#4b6b8f',
    subject: subject,
    preview: body.slice(0, 80),
    body: body,
    date: 'Hoy',
    folder: 'sent',
    starred: false,
    read: true,
    attachments: pendingAttachments.map(a => ({ name: a.name, url: a.url }))
  };

  state.messages.unshift(newMsg);
  saveState(state);
  closeCompose();
  switchFolder('sent');
  showToast('Mensaje enviado ✓ (simulado)');
}

// -------------------- Tracking para resultados.html --------------------
function getExperimentLabel() {
  return (window.WEBMAIL_KEY || '').endsWith('_b') ? 'B' : 'A';
}

function trackEntry() {
  const label = getExperimentLabel();
  if (!sessionStorage.getItem('wm_entry_' + label)) {
    sessionStorage.setItem('wm_entry_' + label, String(Date.now()));
  }
}

function trackExitAndSave() {
  const label = getExperimentLabel();
  const entry = Number(sessionStorage.getItem('wm_entry_' + label)) || Date.now();
  const tiempoMs = Date.now() - entry;

  const resultado = {
    experimento: label,
    tiempoMs: tiempoMs,
    mensajesAbiertos: state.messages.filter(m => m.folder === 'inbox' && m.read).length,
    destacados: state.messages.filter(m => m.starred).length,
    enviados: state.messages.filter(m => m.folder === 'sent').length,
    fecha: new Date().toISOString()
  };

  let historial = [];
  try { historial = JSON.parse(localStorage.getItem('resultadosWebmail')) || []; } catch (e) {}
  historial.push(resultado);
  localStorage.setItem('resultadosWebmail', JSON.stringify(historial));
}

// -------------------- Cronómetro en tiempo real --------------------
function startCountdown() {
  const timerEl = document.getElementById('wmTimer');
  const nextBtn = document.querySelector('.wm-next-btn');
  if (!timerEl || !nextBtn) return;

  const DURATION_SEG = 3 * 60; // 3 minutos
  let remaining = DURATION_SEG;
  let interval = null;

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerEl.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;
  }

  function finish() {
    clearInterval(interval);
    trackExitAndSave();
    window.location.href = nextBtn.getAttribute('href');
  }

  render();
  interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      render();
      finish();
      return;
    }
    render();
  }, 1000);
}

// -------------------- Inicialización --------------------
function initWebmail() {
  trackEntry();
  render();
  startCountdown();

  document.querySelectorAll('.folder-btn').forEach(btn => {
    btn.addEventListener('click', () => switchFolder(btn.dataset.folder));
  });

  document.getElementById('wmComposeBtn').addEventListener('click', openCompose);
  document.getElementById('wmCloseCompose').addEventListener('click', closeCompose);
  document.getElementById('wmDiscardCompose').addEventListener('click', closeCompose);
  document.getElementById('wmComposeForm').addEventListener('submit', sendMessage);
  document.getElementById('wmFileInput').addEventListener('change', handleFileAttach);
  document.getElementById('wmBackBtn').addEventListener('click', backToList);
  document.getElementById('wmDetailStar').addEventListener('click', (e) => {
    toggleStar(e.currentTarget.dataset.id);
  });
  document.getElementById('wmSearch').addEventListener('input', () => render());

  document.getElementById('wmComposeOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'wmComposeOverlay') closeCompose();
  });

  document.querySelectorAll('.wm-next-btn').forEach(btn => {
    btn.addEventListener('click', trackExitAndSave);
  });
}

document.addEventListener('DOMContentLoaded', initWebmail);
