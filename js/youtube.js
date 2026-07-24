// ================================================
// youtube.js — Lógica completa YouTube A y B
// ================================================

(function () {

  /* ── TIMER 3 MINUTOS ── */
  const DURATION    = 3 * 60; // 3 minutos en segundos
  let   timeLeft    = DURATION;
  const timerEl     = document.getElementById('timer-display');
  const timerBanner = document.getElementById('timer-banner');

  const timerInterval = setInterval(function () {
    timeLeft--;
    var m = Math.floor(timeLeft / 60);
    var s = timeLeft % 60;
    if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    if (timeLeft <= 30 && timerBanner) timerBanner.classList.add('warning');
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      var modal = document.getElementById('end-modal');
      if (modal) modal.style.display = 'flex';
    }
  }, 1000);

  /* ── BOTÓN ELEGANTE: FINALIZAR EXPERIMENTO ── */
  if (timerBanner) {
    var finishBtn = document.createElement('button');
    finishBtn.id = 'finish-experiment-btn';
    finishBtn.textContent = 'Finalizar experimento →';
    
    // Estilos inline elegantes para el botón
    finishBtn.style.marginLeft = '15px';
    finishBtn.style.padding = '6px 14px';
    finishBtn.style.backgroundColor = '#cc0000';
    finishBtn.style.color = '#ffffff';
    finishBtn.style.border = 'none';
    finishBtn.style.borderRadius = '20px';
    finishBtn.style.fontSize = '12px';
    finishBtn.style.fontWeight = '600';
    finishBtn.style.cursor = 'pointer';
    finishBtn.style.transition = 'background-color 0.2s, transform 0.1s';
    finishBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Efectos hover
    finishBtn.addEventListener('mouseenter', function () {
      finishBtn.style.backgroundColor = '#990000';
      finishBtn.style.transform = 'scale(1.03)';
    });
    finishBtn.addEventListener('mouseleave', function () {
      finishBtn.style.backgroundColor = '#cc0000';
      finishBtn.style.transform = 'scale(1)';
    });

    // Acción al hacer clic: Redirigir a la Variable B
    finishBtn.addEventListener('click', function () {
      guardarInteraccion('finalizar_experimento', 'Manual -> Variable B');
      window.location.href = 'youtube-b.html'; // Cambia el archivo aquí si tu HTML de la variable B tiene otro nombre
    });

    timerBanner.appendChild(finishBtn);
  }

  /* ── PORTADA → PLAYER ── */
  var thumbWrapper  = document.getElementById('thumbnail-wrapper');
  var playerWrapper = document.getElementById('player-wrapper');
  var video         = document.getElementById('yt-video');
  var playBigBtn    = document.getElementById('play-big-btn');

  if (playBigBtn && thumbWrapper && playerWrapper && video) {
    playBigBtn.addEventListener('click', function () {
      thumbWrapper.style.display  = 'none';
      playerWrapper.style.display = 'block';
      video.play();
      updatePlayBtn();
    });
  }

  /* ── CONTROLES DEL VIDEO ── */
  var playPauseBtn = document.getElementById('play-pause-btn');
  var rewindBtn    = document.getElementById('rewind-btn');
  var forwardBtn   = document.getElementById('forward-btn');
  var muteBtn      = document.getElementById('mute-btn');
  var volumeInput  = document.getElementById('volume-input');
  var progressFill = document.getElementById('progress-fill');
  var progressInput= document.getElementById('progress-input');
  var timeDisplay  = document.getElementById('time-display');
  var fullscreenBtn= document.getElementById('fullscreen-btn');
  var controls     = document.getElementById('yt-controls');

  // Play / Pausa
  if (playPauseBtn && video) {
    playPauseBtn.addEventListener('click', function () {
      if (video.paused) { video.play(); } else { video.pause(); }
      updatePlayBtn();
    });
  }

  function updatePlayBtn() {
    if (!playPauseBtn || !video) return;
    playPauseBtn.textContent = video.paused ? '▶' : '⏸';
  }

  if (video) {
    video.addEventListener('pause', updatePlayBtn);
    video.addEventListener('play',  updatePlayBtn);

    // Retroceder 10s
    if (rewindBtn) {
      rewindBtn.addEventListener('click', function () {
        video.currentTime = Math.max(0, video.currentTime - 10);
      });
    }

    // Adelantar 10s
    if (forwardBtn) {
      forwardBtn.addEventListener('click', function () {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
      });
    }

    // Silenciar / activar
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    // Volumen
    if (volumeInput) {
      volumeInput.addEventListener('input', function () {
        video.volume = parseFloat(volumeInput.value);
        video.muted  = (video.volume === 0);
        if (muteBtn) muteBtn.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    // Progreso — actualizar barra mientras avanza
    video.addEventListener('timeupdate', function () {
      if (!video.duration) return;
      var pct = (video.currentTime / video.duration) * 100;
      if (progressFill)  progressFill.style.width = pct + '%';
      if (progressInput) progressInput.value       = pct;
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      }
    });

    // Cuando el video cargó metadata actualiza el input max
    video.addEventListener('loadedmetadata', function () {
      if (progressInput) progressInput.max = 100;
    });

    // Scrubbing con la barra de progreso
    if (progressInput) {
      progressInput.addEventListener('input', function () {
        if (!video.duration) return;
        video.currentTime = (parseFloat(progressInput.value) / 100) * video.duration;
      });
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  // Pantalla completa
  if (fullscreenBtn && playerWrapper) {
    fullscreenBtn.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        playerWrapper.requestFullscreen().catch(function () {});
      } else {
        document.exitFullscreen();
      }
    });
  }

  // Mostrar controles al hover o click
  if (playerWrapper && controls && video) {
    playerWrapper.addEventListener('mouseenter', function () { controls.classList.add('visible'); });
    playerWrapper.addEventListener('mouseleave', function () { controls.classList.remove('visible'); });
    playerWrapper.addEventListener('click', function (e) {
      if (e.target === video) {
        if (video.paused) { video.play(); } else { video.pause(); }
        updatePlayBtn();
      }
    });
  }

  /* ── LIKE / DISLIKE ── */
  var likeBtn      = document.getElementById('like-btn');
  var dislikeBtn   = document.getElementById('dislike-btn');
  var likeCount    = document.getElementById('like-count');
  var dislikeCount = document.getElementById('dislike-count');

  var likesBase    = 1200;
  var dislikesBase = 34;
  var liked        = false;
  var disliked     = false;

  if (likeBtn) {
    likeBtn.addEventListener('click', function () {
      if (!liked) {
        liked = true; disliked = false;
        likesBase++;
        likeBtn.classList.add('liked');
        if (dislikeBtn) dislikeBtn.classList.remove('disliked');
        if (dislikeCount) dislikeCount.textContent = dislikesBase;
      } else {
        liked = false;
        likesBase--;
        likeBtn.classList.remove('liked');
      }
      if (likeCount) likeCount.textContent = formatCount(likesBase);
      guardarInteraccion('like', liked);
    });
  }

  if (dislikeBtn) {
    dislikeBtn.addEventListener('click', function () {
      if (!disliked) {
        disliked = true; liked = false;
        dislikesBase++;
        dislikeBtn.classList.add('disliked');
        if (likeBtn) likeBtn.classList.remove('liked');
        likesBase = Math.max(0, likesBase - (liked ? 1 : 0));
        if (likeCount) likeCount.textContent = formatCount(likesBase);
      } else {
        disliked = false;
        dislikesBase--;
        dislikeBtn.classList.remove('disliked');
      }
      if (dislikeCount) dislikeCount.textContent = dislikesBase;
      guardarInteraccion('dislike', disliked);
    });
  }

  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  /* ── SUSCRIBIRSE ── */
  var subscribeBtn = document.getElementById('subscribe-btn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function () {
      subscribeBtn.classList.toggle('subscribed');
      subscribeBtn.textContent = subscribeBtn.classList.contains('subscribed')
        ? 'Suscrito ✓' : 'Suscribirse';
      guardarInteraccion('suscripcion', subscribeBtn.classList.contains('subscribed'));
    });
  }

  /* ── DESCRIPCIÓN EXPANDIBLE ── */
  window.toggleDesc = function () {
    var short = document.getElementById('desc-short');
    var full  = document.getElementById('desc-full');
    if (!short || !full) return;
    if (full.style.display === 'none') {
      short.style.display = 'none';
      full.style.display  = 'block';
    } else {
      short.style.display = 'block';
      full.style.display  = 'none';
    }
  };

  /* ── COMENTARIOS ── */
  var STORAGE_KEY  = 'psicoweb_comments';
  var commentsList = document.getElementById('comments-list');
  var commentInput = document.getElementById('comment-input');
  var commentActions = document.getElementById('comment-actions');
  var commentCount = document.getElementById('comment-count');

  var defaultComments = [
    {
      user: 'Lily Chou Chou',
      avatar: 'images/icon_perfil.jpg',
      text: 'Una de mis películas favoritas de todos los tiempos. La música es perfecta.',
      date: 'hace 2 años'
    },
    {
      user: 'Usuario Anónimo',
      avatar: 'images/icon_perfil.jpg',
      text: 'El director captura algo muy especial en estos planos. Gracias por subtitular.',
      date: 'hace 8 meses'
    }
  ];

  function loadComments() {
    var saved = localStorage.getItem(STORAGE_KEY);
    var comments = saved ? JSON.parse(saved) : [];
    var all = defaultComments.concat(comments);
    renderComments(all);
  }

  function renderComments(list) {
    if (!commentsList) return;
    if (commentCount) commentCount.textContent = list.length;
    commentsList.innerHTML = list.map(function (c) {
      return '<div class="yt-comment-item">' +
        '<img src="' + c.avatar + '" class="yt-comment-user-avatar" alt="avatar"/>' +
        '<div class="yt-comment-body">' +
          '<div class="yt-comment-username">' + escapeHtml(c.user) +
            '<span class="yt-comment-date">' + escapeHtml(c.date) + '</span>' +
          '</div>' +
          '<p class="yt-comment-text">' + escapeHtml(c.text) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (commentInput) {
    commentInput.addEventListener('focus', function () {
      if (commentActions) commentActions.style.display = 'flex';
    });
  }

  window.cancelComment = function () {
    if (commentInput)   commentInput.value = '';
    if (commentActions) commentActions.style.display = 'none';
  };

  window.submitComment = function () {
    var text = commentInput ? commentInput.value.trim() : '';
    if (!text) return;

    var newComment = {
      user:   'Tú',
      avatar: 'images/icon_perfil.jpg',
      text:   text,
      date:   'ahora mismo'
    };

    var saved    = localStorage.getItem(STORAGE_KEY);
    var existing = saved ? JSON.parse(saved) : [];
    existing.push(newComment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    if (commentInput)   commentInput.value = '';
    if (commentActions) commentActions.style.display = 'none';
    loadComments();
  };

  /* ── GUARDAR INTERACCIONES ── */
  function guardarInteraccion(tipo, valor) {
    var key  = 'psicoweb_interacciones';
    var data = localStorage.getItem(key);
    var list = data ? JSON.parse(data) : [];
    list.push({
      tipo:     tipo,
      valor:    valor,
      variante: document.body.dataset.variant || 'A',
      fecha:    new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(list));
  }

  // Cargar comentarios
  loadComments();

})();