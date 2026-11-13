/*
 * Portafolio — lógica de la página
 * Autor: fo-kin12
 */
(function () {
    'use strict';

    /* =====================================================
       ✏️ EDITA AQUÍ TUS DATOS (se actualizan en toda la página)
       ===================================================== */
    const CONFIG = {
        nombre: 'Michael López',
        rol: 'Desarrollador de Software & Programador',
        ciudad: 'Medellín',
        pais: 'Colombia',
        email: 'tucorreo@ejemplo.com',
        whatsapp: '573000000000',           // solo números, con 57 adelante
        whatsappTexto: '+57 300 000 0000',
        github: 'https://github.com/fo-kin12',
        githubTexto: 'github.com/fo-kin12',
        githubUser: 'fo-kin12',             // tu usuario de GitHub: de aquí salen los repos
        reposOcultos: ['trabajofinal'],     // repos que NO quieres mostrar en la página
        sitio: 'https://fo-kin12.github.io/pagina-personal/', // link donde está publicada esta página
        linkedin: 'https://www.linkedin.com/in/tu-usuario',
        linkedinTexto: 'linkedin.com/in/tu-usuario',
        archivo: 'michael-lopez-portafolio'
    };

    const SKILLS = [
        { id: 'javascript', nombre: 'JavaScript (ES6+)', nivel: 88, icon: 'fa-brands fa-js', bar: 'from-amber-400 to-yellow-300', text: 'text-amber-400',
          detalle: 'Interfaces interactivas y Web APIs modernas del navegador.', items: ['DOM', 'Canvas API', 'BroadcastChannel', 'Fetch / async-await', 'LocalStorage', 'Módulos ES'] },
        { id: 'python', nombre: 'Python', nivel: 80, icon: 'fa-brands fa-python', bar: 'from-sky-400 to-cyan-300', text: 'text-sky-400',
          detalle: 'Automatización de tareas, scripts y procesamiento de datos.', items: ['Scripts', 'Automatización', 'Manejo de archivos', 'APIs REST', 'Análisis de logs'] },
        { id: 'ciberseguridad', nombre: 'Ciberseguridad', nivel: 72, icon: 'fa-solid fa-shield-halved', bar: 'from-emerald-400 to-green-300', text: 'text-emerald-400',
          detalle: 'Seguridad defensiva aplicada al desarrollo.', items: ['OWASP Top 10', 'Validación de datos', 'Hardening', 'Gestión de contraseñas', 'Redes básicas'] },
        { id: 'htmlcss', nombre: 'HTML5, CSS3 & Tailwind', nivel: 90, icon: 'fa-brands fa-html5', bar: 'from-orange-400 to-pink-400', text: 'text-orange-400',
          detalle: 'Maquetación responsive, accesible y pensada para móvil.', items: ['Responsive', 'Flexbox / Grid', 'Tailwind CSS', 'Accesibilidad', 'Modo oscuro'] },
        { id: 'git', nombre: 'Git & GitHub', nivel: 78, icon: 'fa-brands fa-git-alt', bar: 'from-red-400 to-orange-300', text: 'text-red-400',
          detalle: 'Control de versiones y trabajo colaborativo.', items: ['Ramas', 'Pull requests', 'GitHub Pages', 'Buenas prácticas de commits'] },
        { id: 'linux', nombre: 'Linux & Bash', nivel: 70, icon: 'fa-brands fa-linux', bar: 'from-slate-300 to-slate-100', text: 'text-slate-300',
          detalle: 'Terminal, permisos y administración básica de servidores.', items: ['Terminal', 'Permisos', 'SSH', 'Scripts Bash'] },
        { id: 'sql', nombre: 'SQL & Bases de datos', nivel: 65, icon: 'fa-solid fa-database', bar: 'from-indigo-400 to-violet-300', text: 'text-indigo-400',
          detalle: 'Diseño y consulta de bases de datos relacionales.', items: ['Consultas', 'Relaciones', 'SQLite', 'MySQL'] }
    ];

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    let IN_FRAME = false;
    try { IN_FRAME = window.self !== window.top; } catch (e) { IN_FRAME = true; }

    /* ---------- Capacidad de descargas (cuando la página está publicada en Claude) ---------- */
    let downloadsApi = null;
    if (window.claude && typeof window.claude.use === 'function') {
        window.claude.use('downloads').then(api => { downloadsApi = api; }).catch(() => {});
    }

    /* ---------- Datos de CONFIG en la página ---------- */
    function applyConfig() {
        $$('[data-cfg]').forEach(el => { const k = el.dataset.cfg; if (CONFIG[k]) el.textContent = CONFIG[k]; });
        $$('[data-cfg-href]').forEach(el => {
            const k = el.dataset.cfgHref;
            if (k === 'email') el.href = 'mailto:' + CONFIG.email;
            else if (k === 'whatsapp') el.href = 'https://wa.me/' + CONFIG.whatsapp;
            else if (CONFIG[k]) el.href = CONFIG[k];
        });
        const y = $('#yearNow'); if (y) y.textContent = new Date().getFullYear();
    }

    /* ---------- Toasts y barra de estado ---------- */
    function showToast(msg, type = 'ok') {
        const c = $('#toastContainer'); if (!c) return;
        const colors = { ok: 'border-emerald-500/50 text-emerald-300', info: 'border-cyan-500/50 text-cyan-300', warn: 'border-amber-500/50 text-amber-300' };
        const t = document.createElement('div');
        t.className = 'toast-in pointer-events-auto max-w-sm px-4 py-3 rounded-xl bg-slate-950/95 border shadow-xl font-mono text-xs ' + (colors[type] || colors.ok);
        t.textContent = msg;
        c.appendChild(t);
        setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 450); }, 3800);
    }
    function showStatus(msg) {
        const bar = $('#actionStatusFeedback'), txt = $('#actionStatusText');
        if (bar && txt) { txt.textContent = msg; bar.classList.remove('hidden'); }
        showToast(msg, 'info');
    }

    /* ---------- Copiar al portapapeles ---------- */
    async function copyText(text) {
        try { await navigator.clipboard.writeText(text); return true; } catch (e) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                const ok = document.execCommand('copy'); ta.remove(); return ok;
            } catch (e2) { return false; }
        }
    }
    window.copyConfig = async function (key) {
        const ok = await copyText(CONFIG[key] || '');
        showToast(ok ? '✔ Copiado: ' + CONFIG[key] : 'No se pudo copiar. Mantén presionado el texto para copiarlo.', ok ? 'ok' : 'warn');
    };

    /* ---------- Generar el archivo HTML limpio ---------- */
    // Convierte los CSS y JS del proyecto en código dentro del HTML,
    // para que el archivo descargado funcione solo, sin las demás carpetas.
    async function inlineAssets(root) {
        const nodes = Array.from(root.querySelectorAll('link[data-inline], script[data-inline]'));
        for (const n of nodes) {
            const url = n.getAttribute('href') || n.getAttribute('src');
            let code = '';
            try { const r = await fetch(url, { cache: 'no-cache' }); if (r.ok) code = await r.text(); } catch (e) { code = ''; }
            if (!code) continue; // sin acceso al archivo (p. ej. abierto como file://): se deja el enlace
            if (n.tagName === 'LINK') {
                const st = document.createElement('style');
                st.id = n.getAttribute('data-inline');
                st.textContent = code.replace(/<\/style/gi, '<\\/style');
                n.replaceWith(st);
            } else {
                const sc = document.createElement('script');
                sc.setAttribute('data-ml', '');
                sc.textContent = code.replace(/<\/script/gi, '<\\/script');
                n.replaceWith(sc);
            }
        }
    }

    async function buildExportHTML() {
        const root = document.documentElement.cloneNode(true);
        await inlineAssets(root);
        root.className = 'dark scroll-smooth';
        root.querySelectorAll('style:not(#ml-styles):not(#tw-styles), script:not([data-ml]), link:not([data-ml]), meta[http-equiv], base, iframe').forEach(n => n.remove());
        const body = root.querySelector('body');
        Array.from(body.children).forEach(c => { if (!c.hasAttribute('data-ml')) c.remove(); });
        body.removeAttribute('style');
        root.querySelectorAll('svg.svg-inline--fa').forEach(n => n.remove());
        root.querySelectorAll('[data-fa-i2svg]').forEach(n => n.removeAttribute('data-fa-i2svg'));
        const banner = root.querySelector('#ownerExportBanner'); if (banner) banner.remove();
        root.querySelectorAll('.reveal.active').forEach(n => n.classList.remove('active'));
        root.querySelectorAll('.skill-bar-fill').forEach(n => { n.style.width = '0%'; });
        const reset = (sel, fn) => { const n = root.querySelector(sel); if (n) fn(n); };
        reset('#toastContainer', n => { n.innerHTML = ''; });
        reset('#terminalOutput', n => { n.innerHTML = ''; });
        reset('#downloadModal', n => n.classList.add('hidden'));
        reset('#mobileMenu', n => n.classList.add('hidden'));
        reset('#cfResult', n => n.classList.add('hidden'));
        reset('#themeIconWrap', n => { n.innerHTML = '<i class="fa-solid fa-sun text-amber-400"></i>'; });
        reset('#mobileMenuIconWrap', n => { n.innerHTML = '<i class="fa-solid fa-bars"></i>'; });
        root.querySelectorAll('[data-count]').forEach(n => { n.textContent = '0'; });
        return '<!DOCTYPE html>\n' + root.outerHTML;
    }

    function blobDownload(content, filename, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    }

    async function saveViaClaude(filename, data) {
        if (!downloadsApi) return false;
        try {
            await downloadsApi.save({ filename, data });
            showStatus('✔ Archivo listo: ' + filename);
            return true;
        } catch (err) {
            const code = err && err.code;
            if (code === 'declined') { showToast('Descarga cancelada.', 'warn'); return true; }
            if (code === 'rate_limited') { showToast('Espera un momento e inténtalo de nuevo.', 'warn'); return true; }
            return false;
        }
    }

    window.downloadPortfolioHTML = async function () {
        const filename = CONFIG.archivo + '.html';
        const html = await buildExportHTML();
        if (IN_FRAME) {
            if (await saveViaClaude(filename, html)) return;
            showStatus('Aquí no se permite descargar. Usa el botón de compartir de Claude para copiar el enlace.');
            return;
        }
        try {
            blobDownload(html, filename, 'text/html;charset=utf-8');
            showStatus('✔ Descargando ' + filename + ' — en iPhone búscalo en la app Archivos.');
        } catch (e) {
            showStatus('No se pudo descargar en este navegador. Prueba desde Safari o Chrome.');
        }
    };

    window.sharePortfolioNative = async function () {
        const title = CONFIG.nombre + ' | ' + CONFIG.rol;
        const text = 'Mira el portafolio de ' + CONFIG.nombre + ', ' + CONFIG.rol + ' en ' + CONFIG.ciudad + '.';
        const isWeb = /^https?:/.test(location.protocol);

        if (!IN_FRAME && navigator.share) {
            try {
                if (isWeb) { await navigator.share({ title, text, url: location.href }); showStatus('✔ Compartido.'); return; }
                const file = new File([await buildExportHTML()], CONFIG.archivo + '.html', { type: 'text/html' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ title, text, files: [file] }); showStatus('✔ Archivo compartido.'); return;
                }
            } catch (e) {
                if (e && e.name === 'AbortError') return;
            }
        }
        if (!IN_FRAME && isWeb) {
            const ok = await copyText(location.href);
            if (ok) { showStatus('✔ Enlace copiado. Pégalo en WhatsApp, correo o redes.'); return; }
        }
        if (IN_FRAME) {
            const ok = await copyText(text + '\n' + CONFIG.email + ' · ' + CONFIG.whatsappTexto);
            showStatus((ok ? '✔ Presentación copiada. ' : '') + 'Para enviar la página, usa el botón Compartir de Claude o descarga el .HTML.');
            return;
        }
        window.downloadPortfolioHTML();
    };

    function buildVCard() {
        const parts = CONFIG.nombre.split(' ');
        const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
        return [
            'BEGIN:VCARD', 'VERSION:3.0',
            'N:' + last + ';' + parts[0] + ';;;',
            'FN:' + CONFIG.nombre,
            'TITLE:' + CONFIG.rol,
            'EMAIL;TYPE=INTERNET:' + CONFIG.email,
            'TEL;TYPE=CELL:+' + CONFIG.whatsapp,
            'ADR;TYPE=WORK:;;;' + CONFIG.ciudad + ';;;' + CONFIG.pais,
            'URL:' + CONFIG.github,
            'URL:' + CONFIG.linkedin,
            'END:VCARD'
        ].join('\r\n');
    }

    window.downloadVCardContact = async function () {
        const vcf = buildVCard();
        if (IN_FRAME) {
            const ok = await copyText(CONFIG.nombre + '\n' + CONFIG.rol + '\n' + CONFIG.email + '\n' + CONFIG.whatsappTexto + '\n' + CONFIG.github);
            showStatus((ok ? '✔ Datos de contacto copiados. ' : '') + 'El archivo .VCF funciona al abrir la página descargada.');
            return;
        }
        try {
            blobDownload(vcf, CONFIG.archivo + '.vcf', 'text/vcard;charset=utf-8');
            showStatus('✔ Contacto descargado. En iPhone ábrelo y toca "Crear contacto nuevo".');
        } catch (e) {
            showStatus('No se pudo descargar el contacto en este navegador.');
        }
    };

    /* ---------- Modal ---------- */
    window.openDownloadModal = function () {
        $('#downloadModal').classList.remove('hidden');
        $('#mobileMenu').classList.add('hidden');
        setMobileIcon(false);
        document.body.style.overflow = 'hidden';
    };
    window.closeDownloadModal = function () {
        $('#downloadModal').classList.add('hidden');
        document.body.style.overflow = '';
    };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeDownloadModal(); });

    /* ---------- Tema claro / oscuro ---------- */
    function setTheme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        $('#themeIconWrap').innerHTML = dark ? '<i class="fa-solid fa-sun text-amber-400"></i>' : '<i class="fa-solid fa-moon text-indigo-500"></i>';
        try { localStorage.setItem('ml-theme', dark ? 'dark' : 'light'); } catch (e) {}
    }
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('ml-theme'); } catch (e) {}
    setTheme(savedTheme ? savedTheme === 'dark' : true);
    $('#themeToggleBtn').addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));

    /* ---------- Menú móvil ---------- */
    function setMobileIcon(open) {
        $('#mobileMenuIconWrap').innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    }
    $('#mobileMenuBtn').addEventListener('click', () => {
        const m = $('#mobileMenu');
        const open = m.classList.toggle('hidden') === false;
        setMobileIcon(open);
    });
    $$('.mobile-nav-link').forEach(a => a.addEventListener('click', () => { $('#mobileMenu').classList.add('hidden'); setMobileIcon(false); }));

    /* ---------- Skills ---------- */
    let activeSkill = 'javascript';
    function renderSkills() {
        $('#skillsList').innerHTML = SKILLS.map(s => `
            <button type="button" data-skill="${s.id}" class="skill-btn w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4 hover:border-cyan-500/50 transition">
                <div class="flex items-center justify-between gap-3">
                    <span class="flex items-center gap-2.5 font-semibold text-sm text-slate-900 dark:text-white"><i class="${s.icon} ${s.text}"></i>${esc(s.nombre)}</span>
                    <span class="font-mono text-xs text-slate-500 dark:text-slate-400">${s.nivel}%</span>
                </div>
                <div class="mt-2.5 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div class="skill-bar-fill h-full rounded-full bg-gradient-to-r ${s.bar}" data-level="${s.nivel}" style="width:0%"></div>
                </div>
            </button>`).join('');
        $$('.skill-btn').forEach(b => b.addEventListener('click', () => inspectSkill(b.dataset.skill)));
    }
    function inspectSkill(id) {
        const s = SKILLS.find(x => x.id === id) || SKILLS[0];
        activeSkill = s.id;
        $$('.skill-btn').forEach(b => {
            const on = b.dataset.skill === s.id;
            b.classList.toggle('border-cyan-500', on);
            b.classList.toggle('ring-1', on);
            b.classList.toggle('ring-cyan-500/40', on);
        });
        $('#skillInspector').innerHTML = `
            <div class="flex items-center justify-between text-[11px] text-slate-500 mb-4"><span>inspector.skill</span><span class="text-emerald-400">● activo</span></div>
            <div class="flex items-center gap-3">
                <span class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl"><i class="${s.icon} ${s.text}"></i></span>
                <div><div class="text-white font-bold text-base">${esc(s.nombre)}</div><div class="text-xs text-slate-400">nivel: <span class="${s.text}">${s.nivel}/100</span></div></div>
            </div>
            <p class="mt-4 text-slate-300 text-[13px] leading-relaxed font-sans">${esc(s.detalle)}</p>
            <div class="mt-4 text-[11px] text-slate-500">// herramientas</div>
            <div class="mt-2 flex flex-wrap gap-1.5">${s.items.map(i => `<span class="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-200">${esc(i)}</span>`).join('')}</div>
            <div class="mt-5 h-2 rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r ${s.bar}" style="width:${s.nivel}%"></div></div>`;
    }
    window.scrollToSkillAndInspect = function (id) {
        inspectSkill(id);
        const sec = $('#habilidades');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        fillBars();
    };
    function fillBars() { $$('.skill-bar-fill').forEach(b => { b.style.width = b.dataset.level + '%'; }); }

    /* ---------- Reveal, barras y contadores ---------- */
    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10) || 0, suffix = el.dataset.suffix || '';
        const start = performance.now(), dur = 1200;
        const step = (t) => {
            const p = Math.min(1, (t - start) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
    function setupObservers() {
        const reveals = $$('.reveal');
        const counters = $$('[data-count]');
        if (!('IntersectionObserver' in window)) {
            reveals.forEach(r => r.classList.add('active')); fillBars();
            counters.forEach(c => { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
            return;
        }
        document.documentElement.classList.add('js-anim-ready');
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (!en.isIntersecting) return;
                en.target.classList.add('active');
                if (en.target.querySelector('.skill-bar-fill')) fillBars();
                en.target.querySelectorAll('[data-count]').forEach(c => { if (!c.dataset.done) { c.dataset.done = '1'; animateCount(c); } });
                io.unobserve(en.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(r => io.observe(r));
        // Seguridad: si algo no se activó en 2.5 s, se muestra igual
        setTimeout(() => reveals.forEach(r => r.classList.add('active')), 2500);
    }

    /* ---------- Terminal animada ---------- */
    function runTerminal() {
        const out = $('#terminalOutput'); if (!out) return;
        const lines = [
            { p: true, t: 'whoami' },
            { t: CONFIG.nombre + ' — ' + CONFIG.rol, c: 'text-white' },
            { p: true, t: 'cat stack.json' },
            { t: '{ "frontend": ["JavaScript", "HTML", "Tailwind"],', c: 'text-amber-300' },
            { t: '  "backend":  ["Python", "SQL"],', c: 'text-sky-300' },
            { t: '  "security": ["OWASP", "Hardening"] }', c: 'text-emerald-300' },
            { p: true, t: 'ubicacion --actual' },
            { t: '📍 ' + CONFIG.ciudad + ', ' + CONFIG.pais, c: 'text-cyan-300' },
            { p: true, t: 'estado' },
            { t: '✔ Disponible para nuevos proyectos', c: 'text-emerald-400' }
        ];
        out.innerHTML = '';
        let i = 0;
        function next() {
            if (i >= lines.length) return;
            const L = lines[i++];
            const row = document.createElement('div');
            if (L.p) row.innerHTML = '<span class="text-emerald-400">➜</span> <span class="text-cyan-400">~</span> ';
            const span = document.createElement('span');
            span.className = L.c || 'text-slate-200';
            row.appendChild(span); out.appendChild(row);
            let k = 0; const speed = L.p ? 45 : 12;
            (function type() {
                span.textContent = L.t.slice(0, ++k);
                if (k < L.t.length) setTimeout(type, speed); else setTimeout(next, L.p ? 250 : 120);
            })();
        }
        next();
    }

    /* ---------- Canvas Lab: pizarra sincronizada ---------- */
    function setupCanvasLab() {
        const main = $('#mainCanvas'), mirror = $('#mirrorCanvas');
        if (!main || !mirror) return;
        const strokes = [];
        let color = '#22d3ee', size = 5, drawing = false, last = null, synced = 0;
        const tabId = Math.random().toString(36).slice(2);
        const peers = new Set();
        let chan = null;
        try { chan = 'BroadcastChannel' in window ? new BroadcastChannel('ml-canvas-sync') : null; } catch (e) { chan = null; }
        $('#syncSupport').textContent = chan ? 'BroadcastChannel activo' : 'no disponible (solo espejo local)';

        function fit(c) {
            const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
            c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr));
        }
        function drawSeg(c, s) {
            const ctx = c.getContext('2d'), w = c.width, h = c.height;
            const scale = Math.min(w, h) / 400;
            ctx.strokeStyle = s.color; ctx.lineWidth = Math.max(1, s.size * scale * (window.devicePixelRatio || 1) * 0.6);
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(s.x0 * w, s.y0 * h); ctx.lineTo(s.x1 * w, s.y1 * h); ctx.stroke();
        }
        function redraw() {
            [main, mirror].forEach(c => { fit(c); c.getContext('2d').clearRect(0, 0, c.width, c.height); });
            strokes.forEach(s => { drawSeg(main, s); drawSeg(mirror, s); });
        }
        function addSeg(s, remote) {
            strokes.push(s);
            if (strokes.length > 20000) strokes.splice(0, 5000);
            drawSeg(main, s);
            setTimeout(() => drawSeg(mirror, s), remote ? 0 : 60);
            synced++; $('#strokeCount').textContent = synced;
            if (!remote && chan) chan.postMessage({ type: 'seg', from: tabId, s });
        }
        function clearAll(remote) {
            strokes.length = 0;
            [main, mirror].forEach(c => c.getContext('2d').clearRect(0, 0, c.width, c.height));
            if (!remote && chan) chan.postMessage({ type: 'clear', from: tabId });
        }
        function pos(e) {
            const r = main.getBoundingClientRect();
            return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
        }
        main.addEventListener('pointerdown', e => { drawing = true; last = pos(e); try { main.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
        main.addEventListener('pointermove', e => {
            if (!drawing) return;
            const p = pos(e);
            addSeg({ x0: last.x, y0: last.y, x1: p.x, y1: p.y, color, size }, false);
            last = p;
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => main.addEventListener(ev, () => { drawing = false; last = null; }));

        $$('#colorPicker [data-color]').forEach(b => b.addEventListener('click', () => {
            color = b.dataset.color;
            $$('#colorPicker [data-color]').forEach(o => { o.classList.remove('ring-2', 'ring-cyan-400', 'border-white', 'dark:border-slate-200'); o.classList.add('border-transparent'); });
            b.classList.remove('border-transparent'); b.classList.add('ring-2', 'ring-cyan-400', 'border-white', 'dark:border-slate-200');
        }));
        $('#brushSize').addEventListener('input', e => { size = parseInt(e.target.value, 10) || 5; });
        $('#clearCanvasBtn').addEventListener('click', () => { clearAll(false); showToast('Pizarra borrada.', 'info'); });

        if (chan) {
            chan.onmessage = (ev) => {
                const d = ev.data || {};
                if (d.from === tabId) return;
                if (d.type === 'hello') { peers.add(d.from); chan.postMessage({ type: 'here', from: tabId }); }
                else if (d.type === 'here') peers.add(d.from);
                else if (d.type === 'bye') peers.delete(d.from);
                else if (d.type === 'seg' && d.s) addSeg(d.s, true);
                else if (d.type === 'clear') clearAll(true);
                $('#peerCount').textContent = peers.size;
            };
            chan.postMessage({ type: 'hello', from: tabId });
            window.addEventListener('pagehide', () => { try { chan.postMessage({ type: 'bye', from: tabId }); } catch (e) {} });
        }
        let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redraw, 150); });
        redraw();
    }

    /* ---------- Formulario de contacto ---------- */
    function setupContactForm() {
        const form = $('#contactForm'); if (!form) return;
        let lastMsg = '';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#cfName').value.trim(), msg = $('#cfMessage').value.trim(), ch = $('#cfChannel').value;
            const err = $('#cfError');
            if (!name || !msg) { err.textContent = '⚠ Escribe tu nombre y tu mensaje.'; err.classList.remove('hidden'); return; }
            err.classList.add('hidden');
            lastMsg = 'Hola ' + CONFIG.nombre.split(' ')[0] + ', soy ' + name + '.\n\n' + msg;
            $('#cfPreview').textContent = lastMsg;
            const link = $('#cfOpenLink');
            if (ch === 'whatsapp') {
                link.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(lastMsg);
                $('#cfOpenLabel').textContent = 'Abrir WhatsApp';
            } else {
                link.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Contacto desde tu portafolio — ' + name) + '&body=' + encodeURIComponent(lastMsg);
                $('#cfOpenLabel').textContent = 'Abrir correo (' + CONFIG.email + ')';
            }
            $('#cfResult').classList.remove('hidden');
            showToast('Mensaje preparado. Ábrelo en la app para enviarlo.', 'info');
        });
        $('#cfCopyBtn').addEventListener('click', async () => {
            const ok = await copyText(lastMsg);
            showToast(ok ? '✔ Mensaje copiado.' : 'No se pudo copiar.', ok ? 'ok' : 'warn');
        });
    }

    /* ---------- Repos de GitHub ---------- */
    // Lista guardada: se muestra si no hay internet o si GitHub no responde.
    const REPOS_GUARDADOS = [
        { name: 'algoritmia-primer--trayecto', description: 'Ejercicios de algoritmia en PSeInt organizados por semana, con diagramas de flujo.', language: 'PSeInt', has_pages: false, pushed_at: '2026-11-13T11:45:00Z' },
        { name: 'pagina-update', description: 'Rueda Libre: alquiler de bicicletas en Medellín, con reservas, tarifas y Rueda Nocturna.', language: 'HTML', has_pages: true, pushed_at: '2026-11-13T04:03:10Z' },
        { name: 'Riwi.2', description: 'Ejercicios de lógica en JavaScript que se pueden probar en el navegador.', language: 'JavaScript', has_pages: false, pushed_at: '2026-11-13T03:55:44Z' },
        { name: 'goalmatch', description: 'Comunidad de fútbol amateur en Bogotá y Medellín: partidos, canchas y votación MVP.', language: 'HTML', has_pages: true, pushed_at: '2026-11-10T12:04:38Z' },
        { name: 'Bit4', description: 'Tienda de vinilos y colección con catálogo y preventas.', language: 'HTML', has_pages: false, pushed_at: '2026-11-09T04:37:40Z' },
        { name: 'Riwi.1', description: 'Ejercicio de Java.', language: 'Java', has_pages: false, pushed_at: '2026-10-15T17:55:10Z' },
        { name: 'SERVICIOS', description: 'Proyecto backend con Java y Spring Boot.', language: 'Java', has_pages: false, pushed_at: '2025-04-26T16:28:05Z' }
    ];
    const LANG_COLORS = { JavaScript: 'bg-amber-400', TypeScript: 'bg-blue-500', HTML: 'bg-orange-500', CSS: 'bg-sky-500', Java: 'bg-red-500', Python: 'bg-sky-400', PSeInt: 'bg-emerald-400' };

    function fmtFecha(iso) {
        try { return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
    }
    function liveUrl(r) {
        if (r.has_pages) return 'https://' + CONFIG.githubUser.toLowerCase() + '.github.io/' + r.name + '/';
        return r.homepage && /^https?:\/\//.test(r.homepage) ? r.homepage : '';
    }
    function renderRepos(list, origen) {
        const grid = $('#reposGrid'); if (!grid) return;
        list = list.slice().sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
        grid.innerHTML = list.map(r => {
            const live = liveUrl(r);
            const lang = r.language || 'Código';
            const dot = LANG_COLORS[lang] || 'bg-slate-400';
            const code = 'https://github.com/' + CONFIG.githubUser + '/' + encodeURIComponent(r.name);
            return `
            <article class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-5 flex flex-col gap-3 hover:border-cyan-500/50 transition">
                <div class="flex items-start justify-between gap-3">
                    <a href="${code}" target="_blank" rel="noopener" class="font-mono font-semibold text-sm text-slate-900 dark:text-white hover:text-cyan-500 break-all"><i class="fa-regular fa-folder-open mr-1.5 text-cyan-500"></i>${esc(r.name)}</a>
                    ${live ? '<span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">en vivo</span>' : ''}
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 flex-1">${esc(r.description || 'Sin descripción.')}</p>
                <div class="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full ${dot}"></span>${esc(lang)}</span>
                    ${r.stargazers_count ? `<span><i class="fa-regular fa-star mr-1"></i>${r.stargazers_count}</span>` : ''}
                    <span><i class="fa-regular fa-clock mr-1"></i>${fmtFecha(r.pushed_at)}</span>
                </div>
                <div class="flex flex-wrap gap-3 text-xs font-semibold pt-1">
                    <a href="${code}" target="_blank" rel="noopener" class="text-slate-700 dark:text-slate-200 hover:text-cyan-500"><i class="fa-brands fa-github mr-1"></i>Código</a>
                    ${live ? `<a href="${live}" target="_blank" rel="noopener" class="text-cyan-600 dark:text-cyan-400 hover:underline"><i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>Ver en vivo</a>` : ''}
                </div>
            </article>`;
        }).join('');

        const st = $('#reposStatus');
        if (st) st.innerHTML = origen === 'api'
            ? `<i class="fa-solid fa-circle-check text-emerald-500 mr-1"></i>${list.length} repos · en vivo desde GitHub`
            : `<i class="fa-solid fa-box-archive mr-1"></i>${list.length} repos · lista guardada`;

        const stat = $('#statProyectos');
        if (stat) { stat.dataset.count = String(list.length); if (stat.dataset.done) stat.textContent = String(list.length); }

        $$('[data-live-repo]').forEach(a => {
            const r = list.find(x => x.name.toLowerCase() === a.dataset.liveRepo.toLowerCase());
            const url = r && liveUrl(r);
            if (url) { a.href = url; a.classList.remove('hidden'); } else a.classList.add('hidden');
        });
    }
    async function setupRepos() {
        renderRepos(REPOS_GUARDADOS, 'guardado');
        try {
            const c = JSON.parse(localStorage.getItem('ml-repos-v2') || 'null');
            if (c && c.u === CONFIG.githubUser && Date.now() - c.t < 3600000 && c.list && c.list.length) { renderRepos(c.list, 'api'); return; }
        } catch (e) {}
        try {
            const ctrl = ('AbortController' in window) ? new AbortController() : null;
            if (ctrl) setTimeout(() => ctrl.abort(), 8000);
            const res = await fetch('https://api.github.com/users/' + encodeURIComponent(CONFIG.githubUser) + '/repos?per_page=100&sort=pushed',
                { headers: { Accept: 'application/vnd.github+json' }, signal: ctrl ? ctrl.signal : undefined });
            if (!res.ok) throw new Error('GitHub ' + res.status);
            const data = await res.json();
                // Se muestran todos los repos públicos, menos los de CONFIG.reposOcultos.
                const ocultos = (CONFIG.reposOcultos || []).map(n => n.toLowerCase());
                const list = data.filter(r => !r.fork && !r.private && !ocultos.includes(r.name.toLowerCase())).map(r => {
                const g = REPOS_GUARDADOS.find(x => x.name.toLowerCase() === r.name.toLowerCase()) || {};
                return { name: r.name, description: r.description || g.description || '', language: r.language || g.language || '',
                         has_pages: !!r.has_pages, homepage: r.homepage, pushed_at: r.pushed_at, stargazers_count: r.stargazers_count };
            });
            if (!list.length) throw new Error('sin repos');
            try { localStorage.setItem('ml-repos-v2', JSON.stringify({ t: Date.now(), u: CONFIG.githubUser, list })); } catch (e) {}
            renderRepos(list, 'api');
        } catch (e) { /* sin conexión con GitHub: se queda la lista guardada */ }
    }

    /* ---------- Instalar como app (Android) ---------- */
    let deferredInstall = null;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
    window.addEventListener('appinstalled', () => { deferredInstall = null; showStatus('✔ App instalada. Búscala en tu pantalla de inicio.'); });
    function isStandalone() {
        try { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; }
    }
    window.installAndroidApp = async function () {
        if (isStandalone()) { showStatus('✔ Ya estás usando la app instalada.'); return; }
        if (deferredInstall) {
            const ev = deferredInstall; deferredInstall = null;
            try {
                ev.prompt();
                const choice = await ev.userChoice;
                if (choice && choice.outcome === 'accepted') showStatus('✔ Instalando la app en tu celular…');
                else showToast('Instalación cancelada.', 'warn');
            } catch (e) { showToast('No se pudo abrir el instalador.', 'warn'); }
            return;
        }
        if (IN_FRAME || location.protocol === 'file:') {
            const ok = await copyText(CONFIG.sitio);
            showStatus((ok ? '✔ Link copiado. ' : '') + 'Para instalarla, abre ' + CONFIG.sitio + ' en Chrome de tu Android y toca "Instalar en Android".');
            return;
        }
        window.openDownloadModal();
        showStatus('En Chrome toca el menú ⋮ y elige "Instalar aplicación" o "Agregar a la pantalla principal".');
    };
    if ('serviceWorker' in navigator && !IN_FRAME && location.protocol === 'https:') {
        window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
    }

    /* ---------- Inicio ---------- */
    applyConfig();
    renderSkills();
    inspectSkill(activeSkill);
    setupObservers();
    runTerminal();
    setupContactForm();
    setupRepos();
    if (document.readyState === 'complete') setupCanvasLab();
    else window.addEventListener('load', setupCanvasLab);
})();
