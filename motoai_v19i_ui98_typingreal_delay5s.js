(function(){
  if (window.MotoAI_v19i_LOADED) return;
  window.MotoAI_v19i_LOADED = true;

  const DEF = {
    brand: "MS. Thu Hà",
    phone: "0857255868",
    zalo:  "https://zalo.me/0857255868",
    whatsapp: "https://wa.me/84857255868",
    map: "https://maps.app.goo.gl/wnKn2LH4JohhRHHX7",
    sitemapCandidates: ["/moto_sitemap.json","/ai_sitemap.json","/sitemap.json"],
    minSentenceLen: 24,
    maxItems: 1400,
    maxInternalPages: 20,
    refreshHours: 24
  };
  const CFG = Object.assign({}, DEF, (window.MotoAI_CONFIG||{}));
  const HOSTKEY = (location.host||"site").replace(/[^a-z0-9.-]/gi,"_");

  const K = {
    corpus: `MotoAI_v19i_${HOSTKEY}_corpus`,
    ext:    `MotoAI_v19i_${HOSTKEY}_corpus_ext`,
    last:   `MotoAI_v19i_${HOSTKEY}_lastLearn`,
    mapH:   `MotoAI_v19i_${HOSTKEY}_lastMapHash`,
    sess:   `MotoAI_v19i_${HOSTKEY}_session`
  };

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const uniq = a => Array.from(new Set(a));
  const safe = s => { try{return JSON.parse(s)}catch(e){return null} };
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const tokenize = t => (t||"").toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu," ").split(/\s+/).filter(Boolean);
  const hashText = str => { try{return btoa(unescape(encodeURIComponent(str))).slice(0,60);}catch(e){return str.length.toString()} };

  // ===== UI =====
  const ui = `
  <div id="mta-root">
    <button id="mta-bubble" title="Chat">
      <svg viewBox="0 0 64 64" width="28" height="28">
        <circle cx="32" cy="32" r="28" fill="#0084ff"></circle>
        <path d="M20 36l9-11 6 6 9-9-9 14-6-6-9 6z" fill="#fff"></path>
      </svg>
    </button>
    <div id="mta-backdrop"></div>
    <section id="mta-card">
      <header id="mta-header">
        <div class="brand">
          <span class="b-name">${CFG.brand}</span>
          <nav class="quick">
            <a class="q" href="tel:${CFG.phone}" title="Gọi">📞</a>
            <a class="q" href="${CFG.zalo}" target="_blank" title="Zalo">Z</a>
            <a class="q" href="${CFG.whatsapp}" target="_blank" title="WA">W</a>
            <a class="q" href="${CFG.map}" target="_blank" title="Bản đồ">📍</a>
          </nav>
          <button id="mta-close">✕</button>
        </div>
      </header>
      <main id="mta-body"></main>
      <div id="mta-sugs"></div>
      <footer id="mta-input">
        <input id="mta-in" placeholder="Nhập câu hỏi..." />
        <button id="mta-send">Gửi</button>
      </footer>
    </section>
  </div>`;

  const css = `
  :root { --mta-blue:#0084ff; --mta-bg:#fff; --mta-text:#0b1220 }
  #mta-root{position:fixed;left:16px;bottom:20px;z-index:99999;font-family:-apple-system,system-ui}
  #mta-bubble{width:56px;height:56px;border:none;border-radius:14px;background:#e6f2ff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.18)}
  #mta-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:.15s}
  #mta-backdrop.show{opacity:1;pointer-events:auto}
  #mta-card{position:fixed;left:0;right:0;bottom:0;margin:auto;width:min(900px,calc(100% - 24px));height:66vh;max-height:720px;background:var(--mta-bg);color:var(--mta-text);border-radius:16px 16px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,.2);transform:translateY(110%);transition:.18s ease-out;display:flex;flex-direction:column;overflow:hidden}
  #mta-card.open{transform:translateY(0)}
  #mta-body{flex:1;overflow:auto;padding:10px 12px;font-size:15px;background:#fff}
  .m-msg{margin:8px 0;padding:10px 12px;border-radius:14px;max-width:84%;line-height:1.45;box-shadow:0 2px 6px rgba(0,0,0,.06)}
  .m-msg.user{background:#e9f3ff;margin-left:auto}
  .m-msg.bot{background:#f9fafb}
  #mta-input{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(0,0,0,.06)}
  #mta-in{flex:1;padding:10px;border-radius:10px;border:1px solid rgba(0,0,0,.12)}
  #mta-send{background:var(--mta-blue);color:#fff;border:none;border-radius:10px;padding:10px 14px;cursor:pointer}
  `;

  function injectUI(){
    if($('#mta-root')) return;
    const wrap=document.createElement('div'); wrap.innerHTML=ui;
    document.body.appendChild(wrap.firstElementChild);
    const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  }

  const sleepTyping = () => sleep(2000 + Math.random()*3000);

  function addMsg(role,text){
    if(!text) return;
    const el=document.createElement('div');
    el.className='m-msg '+(role==='user'?'user':'bot');
    el.textContent=text;
    $('#mta-body').appendChild(el);
    $('#mta-body').scrollTop=$('#mta-body').scrollHeight;
  }

  function showTyping(){
    const d=document.createElement('div');
    d.id='mta-typing'; d.className='m-msg bot'; d.textContent='...';
    $('#mta-body').appendChild(d);
    $('#mta-body').scrollTop=$('#mta-body').scrollHeight;
  }
  function hideTyping(){ const d=$('#mta-typing'); if(d) d.remove(); }

  const polite = t => `Mình đang xem qua thông tin... ${t}`;

  async function sendUser(text){
    addMsg('user',text);
    showTyping();
    await sleepTyping();
    hideTyping();
    addMsg('bot', polite("Chào bạn, mình sẵn sàng giúp nhé."));
  }

  function openChat(){ $('#mta-card').classList.add('open'); $('#mta-backdrop').classList.add('show'); $('#mta-bubble').style.display='none'; }
  function closeChat(){ $('#mta-card').classList.remove('open'); $('#mta-backdrop').classList.remove('show'); $('#mta-bubble').style.display='flex'; }

  document.addEventListener("DOMContentLoaded",()=>{
    injectUI();
    $('#mta-bubble').addEventListener('click',openChat);
    $('#mta-close').addEventListener('click',closeChat);
    $('#mta-backdrop').addEventListener('click',closeChat);
    $('#mta-send').addEventListener('click',()=>{const v=$('#mta-in').value.trim();if(!v)return;$('#mta-in').value='';sendUser(v);});
  });

})();
