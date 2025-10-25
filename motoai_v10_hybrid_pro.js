// MotoAI v10.0 — Smart Hybrid Pro (v10 Core + v13 Brain)
// Standalone file.
(function(){
  if(window.MotoAI_v10_LOADED) return;
  window.MotoAI_v10_LOADED = true;
  console.log('✅ MotoAI v10.0 Hybrid Pro loaded');

  /* -------- CONFIG -------- */
  const CFG = {
    maxCorpusSentences: 600,    // cap sentences stored
    minSentenceLength: 20,
    suggestionTags: [
      {q:'Xe số', label:'🏍 Xe số'},
      {q:'Xe ga', label:'🛵 Xe ga'},
      {q:'Thủ tục', label:'📄 Thủ tục'},
      {q:'Xe 50cc', label:'🚲 Xe 50cc'}
    ],
    memoryKeyName: 'MotoAI_v10_user_name',
    corpusKey: 'MotoAI_v10_corpus',
    sessionKey: 'MotoAI_v10_session_msgs',
    lastCorpusBuildKey: 'MotoAI_lastCorpusBuild' // v13
  };

  /* --------- HTML inject ---------- */
  const html = `
  <div id="motoai-root" aria-hidden="false">
    <div id="motoai-bubble" role="button" aria-label="Mở MotoAI">🤖</div>
    <div id="motoai-overlay" aria-hidden="true">
      <div id="motoai-card" role="dialog" aria-modal="true" aria-hidden="true">
        <div id="motoai-handle" aria-hidden="true"></div>
        <header id="motoai-header">
          <div class="title">MotoAI Assistant</div>
          <div class="tools">
            <button id="motoai-clear" title="Xóa cuộc trò chuyện">🗑</button>
            <button id="motoai-close" title="Đóng">✕</button>
          </div>
        </header>
        <main id="motoai-body" tabindex="0" role="log" aria-live="polite"></main>
        <div id="motoai-suggestions" role="toolbar" aria-label="Gợi ý nhanh"></div>
        <footer id="motoai-footer">
          <div id="motoai-typing" aria-hidden="true"></div>
          <input id="motoai-input" placeholder="Nhập câu hỏi..." autocomplete="off" aria-label="Nhập câu hỏi"/>
          <button id="motoai-send" aria-label="Gửi">Gửi</button>
        </footer>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  /* ---------- CSS ---------- */
  const css = `
  :root{
    --m10-accent:#007aff;
    --m10-card-bg: rgba(255,255,255,0.86);
    --m10-card-bg-dark: rgba(22,22,24,0.92);
    --m10-blur: blur(12px) saturate(140%);
    --m10-radius:18px;
  }
  #motoai-root{position:fixed;left:16px;bottom:18px;z-index:2147483000;pointer-events:none}
  #motoai-bubble{
    pointer-events:auto;width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;
    font-size:26px;background:var(--m10-accent);color:#fff;box-shadow:0 10px 28px rgba(2,6,23,0.18);cursor:pointer;transition:transform .16s;
  }
  #motoai-bubble:hover{transform:scale(1.06)}
  #motoai-overlay{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:12px;pointer-events:none;transition:background .24s ease;z-index:2147482999}
  #motoai-overlay.visible{background:rgba(0,0,0,0.18);pointer-events:auto}
  #motoai-card{
    width:min(920px,calc(100% - 36px));max-width:920px;border-radius:var(--m10-radius) var(--m10-radius) 10px 10px;
    height:72vh;max-height:760px;min-height:320px;background:var(--m10-card-bg);backdrop-filter:var(--m10-blur);
    box-shadow:0 -18px 60px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden;
    transform:translateY(110%);opacity:0;pointer-events:auto;transition:transform .36s cubic-bezier(.2,.9,.2,1),opacity .28s;
  }
  #motoai-overlay.visible #motoai-card{transform:translateY(0);opacity:1}
  #motoai-handle{width:64px;height:6px;background:rgba(160,160,160,0.6);border-radius:6px;margin:10px auto}
  #motoai-header{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;font-weight:700;color:var(--m10-accent);border-bottom:1px solid rgba(0,0,0,0.06)}
  #motoai-header .tools button{background:none;border:none;font-size:18px;cursor:pointer;padding:6px 8px}
  #motoai-body{flex:1;overflow:auto;padding:12px 16px;font-size:15px;background:transparent}
  .m-msg{margin:8px 0;padding:12px 14px;border-radius:16px;max-width:86%;line-height:1.4;word-break:break-word;box-shadow:0 3px 10px rgba(0,0,0,0.06)}
  .m-msg.bot{background:rgba(255,255,255,0.9);color:#111}
  .m-msg.user{background:linear-gradient(180deg,var(--m10-accent),#00b6ff);color:#fff;margin-left:auto}
  #motoai-suggestions{display:flex;gap:8px;justify-content:center;padding:8px 12px;border-top:1px solid rgba(0,0,0,0.04);flex-wrap:wrap;background:rgba(255,255,255,0.6);backdrop-filter:blur(8px)}
  #motoai-suggestions button{border:none;background:rgba(0,122,255,0.08);color:var(--m10-accent);padding:8px 12px;border-radius:12px;cursor:pointer}
  #motoai-footer{display:flex;align-items:center;gap:8px;padding:10px;border-top:1px solid rgba(0,0,0,0.06);background:rgba(255,255,255,0.7);backdrop-filter:blur(8px)}
  #motoai-typing{min-width:48px}
  #motoai-input{flex:1;padding:10px;border-radius:12px;border:1px solid rgba(0,0,0,0.08);font-size:15px}
  #motoai-send{background:var(--m10-accent);color:#fff;border:none;border-radius:10px;padding:10px 14px;cursor:pointer}
  #motoai-clear{position:absolute;top:10px;right:44px;background:none;border:none;font-size:18px;cursor:pointer}
  @media (max-width:520px){
    #motoai-card{width:calc(100% - 24px);height:78vh}
  }
  @media (prefers-color-scheme:dark){
    :root{--m10-card-bg:var(--m10-card-bg-dark)}
    .m-msg.bot{background:rgba(40,40,50,0.9);color:#eee}
    #motoai-suggestions{background:rgba(25,25,30,0.9)}
    #motoai-footer{background:rgba(25,25,30,0.9)}
  }`;
  const sN = document.createElement('style'); sN.textContent = css; document.head.appendChild(sN);

  /* ---------- Helpers & state ---------- */
  const $ = sel => document.querySelector(sel);
  const root = $('#motoai-root'), bubble = $('#motoai-bubble'), overlay = $('#motoai-overlay');
  const card = $('#motoai-card'), bodyEl = $('#motoai-body'), inputEl = $('#motoai-input'), sendBtn = $('#motoai-send');
  const closeBtn = $('#motoai-close'), clearBtn = $('#motoai-clear'), typingEl = $('#motoai-typing');
  const suggestionsWrap = $('#motoai-suggestions');

  let isOpen = false, sendLock = false;
  let corpus = []; // [{id, text, tokens[]}]
  let sessionMsgs = []; // persisted in sessionStorage

  /* --------- Utility: tokenize, normalize --------- */
  function tokenize(s){
    return s.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu,' ').split(/\s+/).filter(Boolean);
  }
  function uniq(arr){ return Array.from(new Set(arr)); }

  /* -------- Corpus build: prefer <main>, <article>, <section>, headings, lists -------- */
  function buildCorpusFromDOM(){
    try{
      let nodes = Array.from(document.querySelectorAll('main, article, section'));
      if(!nodes.length) nodes = [document.body];
      let texts = [];
      nodes.forEach(n=>{
        // headings
        Array.from(n.querySelectorAll('h1,h2,h3')).forEach(h=>{ if(h.innerText && h.innerText.trim().length>10) texts.push(h.innerText.trim()); });
        // paragraphs and list items
        Array.from(n.querySelectorAll('p, li')).forEach(p=>{ const t = p.innerText.trim(); if(t.length>=CFG.minSentenceLength) texts.push(t); });
      });
      // fallback: meta description or body
      if(!texts.length){
        const meta = document.querySelector('meta[name="description"]');
        if(meta && meta.content) texts.push(meta.content);
        const bodyTxt = document.body.innerText || '';
        bodyTxt.split(/[.!?]\s+/).forEach(s=>{ if(s.trim().length>CFG.minSentenceLength) texts.push(s.trim()); });
      }
      // dedupe and cap
      const uniqTexts = uniq(texts).slice(0, CFG.maxCorpusSentences);
      corpus = uniqTexts.map((t,i)=>({id:i, text:t, tokens:tokenize(t)}));
      try{ localStorage.setItem(CFG.corpusKey, JSON.stringify(corpus)); }catch(e){}
      console.log(`📚 MotoAI v10 built corpus: ${corpus.length} items`);
    }catch(e){ corpus=[]; }
  }

  // Restore corpus from localStorage if present (speed)
  (function restoreCorpus(){
    try{
      const raw = localStorage.getItem(CFG.corpusKey);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) { corpus = parsed; }
      }
    }catch(e){}
  })();

  /* -------- Retrieval: TF-style overlap score (fast) -------- */
  function retrieveBestAnswer(query){
    if(!query) return null;
    const qTokens = tokenize(query).filter(t=>t.length>1);
    if(!qTokens.length || !corpus.length) return null;
    let best = {score:0, text:null, id:null};
    for(const c of corpus){
      // quick filter by tokens overlap
      let score=0;
      for(const qt of qTokens){
        if(c.tokens.includes(qt)) score += 1;
      }
      // small boost if exact phrase
      if(c.text.toLowerCase().includes(query.toLowerCase())) score += 0.6;
      if(score>best.score){ best={score, text:c.text, id:c.id}; }
    }
    return best.score>0 ? best.text : null;
  }

  /* -------- Session persistence (keep across pages) -------- */
  function loadSession(){
    try{
      const raw = sessionStorage.getItem(CFG.sessionKey);
      if(raw) sessionMsgs = JSON.parse(raw);
    }catch(e){ sessionMsgs = []; }
    if(!sessionMsgs || !Array.isArray(sessionMsgs)) sessionMsgs = [];
  }
  function saveSession(){ try{ sessionStorage.setItem(CFG.sessionKey, JSON.stringify(sessionMsgs)); }catch(e){} }

  /* -------- Memory: user name -------- */
  function saveUserName(name){ try{ localStorage.setItem(CFG.memoryKeyName, name); }catch(e){} }
  function getUserName(){ try{ return localStorage.getItem(CFG.memoryKeyName); }catch(e){return null;} }
  function detectNameFromText(txt){
    if(!txt) return null;
    const s = txt.replace(/\s+/g,' ').trim();
    const patterns = [
      /(?:tôi tên là|tên tôi là|mình tên là)\s+([A-Za-z\u00C0-\u024F0-9_\- ]{2,40})/i,
      /(?:tôi là|mình là)\s+([A-Za-z\u00C0-\u024F0-9_\- ]{2,40})/i
    ];
    for(const p of patterns){
      const m = s.match(p);
      if(m && m[1]){ const nm=m[1].trim(); saveUserName(nm); return nm; }
    }
    return null;
  }

  /* -------- UI helpers -------- */
  function addMessage(role, text, opts){
    const el = document.createElement('div');
    el.className = 'm-msg '+(role==='user'?'user':'bot');
    el.textContent = text;
    bodyEl.appendChild(el);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    // push to session
    sessionMsgs.push({role, text, t:Date.now()});
    saveSession();
    return el;
  }

  function showTypingDots(){
    typingEl.innerHTML = `<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;
    typingEl.style.opacity = '1';
  }
  function hideTypingDots(){ typingEl.innerHTML=''; typingEl.style.opacity='0'; }

  /* ---------- Build suggestion buttons ---------- */
  function buildSuggestions(){
    suggestionsWrap.innerHTML = '';
    CFG.suggestionTags.forEach(s=>{
      const b = document.createElement('button');
      b.type='button'; b.textContent = s.label; b.dataset.q = s.q;
      b.addEventListener('click', (ev)=>{
        if(!isOpen) openChat();
        setTimeout(()=> sendQuery(s.q), 100);
      });
      suggestionsWrap.appendChild(b);
    });
  }

  /* ---------- Open/close logic ---------- */
  function openChat(){
    if(isOpen) return;
    overlay.classList.add('visible');
    card.setAttribute('aria-hidden','false'); overlay.setAttribute('aria-hidden','false');
    isOpen = true;
    const name = getUserName();
    if(name) setTimeout(()=> addMessage('bot', `Chào ${name}! Mình nhớ bạn rồi 👋`), 400);
    // render session messages
    renderSession();
    setTimeout(()=> { try{ inputEl.focus(); }catch(e){} }, 320);
    document.documentElement.style.overflow = 'hidden';
    adaptCardHeight();
  }
  function closeChat(){
    if(!isOpen) return;
    overlay.classList.remove('visible');
    card.setAttribute('aria-hidden','true'); overlay.setAttribute('aria-hidden','true');
    isOpen = false;
    document.documentElement.style.overflow = '';
    // clear typing
    hideTypingDots();
  }

  /* ---------- Render saved session to UI ---------- */
  function renderSession(){
    bodyEl.innerHTML = '';
    if(sessionMsgs && sessionMsgs.length){
      sessionMsgs.forEach(m=>{
        const el = document.createElement('div');
        el.className = 'm-msg '+(m.role==='user'?'user':'bot');
        el.textContent = m.text;
        bodyEl.appendChild(el);
      });
      bodyEl.scrollTop = bodyEl.scrollHeight;
    } else {
      addMessage('bot','👋 Xin chào! Mình là MotoAI — hỏi thử “Xe ga”, “Xe số”, “Xe 50cc” hoặc “Thủ tục” nhé!');
    }
  }

  // --- 🧠 START: MotoAI v13 Brain Patch ---

  /* -------- v13 Brain: SmartEngine -------- */
  const rules = [
    { pattern: /(xe so|wave|sirius|blade|future)/i, answer: "Xe số tiết kiệm xăng, giá thuê rẻ, bền bỉ và dễ đi. 🚀" },
    { pattern: /(xe ga|vision|lead|air blade|vespa)/i, answer: "Xe ga chạy êm, cốp rộng, hợp đi phố. Giá từ 120k/ngày. 🛵" },
    { pattern: /(50cc|khong can bang|hoc sinh|sinh vien)/i, answer: "Xe 50cc không cần bằng lái, phù hợp học sinh – sinh viên. 📘" },
    { pattern: /(thu tuc|giay to|can gi|dat coc)/i, answer: "Thủ tục thuê xe: CCCD + GPLX (hoặc Passport nếu là khách nước ngoài). 📄" },
    { pattern: /(gia|bao nhieu|bang gia)/i, answer: "Xe số ~100k/ngày, xe ga ~130k/ngày, xe côn ~200k/ngày. 💰" },
    { pattern: /(lien he|sdt|zalo|hotline|dia chi)/i, answer: "Liên hệ ☎️ 085.725.5868 hoặc Zalo cùng số nhé!" },
  ];

  function smartAnswer(q){
    for (const rule of rules){
      if(rule.pattern.test(q)) return rule.answer;
    }
    return null;
  }

  /* -------- v13 Brain: SpellFix -------- */
  const spellMap = {
    'thue xe may':'thuê xe máy','xe so':'xe số','xe ga':'xe ga',
    'thu tuc':'thủ tục','giay to':'giấy tờ','bang gia':'bảng giá',
    'lien he':'liên hệ'
  };

  function fixText(txt){
    let t = txt.toLowerCase();
    for (const [k,v] of Object.entries(spellMap)){
      t = t.replace(new RegExp(`\\b${k}\\b`,'g'),v);
    }
    return t;
  }

  /* -------- Fallback: v10 Corpus Retrieval (Modified) -------- */
  // Đây là logic gốc của v10, được tách ra để làm fallback
  async function retrieveFromCorpus(text){
    // 'text' đã được fix lỗi chính tả
    // show typing
    showTypingDots();

    // retrieval (small delay to simulate thinking)
    setTimeout(()=>{
      try{
        let ans = retrieveBestAnswer(text); // v10 logic
        if(!ans){
          // cross-page learning: try to merge stored local corpus if exists (already merged in build)
          ans = null;
        }
        hideTypingDots();
        if(ans){
          addMessage('bot', ans);
        } else {
          addMessage('bot', 'Xin lỗi, mình chưa tìm thấy nội dung cụ thể trên trang này. Bạn thử hỏi khác nha.');
        }
      }catch(e){
        hideTypingDots();
        addMessage('bot','Lỗi khi xử lý câu trả lời.');
        console.error(e);
      } finally {
        sendLock=false; sendBtn.disabled=false;
        setTimeout(()=> inputEl.focus(),120);
      }
    }, 300);
  }

  /* ---------- NEW sendQuery: v13 + v10 Fallback ---------- */
  // Hàm này thay thế hoàn toàn hàm sendQuery gốc của v10
  async function sendQuery(text){
    if(!text || !text.trim()) return;
    if(sendLock) return;
    sendLock = true; sendBtn.disabled = true;
    hideTypingDots();

    // 1. Luôn thêm tin nhắn của người dùng (văn bản gốc)
    addMessage('user', text);

    // 2. Sửa lỗi chính tả
    const fixed = fixText(text);

    // 3. Xử lý logic Nhớ tên (từ v10)
    const name = detectNameFromText(text); // Dùng text gốc
    if(name){
      addMessage('bot', `Đã nhớ tên: ${name} ✨`);
      sendLock=false; sendBtn.disabled=false;
      setTimeout(()=> inputEl.focus(), 120);
      return;
    }

    // 4. Thử SmartEngine v13
    let ans = smartAnswer(fixed);
    
    if(ans){
      // HIT: Trả lời ngay
      showTypingDots();
      setTimeout(()=>{
        hideTypingDots();
        addMessage('bot', ans);
        sendLock=false; sendBtn.disabled=false;
        setTimeout(()=> inputEl.focus(),120);
      }, 200); // Trả lời nhanh hơn
    } else {
      // MISS: Fallback về v10 corpus retrieval
      // retrieveFromCorpus sẽ tự handle typing, bot msg, và unlock
      retrieveFromCorpus(fixed);
    }
  }
  // --- 🧠 END: MotoAI v13 Brain Patch ---


  /* ---------- Quick analytic: avoid overlap with quickcall/toc ---------- */
  function avoidOverlap(){
    try{
      const rootEl = root;
      const selectors = ['.quick-call-game','.quick-call','#toc','.toc','.table-of-contents'];
      let found = [];
      selectors.forEach(s=>{
        const el = document.querySelector(s); if(el) found.push(el);
      });
      if(!found.length){
        rootEl.style.left = '16px'; rootEl.style.bottom = '18px'; return;
      }
      let maxH = 0; let leftNear = false;
      found.forEach(el=>{
        const r = el.getBoundingClientRect();
        if(r.left < 150 && (window.innerHeight - r.bottom) < 240) leftNear = true;
        if(r.height>maxH) maxH = r.height;
      });
      if(leftNear){
        rootEl.style.left = Math.min(160, 16 + Math.round(Math.max(40, maxH*0.6))) + 'px';
        rootEl.style.bottom = (18 + Math.round(maxH*0.5)) + 'px';
      } else {
        rootEl.style.left = '16px'; rootEl.style.bottom = '18px';
      }
    }catch(e){}
  }

  /* ---------- iOS VisualViewport keyboard fix ---------- */
  function attachViewportHandler(){
    if(window.visualViewport){
      let last = 0;
      visualViewport.addEventListener('resize', ()=>{
        try{
          const offset = Math.max(0, window.innerHeight - visualViewport.height);
          if(Math.abs(offset-last) < 6) return;
          last = offset;
          if(offset > 120){
            card.style.bottom = (offset - (navigator.userAgent.includes('iPhone')?4:0)) + 'px';
          } else {
            card.style.bottom = '';
          }
        }catch(e){}
      });
    } else {
      window.addEventListener('resize', ()=>{ card.style.bottom = ''; });
    }
  }

  /* ---------- initialization & bindings ---------- */
  function init(){
    // build UI suggestions
    buildSuggestions();
    // load session
    loadSession();

    // --- v13 Auto Refresh Corpus Logic (thay thế logic build cũ) ---
    const now = Date.now();
    const last = parseInt(localStorage.getItem(CFG.lastCorpusBuildKey)||'0',10);
    const seventyTwoHrs = 72*60*60*1000;
    
    // Chỉ build lại corpus từ DOM nếu:
    // 1. Corpus trong bộ nhớ đang rỗng (lần đầu chạy, hoặc restore thất bại)
    // 2. Hoặc đã qua 72h kể từ lần build trước
    if(corpus.length === 0 || !last || (now - last) > seventyTwoHrs){
      if (corpus.length > 0) { // Chỉ log nếu đây là refresh
        console.log('🔁 Refreshing corpus after 72h...');
      }
      buildCorpusFromDOM(); // Hàm này tự động lưu vào localStorage
      localStorage.setItem(CFG.lastCorpusBuildKey, now.toString());
    }
    // --- End v13 Logic ---

    attachViewportHandler();
    adaptCardHeight();
    // bind events
    bubble.addEventListener('click', ()=>{ if(!isOpen){ openChat(); } else closeChat(); });
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeChat(); });
    closeBtn.addEventListener('click', closeChat);
    clearBtn.addEventListener('click', ()=>{ sessionMsgs=[]; saveSession(); bodyEl.innerHTML=''; addMessage('bot','🗑 Đã xóa hội thoại.'); });
    sendBtn.addEventListener('click', ()=>{ const v = (inputEl.value||'').trim(); inputEl.value=''; sendQuery(v); });
    inputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); const v = (inputEl.value||'').trim(); inputEl.value=''; sendQuery(v); } });
    // typing indicator style small
    const styleTyping = document.createElement('style'); styleTyping.textContent = `
      #motoai-typing .dot{display:inline-block;margin:0 2px;opacity:.6;font-weight:700;animation:motoai-dot .9s linear infinite}
      #motoai-typing .dot:nth-child(2){animation-delay:.12s}#motoai-typing .dot:nth-child(3){animation-delay:.24s}
      @keyframes motoai-dot{0%{opacity:.2;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}100%{opacity:.2;transform:translateY(0)} }`;
    document.head.appendChild(styleTyping);

    // periodic avoidOverlap
    setInterval(avoidOverlap, 1200);
    window.addEventListener('resize', ()=>{ adaptCardHeight(); setTimeout(avoidOverlap,260); });
  }

  /* ---------- adapt card height responsive ---------- */
  function adaptCardHeight(){
    try{
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
      let h = Math.round(vh * (vw >= 900 ? 0.6 : vw >= 700 ? 0.68 : 0.78));
      h = Math.max(320, Math.min(760, h));
      card.style.height = h + 'px';
    }catch(e){}
  }

  /* ---------- expose small API ---------- */
  window.MotoAI_v10 = {
    open: openChat,
    close: closeChat,
    rebuildCorpus: buildCorpusFromDOM, // v10
    getName: getUserName,
    clearMemory: ()=>{ try{ localStorage.removeItem(CFG.memoryKeyName); }catch(e){} }
  };

  /* ---------- bootstrap ---------- */
  setTimeout(init, 160);

})();
// === 🧩 Global Light Mode Fix for MotoAI v10 (Menu Overlay Conflict) ===
(function(){
  const cssFix = `
    /* Giảm z-index AI để không đè menu */
    #motoai-root,
    #motoai-overlay,
    #motoai-card {
      z-index: 9999 !important;
    }

    /* Giữ menu trên cùng */
    header, nav, .site-header {
      position: relative;
      z-index: 10000 !important;
    }

    /* Khi Light Mode, giảm độ trắng overlay để không làm trắng màn hình */
    body[data-theme="light"] #motoai-overlay.visible {
      background: rgba(0,0,0,0.25) !important;
    }
  `;
  const style = document.createElement('style');
  style.textContent = cssFix;
  document.head.appendChild(style);
  console.log('%c✅ MotoAI v10 Light Mode Fix Applied (Menu Safe)', 'color:#0a84ff;font-weight:bold;');
})();

// === 🚀 Final Ready Log ===
console.log('%c🧠 MotoAI v10 Smart Hybrid Pro Ready ✅','color:#0a84ff;font-weight:bold;');
