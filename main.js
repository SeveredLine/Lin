document.addEventListener("DOMContentLoaded", async () => {
  const pages =['tab0.html', 'tab1.html', 'tab2.html', 'tab3.html'];
  let isHtmlLoaded = false;
  
  try {
    const fetchPromises = pages.map((page, index) =>
      fetch(page)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.text();
        })
        .then(html => {
          document.getElementById(`page-${index}`).innerHTML = html;
        })
    );
    await Promise.all(fetchPromises);
    isHtmlLoaded = true;
  } catch (error) {
    console.error("加载片段失败：", error);
    document.body.innerHTML = `<h2 style="color:red; text-align:center; padding: 20px;">跨域错误或文件未找到。<br>请确保您正在通过 HTTP 服务运行此项目！</h2>`;
  }

  if (isHtmlLoaded) {
    try {
      initApp();
    } catch (e) {
      console.error("应用初始化过程中出现非致命错误：", e);
    }
  }
});

function initApp() {
  // ================= 基础交互与 UI =================
  const tabs = document.querySelectorAll('.tab');
  const pagesContainer = document.querySelectorAll('.page');
  const root = document.documentElement;

  // 螺旋环渲染
  const spiralContainer = document.getElementById('spirals');
  for (let i = 0; i < 14; i++) {
    let ring = document.createElement('div');
    ring.className = 'spiral-ring';
    spiralContainer.appendChild(ring);
  }

  // ====== 封面合上书本逻辑 ======
  window.closeBook = function() {
    tabs.forEach(t => t.classList.remove('active'));
    pagesContainer.forEach(page => page.classList.remove('flipped'));
  };

  const backAreas = document.querySelectorAll('.close-book-area');
  backAreas.forEach(area => {
    area.addEventListener('click', window.closeBook);
  });

  // 默认启动时翻开封面（进入第一页）
  setTimeout(() => {
    document.querySelector('.page[data-index="-1"]').classList.add('flipped');
  }, 400);

  // ====== 标签页切换逻辑 ======
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetIndex = parseInt(tab.getAttribute('data-index'));
      
      if (targetIndex === 2) {
        generatePlant(); 
      }
      
      pagesContainer.forEach((page) => {
        const pageIndex = parseInt(page.getAttribute('data-index'));
        // 点击任意书页时，封面及其之前的页面必须保持翻开状态
        if (pageIndex < targetIndex || pageIndex === -1) {
          page.classList.add('flipped');
        } else {
          page.classList.remove('flipped');
        }
      });
    });
  });

  // 暗黑模式灯绳 - 带水波纹扩散特效
  const lampCord = document.getElementById('lampCord');
  let isDarkMode = false;
  const toggleDarkMode = (e) => {
    if(e) e.preventDefault();
    lampCord.classList.add('pulled');
    setTimeout(() => {
      lampCord.classList.remove('pulled');
      const switchTheme = () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
      };
      
      // 检测浏览器是否支持全新的 View Transitions 水波纹 API
      if (document.startViewTransition) {
        const rect = lampCord.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.bottom - 200;
        const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        
        document.documentElement.style.setProperty('--ripple-x', `${x}px`);
        document.documentElement.style.setProperty('--ripple-y', `${y}px`);
        document.documentElement.style.setProperty('--ripple-r', `${maxRadius}px`);
        document.startViewTransition(switchTheme);
      } else {
        switchTheme();
      }
    }, 350);
  };
  lampCord.addEventListener('mousedown', toggleDarkMode);
  lampCord.addEventListener('touchstart', toggleDarkMode);

  // ================= 诊室聊天功能 =================
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatHistory = document.getElementById('chat-history');
  const chatPage = document.getElementById('page-0');
  const globalOverlay = document.getElementById('global-overlay');

  // 1. OH卡字卡和图卡图床数据
  const ohWords =["8cuxn2","f2eyxf","ma8rol","ynq3b0","k3foo3","hd3568","i3o0xp","9lrdp9","68632e","uvr9tv","w0thk5","ujmmpo","q66smu","zyvinv","ia8mus","8knys3","077i0k","skos8v","3u1hv7","kowbr0","xnkky0","tfck9d","sjkl40","evboxw","ml853c","2lyqng","475w7u","1nath3","oed8o3","6cyy5v","5c33q8","bnp85w","ajk2sa","mrlu2c","uwu7bb","5w68r0","vut2kq","zaqb46","o0lkvy","0pt4ij","mynr0h","garhko","0j5370","nsd2e0","o9z0g0","4vke1u","vir293","2ncnww","tgodj4","ltsac7","3gskyd","2qa3mn","6bt92x","x4xa3m","oklbo5","0kidq6","0y57mk","am2kqg","v5uqh1","z87bjv","hq2lc6","g06q99","cw11bo","hytjao","ch3zhc","8w0hv6","nbpsfi","l597w7","n34zyi","f15yek","be2yv2","d4imbq","5fejh1","a4dsm1","44o0pa","21k2l2","qkaxrb","1u46i2","vc5lf6","6a1ktm","9rl12m","hl18q6","jfkj5s","s4x2j5","qgpxx0","yf8rwl","l26hfd","8o38z8"];
  const ohImages =["t7nxvt","cbtwhq","k7tmry","sk8hvu","macnbz","49aiff","bwazsv","jcccmx","c00lc2","4d2px1","knvkbd","yux922","vhcjbb","upleiw","rxlk8x","7ywke2","013zs9","o9jvrp","slwxks","5pwwd5","6d25m3","22psds","hdgxtx","vksul3","dgvz2e","cztrdd","sx8va6","1fz3sp","e04m72","b2h400","bq1gwn","tv5ave","fcfvpq","e1m3bh","1mw4zo","ywv2v9","ie03kj","7eynf7","w9ucpp","rb4hux","rhwin1","5okqrp","h3j4k8","vcruzy","m12coa","s41zvs","9v5was","v2cvjw","77pbia","0nkcds","euw7g2","vze43r","8cc15t","9vm86f","u6czqn","8x1sd8","c5d43l","n68ngq","ewb4zu","vzwkm8","r2du4n","5bcvvk","tbrvza","wc5ujj","kdoe5h","fgn5fv","8usqhh","ccpkcx","gy9bx0","43eq4w","972dt9","f09sze","zdmzxq","9b6wfo","37pka1","od7bxy","82yiep","fbc7rw","oyo4nv","xhb8ox","m371uo","c4w4sy","l6gsz4","np2s61","ovwh0m","wl71lo","6ufv4h","qc6v18"];

  function sendOHCard() {
    globalOverlay.innerHTML = '';
    const randomWord = ohWords[Math.floor(Math.random() * ohWords.length)];
    const randomImage = ohImages[Math.floor(Math.random() * ohImages.length)];
    
    const wrapper = document.createElement('div');
    wrapper.className = 'oh-card-wrapper';
    wrapper.innerHTML = `
      <div style="position: relative; width: 220px; height: 320px; margin-bottom: 15px; cursor: pointer; perspective: 1000px;" onclick="this.querySelector('.oh-inner').style.transform = this.querySelector('.oh-inner').style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';">
        <div class="oh-inner" style="position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d;">
          <!-- 牌背 -->
          <div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, #a29bfe, #fd79a8); border: 8px solid #fcfcfc; box-sizing: border-box; border-radius: 12px; backface-visibility: hidden; box-shadow: inset 0 0 10px rgba(0,0,0,0.1), 0 8px 30px rgba(0,0,0,0.2); display:flex; justify-content:center; align-items:center; flex-direction:column; cursor: pointer;">
            <div style="font-size: 32px; margin-bottom: 8px;">🌌</div>
            <div style="color:rgba(255,255,255,0.9); font-weight:900; font-size:16px; letter-spacing:1px; font-family:sans-serif;">OH CARD</div>
          </div>
          <!-- 牌面 -->
          <div style="position: absolute; width: 100%; height: 100%; transform: rotateY(180deg); backface-visibility: hidden; display: flex; justify-content: center; align-items: center; background:#fff; border-radius:12px; overflow:hidden;">
            <img src="https://files.catbox.moe/${randomWord}.png" style="position: absolute; width: 92%; height: 92%; object-fit: contain; z-index: 1;">
            <img src="https://files.catbox.moe/${randomImage}.jpg" style="position: absolute; width: 72%; height: 72%; object-fit: contain; z-index: 2; transition: transform 0.3s;" onmouseover="this.style.transform='rotate(5deg) scale(1.05)'" onmouseout="this.style.transform='rotate(0deg) scale(1)'">
          </div>
        </div>
      </div>
      <p style="text-align:center; color: var(--text-main); font-weight: 600; margin-bottom: 5px;">你抽到了一张 OH 卡</p>
      <p style="text-align:center; color: var(--text-ai); font-size: 13px; margin-bottom:15px;">请观察画面，你最先注意到的是什么？</p>
      <button class="close-overlay-btn" onclick="document.getElementById('global-overlay').innerHTML=''">收起卡片</button>
    `;
    globalOverlay.appendChild(wrapper);

    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-msg';
    aiMsg.innerText = "我递给了你一张OH卡，看看书本上方的浮层。点击卡牌可以翻面。";
    chatHistory.appendChild(aiMsg);
    chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });
  }

  // JSON 量表引擎
  window.loadAndShowScale = async function(scaleId) {
    try {
      const res = await fetch(`scales/${scaleId}.json`);
      if (!res.ok) throw new Error("找不到量表文件");
      const scale = await res.json();
      renderScaleUI(scale);
    } catch (e) {
      console.error(e);
      const err = document.createElement('div'); err.className = 'ai-msg';
      err.innerText = `[系统提示] 无法加载量表 ${scaleId}.json`;
      chatHistory.appendChild(err);
    }
  };

  function renderScaleUI(scale) {
    globalOverlay.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'scl-wrapper';
    
    let formHTML = `
      <div class="scl-title">${scale.title}</div>
      <div class="scl-desc">${scale.desc}</div>
      <div style="max-height:60vh; overflow-y:auto; padding-right:10px; margin-bottom:15px;" id="scale-questions-container">
    `;
    
    // 动态生成选项 Radio 组
    const optionsHTML = scale.options.map(opt => 
      `<label><input type="radio" value="${opt.value}"><span>${opt.label}</span></label>`
    ).join('');

    scale.questions.forEach((q, idx) => {
      formHTML += `
        <div class="scl-q">
          <div class="scl-q-text">${idx+1}. ${q.q}</div>
          <div class="scl-options" data-factor="${q.f || ''}" data-idx="${idx}">
            ${optionsHTML.replace(/<input type="radio"/g, `<input type="radio" name="sq${idx}"`)}
          </div>
        </div>
      `;
    });

    formHTML += `</div><button class="close-overlay-btn" id="submitScaleBtn">提交量表并发送给医生</button>
                 <button class="close-overlay-btn" style="background:transparent; color:#999; box-shadow:none;" onclick="document.getElementById('global-overlay').innerHTML=''">取消填写</button>`;
    
    wrapper.innerHTML = formHTML;
    globalOverlay.appendChild(wrapper);

    // 默认选中第一项防呆
    scale.questions.forEach((_, idx) => {
      const firstRadio = document.querySelector(`input[name="sq${idx}"]`);
      if (firstRadio) firstRadio.checked = true;
    });

    document.getElementById('submitScaleBtn').onclick = () => {
      let totalScore = 0; let posItems = 0;
      let factorScores = {};
      
      // 初始化因子分数
      if (scale.factors) {
        for (let k in scale.factors) factorScores[k] = 0;
      }

      scale.questions.forEach((q, idx) => {
        let val = parseInt(document.querySelector(`input[name="sq${idx}"]:checked`)?.value || 0);
        totalScore += val;
        if (val > 1) posItems++;
        if (q.f && factorScores[q.f] !== undefined) factorScores[q.f] += val;
      });

      // 动态生成报告
      let totalMean = (totalScore / scale.questions.length).toFixed(2);
      let posMean = posItems > 0 ? (totalScore / posItems).toFixed(2) : 0;
      
      let report = `${scale.title} 结果\n--------------------\n【总体情况】\n总分: ${totalScore}\n总均分: ${totalMean}\n阳性项目数: ${posItems}\n阳性症状均分: ${posMean}\n--------------------\n`;
      
      if (scale.factors) {
        report += `【各症状因子分】\n`;
        for (let k in scale.factors) {
           let mean = (factorScores[k] / scale.factors[k].count).toFixed(2);
           report += `${scale.factors[k].name}: ${mean}\n`;
        }
      }

      if (window.parent !== window) {
        window.parent.postMessage({ type: 'SEND_CHAT_TO_ST', text: `这是我的${scale.title}结果：\n${report}` }, '*');
      }

      document.getElementById('global-overlay').innerHTML = `
        <div class="scl-wrapper" style="text-align:center;">
          <h3 style="color:#e74c3c; margin-bottom:15px;">测评已完成</h3>
          <p style="font-size:14px; color:var(--text-main); margin-bottom:10px;">总分: ${totalScore}</p>
          <p style="font-size:12px; color:var(--text-ai); margin-bottom:20px;">报告已同步给林医生，请等待她的分析。</p>
          <button class="close-overlay-btn" onclick="document.getElementById('global-overlay').innerHTML=''">关闭面板</button>
        </div>
      `;
    };
  }

  // 3. 聊天输入逻辑 & 状态控制
  let isGenerating = false;

  function sendMessage() {
    // 如果当前正在生成，点击按钮则触发“停止请求”
    if (isGenerating) {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'STOP_GEN_TO_ST' }, '*');
      }
      return;
    }

    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SEND_CHAT_TO_ST', text: text }, '*');
      
      const tempNote = document.createElement('div');
      tempNote.className = 'user-note temp-note';
      tempNote.style.opacity = '0.5';
      tempNote.innerText = text;
      chatHistory.appendChild(tempNote);
      
      if (chatPage) {
        setTimeout(() => chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' }), 10);
      }
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // 监听输入框变化，实时同步回酒馆底层
  chatInput.addEventListener('input', (e) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SYNC_INPUT_TO_ST', text: e.target.value }, '*');
    }
  });


  // ================= SVG 植物生成引擎 =================
  let plantGenerated = false;
  function generatePlant() {
    if (plantGenerated) return;
    const container = document.getElementById('svgGarden');
    if (container && container.dataset.presentActive === "true") return;
    const label = document.getElementById('gardenLabel');
    if (!container) return;

    const date = new Date();
    const month = date.getMonth();
    
    // 植物配置字典：arch(架构), fType(花型), lShape(叶型)
    const monthNames =["一月 迎春", "二月 瑞香", "三月 桃花", "四月 蔷薇", "五月 鸢尾", "六月 栀子", "七月 荷花", "八月 桂花", "九月 菊花", "十月 芙蓉", "十一 山茶", "十二 腊梅"];
    
    const pC =[
      { arch: 'vine',  fType: 'jasmine', lShape: 'willow', tCol: '#4a5d23', fCol:['#FFD700'], lCol: '#5c7a1a', name: '迎春' }, // 1月: 藤本垂枝, 黄色小花
      { arch: 'herb',  fType: 'cluster', lShape: 'tear',   tCol: '#5c4033', fCol:['#E6A8D7'], lCol: '#7a8f6a', name: '瑞香' }, // 2月: 草本单轴, 顶生花簇
      { arch: 'tree',  fType: 'peach',   lShape: 'none',   tCol: '#3E2F26', fCol:['#FFB7C5', '#FF69B4'], lCol: '#2d4c1e', name: '桃花' }, // 3月: 木本, 花贴老枝, 无叶
      { arch: 'vine',  fType: 'rose',    lShape: 'sharp',  tCol: '#556B2F', fCol: ['#E32636', '#800020'], lCol: '#3D5222', name: '蔷薇' }, // 4月: 藤本, 玫瑰花
      { arch: 'basal', fType: 'iris',    lShape: 'sword',  tCol: '#4F7942', fCol:['#6A5ACD', '#E6E6FA'], lCol: '#4F7942', name: '鸢尾' }, // 5月: 基生, 剑叶, 蓝紫花
      { arch: 'herb',  fType: 'simple',  lShape: 'round',  tCol: '#5C5448', fCol:['#FFFFFF', '#F5F5F5'], lCol: '#2E472D', name: '栀子' }, // 6月: 草本/灌木, 白花对生叶
      { arch: 'basal', fType: 'lotus',   lShape: 'lotus',  tCol: '#2E8B57', fCol: ['#FF69B4', '#FFC0CB'], lCol: '#2E8B57', name: '荷花' }, // 7月: 基生水生, 挺水大圆叶, 巨型花
      { arch: 'tree',  fType: 'micro',   lShape: 'tear',   tCol: '#696969', fCol: ['#FFA500'], lCol: '#355E3B', name: '桂花' }, // 8月: 木本, 浓密绿叶, 极小橙黄簇花
      { arch: 'herb',  fType: 'mum',     lShape: 'lobed',  tCol: '#6B8E23', fCol: ['#FFD700', '#DAA520'], lCol: '#556B2F', name: '菊花' }, // 9月: 草本单轴, 顶生大头状花序
      { arch: 'tree',  fType: 'hibiscus',lShape: 'broad',  tCol: '#5E4B3C', fCol:['#FF69B4', '#FFF0F5'], lCol: '#4F7942', name: '芙蓉' }, // 10月: 木本, 枝头大花, 阔叶
      { arch: 'tree',  fType: 'rose',    lShape: 'round',  tCol: '#3B3C36', fCol: ['#DC143C'], lCol: '#004225', name: '山茶' }, // 11月: 木本, 墨绿叶, 深红花
      { arch: 'tree',  fType: 'peach',   lShape: 'none',   tCol: '#2F2F2F', fCol: ['#FFFF00', '#FFD700'], lCol: '#1C1C1C', name: '腊梅', sympodial: true } // 12月: 木本合轴(之字形), 无叶, 黄花
    ];

    const cfg = pC[month];
    
    // 动态内联样式
    let svgContent = `
      <svg viewBox="0 0 400 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15));">
      <style>
        .botany-stem { fill: none; stroke-linecap: round; stroke-linejoin: round; animation: drawStem 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .botany-leaf { opacity: 0; animation: popOrgan 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .botany-flower { opacity: 0; animation: popOrgan 1.4s cubic-bezier(0.34, 1.56, 0.4, 1.2) forwards; }
        @keyframes drawStem { to { stroke-dashoffset: 0; } }
        @keyframes popOrgan { 
          0% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sc)); opacity: 1; }
        }
      </style>
      <g transform="translate(200, 420)">
    `;

    let paths = []; let organs =[];
    
    // --- 核心绘图辅助函数 ---
    function addStem(x1, y1, cx, cy, x2, y2, width, color, delay) {
      let len = Math.hypot(x2-x1, y2-y1) * 1.2;
      paths.push(`<path class="botany-stem" d="M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" style="stroke:${color}; stroke-width:${width.toFixed(1)}px; stroke-dasharray:${len}; stroke-dashoffset:${len}; animation-delay:${delay}s;" />`);
    }

    // 生成叶片 SVG 路径
    function getLeafPath(shape) {
      const dict = {
        willow: 'M0,0 C-4,-15 -4,-35 0,-45 C4,-35 4,-15 0,0 Z',
        sword:  'M0,0 Q-10,-40 0,-100 Q10,-40 0,0 Z',
        lotus:  'M0,-10 C-35,-10 -45,-35 0,-45 C45,-35 35,-10 0,-10 Z',
        lobed:  'M0,0 C-10,-10 -20,-5 -15,-20 C-25,-25 -10,-35 0,-40 C10,-35 25,-25 15,-20 C20,-5 10,-10 0,0 Z',
        broad:  'M0,0 C-20,-10 -25,-30 0,-45 C25,-30 20,-10 0,0 Z',
        round:  'M0,0 C-15,-8 -18,-22 0,-30 C18,-22 15,-8 0,0 Z',
        tear:   'M0,0 C-6,-8 -8,-20 0,-25 C8,-20 6,-8 0,0 Z',
        sharp:  'M0,0 L-8,-15 L0,-28 L8,-15 Z'
      };
      return dict[shape] || '';
    }

    function addLeaf(x, y, angle, scale, delay) {
      if(cfg.lShape === 'none') return;
      let path = getLeafPath(cfg.lShape);
      organs.push(`<g class="botany-leaf" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;">
        <path d="${path}" fill="${cfg.lCol}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
      </g>`);
    }

    // 生成花朵构造
    function addFlower(x, y, angle, scale, delay) {
      let fHtml = '';
      let c1 = cfg.fCol[0]; let c2 = cfg.fCol[1] || c1;
      
      if (cfg.fType === 'peach') {
        // 5瓣桃花/腊梅 (贴着枝干生长)
        for(let i=0; i<5; i++) {
          fHtml += `<path d="M0,0 C-6,-10 -10,-18 0,-22 C10,-18 6,-10 0,0 Z" fill="${c1}" transform="rotate(${i*72})" opacity="0.9"/>`;
        }
        fHtml += `<circle r="3" fill="${c2}" />`;
      } 
      else if (cfg.fType === 'lotus') {
        // 层叠荷花
        for(let i=-2; i<=2; i++) {
          fHtml += `<path d="M0,0 C-10,-15 -8,-45 0,-50 C8,-45 10,-15 0,0 Z" fill="${c1}" transform="rotate(${i*20})" opacity="0.85"/>`;
        }
        for(let i=-1; i<=1; i++) {
          fHtml += `<path d="M0,0 C-6,-10 -5,-30 0,-35 C5,-30 6,-10 0,0 Z" fill="${c2}" transform="rotate(${i*15})" opacity="0.95"/>`;
        }
      }
      else if (cfg.fType === 'mum') {
        // 菊花 (细长管状花瓣)
        for(let i=0; i<24; i++) {
          fHtml += `<path d="M0,0 Q-3,-20 0,-35 Q3,-20 0,0 Z" fill="${c1}" transform="rotate(${i*15})" opacity="0.9"/>`;
        }
        fHtml += `<circle r="6" fill="${c2}" />`;
      }
      else if (cfg.fType === 'iris') {
        // 鸢尾花 (上下垂瓣)
        fHtml += `<path d="M0,0 C-15,-20 -20,-40 0,-45 C20,-40 15,-20 0,0 Z" fill="${c2}" transform="rotate(0)" opacity="0.9"/>`; // 上
        fHtml += `<path d="M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z" fill="${c1}" transform="rotate(60)" opacity="0.9"/>`;  // 右下
        fHtml += `<path d="M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z" fill="${c1}" transform="rotate(-60)" opacity="0.9"/>`; // 左下
      }
      else if (cfg.fType === 'rose') {
        // 蔷薇/山茶 (圆形交叠花瓣)
        for(let i=0; i<8; i++) {
          let s = 1 - (i*0.08);
          fHtml += `<circle cx="0" cy="-6" r="10" fill="${i%2===0?c1:c2}" transform="rotate(${i*65}) scale(${s})" opacity="0.9"/>`;
        }
      }
      else if (cfg.fType === 'hibiscus') {
        // 芙蓉 (阔大花瓣)
        for(let i=0; i<5; i++) {
          fHtml += `<path d="M0,0 C-20,-10 -25,-40 0,-45 C25,-40 20,-10 0,0 Z" fill="${c1}" transform="rotate(${i*72})" opacity="0.8"/>`;
        }
        fHtml += `<line x1="0" y1="0" x2="0" y2="-25" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>`;
      }
      else if (cfg.fType === 'jasmine' || cfg.fType === 'simple') {
        // 简单4-5瓣花
        for(let i=0; i<4; i++) {
          fHtml += `<path d="M0,0 Q-8,-15 0,-20 Q8,-15 0,0 Z" fill="${c1}" transform="rotate(${i*90})"/>`;
        }
        fHtml += `<circle r="2" fill="#FFD700" />`;
      }
      else if (cfg.fType === 'cluster' || cfg.fType === 'micro') {
        // 细碎簇生花 (桂花/瑞香)
        for(let i=0; i<5; i++) {
          let ox = (Math.random()-0.5)*15; let oy = (Math.random()-0.5)*15;
          fHtml += `<circle cx="${ox}" cy="${oy}" r="3" fill="${c1}" />`;
          fHtml += `<circle cx="${ox+3}" cy="${oy}" r="3" fill="${c1}" />`;
        }
      }

      organs.push(`<g class="botany-flower" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;">${fHtml}</g>`);
    }

    // ================= 生成算法 =================

    // 木本分形树 (桃花, 芙蓉, 山茶, 腊梅)
    function buildTree(x, y, angle, length, depth, width, delay) {
      if (depth === 0) return;
      let x2 = x + Math.sin(angle) * length;
      let y2 = y - Math.cos(angle) * length;
      
      let isSympodial = cfg.sympodial && depth < 5;
      let cx = x + Math.sin(angle + (isSympodial ? 0.3 : (Math.random()-0.5)*0.3)) * length * 0.5;
      let cy = y - Math.cos(angle + (isSympodial ? 0.3 : (Math.random()-0.5)*0.3)) * length * 0.5;

      addStem(x, y, cx, cy, x2, y2, width, cfg.tCol, delay);
      let isEndpoint = (depth === 1);
      
      if (cfg.fType === 'peach' || cfg.fType === 'micro') {
        if (depth <= 4 && Math.random() > 0.4) {
          addFlower(x2, y2, Math.random()*360, 0.6 + Math.random()*0.5, delay + 0.5);
        }
      } else {
        if (isEndpoint) addFlower(x2, y2, angle * 180 / Math.PI + (Math.random()*40-20), 1.0 + Math.random()*0.4, delay + 0.6);
      }

      if (!isEndpoint && cfg.lShape !== 'none' && Math.random() > 0.3) {
        addLeaf(x2, y2, (angle*180/Math.PI) + 60 + Math.random()*20, 0.7 + Math.random()*0.3, delay + 0.3);
        addLeaf(x2, y2, (angle*180/Math.PI) - 60 - Math.random()*20, 0.7 + Math.random()*0.3, delay + 0.3);
      }

      let branches = depth === 5 ? (2 + Math.floor(Math.random()*2)) : (Math.random() > 0.2 ? 2 : 1);
      for (let i = 0; i < branches; i++) {
        let dir = (i === 0) ? -1 : 1;
        let newAngle = angle + dir * (isSympodial ? 0.6 : 0.4) + (Math.random()*0.3 - 0.15);
        buildTree(x2, y2, newAngle, length * (0.65 + Math.random()*0.2), depth - 1, width * 0.7, delay + 0.15);
      }
    }

    // 基生/丛生型 (荷花, 鸢尾)
    function buildBasal() {
      let numStems = cfg.fType === 'lotus' ? (4 + Math.floor(Math.random()*3)) : (5 + Math.floor(Math.random()*4));
      for (let i = 0; i < numStems; i++) {
        let angle = (Math.random() - 0.5) * 0.8; // 随机发散角
        let length = 90 + Math.random() * 80;    // 随机高度
        let x2 = Math.sin(angle) * length;
        let y2 = -Math.cos(angle) * length;
        let delay = i * 0.15 + Math.random() * 0.1;
        
        if (cfg.fType === 'lotus') {
          // 荷花直立茎带微随机弯曲
          let cx = x2 * 0.5 + (Math.random() - 0.5) * 30;
          let cy = y2 * 0.5;
          addStem(0, 0, cx, cy, x2, y2, 3 + Math.random()*2, cfg.tCol, delay);
          
          if (i < 2 || Math.random() > 0.6) {
             addLeaf(x2, y2, angle*180/Math.PI + (Math.random()-0.5)*20, 1.0 + Math.random()*0.8, delay + 0.4);
          } else {
             addFlower(x2, y2, angle*180/Math.PI + (Math.random()-0.5)*15, 1.2 + Math.random()*0.6, delay + 0.5);
          }
        } else {
          // 鸢尾：中心长花，两侧长叶
          if (i === Math.floor(numStems/2) || (numStems > 6 && i === 0)) { 
            let fLen = length * (1.1 + Math.random()*0.3);
            let cx = (Math.random() - 0.5) * 40; // 花葶随机歪曲
            let cy = -fLen * 0.5;
            let fx = Math.sin(angle) * fLen * 0.3;
            let fy = -fLen;
            addStem(0, 0, cx, cy, fx, fy, 4 + Math.random()*2, cfg.tCol, delay);
            addFlower(fx, fy, (Math.random() - 0.5) * 30, 1.2 + Math.random()*0.5, delay + 0.5);
          } else {
            // 弯曲剑叶
            let cx = x2 * (1.2 + Math.random()*0.8); 
            let cy = y2 * (0.3 + Math.random()*0.4);
            addStem(0, 0, cx, cy, x2, y2, 6 + Math.random()*4, cfg.lCol, delay);
          }
        }
      }
    }

    // 草本单轴型 (菊花, 栀子, 瑞香)
    function buildHerb() {
      let height = 180 + Math.random() * 70; // 随机主茎高度
      let curveX = (Math.random() - 0.5) * 80; // 随机弯曲控制点
      let endX = curveX * 0.5 + (Math.random() - 0.5) * 40; // 随机顶端偏离
      
      addStem(0, 0, curveX, -height*0.5, endX, -height, 6 + Math.random()*3, cfg.tCol, 0);
      
      let steps = 4 + Math.floor(Math.random() * 4); // 随机叶片层数
      for(let i=1; i<steps; i++) {
        // 利用二次贝塞尔方程，计算叶子在弯曲茎干上的精准坐标
        let t = i / steps;
        let mt = 1 - t;
        let px = mt*mt*0 + 2*mt*t*curveX + t*t*endX;
        let py = mt*mt*0 + 2*mt*t*(-height*0.5) + t*t*(-height);
        let delay = i * 0.15 + Math.random() * 0.1;
        
        let lAng = (i % 2 === 0) ? -70 : 70;
        lAng += (Math.random() - 0.5) * 40; // 随机叶片角度
        let lScale = 0.8 + Math.random() * 0.6; // 随机叶片大小

        addLeaf(px, py, lAng, lScale, delay);
        if (cfg.fType === 'simple' || Math.random() > 0.7) { 
          addLeaf(px, py, -lAng + (Math.random()-0.5)*30, lScale * (0.8+Math.random()*0.3), delay); // 对生或几率多生
        }
      }
      addFlower(endX, -height, (Math.random() - 0.5) * 40, 1.5 + Math.random() * 0.7, 1.0);
    }

    // 藤本垂枝型 (迎春, 蔷薇)
    function buildVine() {
      let numVines = 3 + Math.floor(Math.random() * 4); // 3 到 6 根藤条
      for(let i = 0; i < numVines; i++) {
        let sign = (i % 2 === 0) ? 1 : -1;
        let angle = sign * (0.2 + Math.random() * 0.6); // 随机抛射角
        let len = 140 + Math.random() * 100; // 随机藤条长度
        
        // 生成受重力拉扯的贝塞尔曲线
        let cx = Math.sin(angle) * len * (1 + Math.random()*0.5); 
        let cy = -Math.cos(angle) * len * (1 + Math.random()*0.5);
        let x2 = cx + sign * len * (0.1 + Math.random()*0.5); // 末端自然下坠
        let y2 = cy + len * (0.4 + Math.random()*0.7);
        
        let delay = i * 0.2 + Math.random() * 0.15;
        addStem(0, 0, cx, cy, x2, y2, 3 + Math.random()*2, cfg.tCol, delay);
        
        let numNodes = 3 + Math.floor(Math.random() * 5); // 每根藤条随机节点数
        for(let k = 1; k <= numNodes; k++) {
          let t = k / (numNodes + 1) + (Math.random() - 0.5) * 0.1; // 沿途节点加入微调抖动
          if (t <= 0 || t >= 1) continue;
          let mt = 1 - t;
          let px = mt*mt*0 + 2*mt*t*cx + t*t*x2;
          let py = mt*mt*0 + 2*mt*t*cy + t*t*y2;
          
          if(Math.random() > 0.1) addLeaf(px, py, sign*90 + (Math.random()*60-30), 0.6 + Math.random()*0.5, delay + t);
          if(Math.random() > 0.3) addFlower(px, py, sign*45 + (Math.random()*50-25), 0.5 + Math.random()*0.5, delay + t + 0.2);
        }
      }
    }

    // 路由分发 (为 Tree 架构也注入初始角度与长度的随机性)
    if (cfg.arch === 'tree') buildTree(0, 0, (Math.random()-0.5)*0.2, 55 + Math.random()*15, 5, 12 + Math.random()*3, 0.2);
    else if (cfg.arch === 'basal') buildBasal();
    else if (cfg.arch === 'herb') buildHerb();
    else if (cfg.arch === 'vine') buildVine();

    svgContent += paths.join('') + organs.join('') + `</g></svg>`;
    container.innerHTML = svgContent;
    label.innerText = monthNames[month];
    plantGenerated = true;
  }

  // ================= 音乐播放器系统 (Howler.js) =================
  // 前端JS由于安全限制无法读取文件系统结构，这里将结构映射为JSON
  const filesMap = {
    morning:[
      "atlasaudio-corporate-491319.mp3", "atlasaudio-jazz-490623.mp3", "atlasaudio-upbeat-491082.mp3",
      "paulyudin-piano-music-piano-485929.mp3", "paulyudin-technology-tech-technology-484304.mp3",
      "prettyjohn1-emotional-piano-487334.mp3", "prettyjohn1-medical-doctor-clinic-background-487928.mp3",
      "the_mountain-chill-485562.mp3", "the_mountain-luxury-luxury-music-490006.mp3",
      "the_mountain-news-news-music-490008.mp3", "the_mountain-presentation-presentation-music-490011.mp3",
      "the_mountain-relaxing-relaxing-music-492810.mp3", "the_mountain-successful-492812.mp3", "the_mountain-wedding-487025.mp3"
    ],
    afternoon:[
      "apalonbeats-afrobeat-afro-beat-2-491432.mp3", "maksym_dudchyk-lost-in-love-hip-hop-background-music-for-video-stories-43-second-490026.mp3",
      "mondamusic-background-music-491692.mp3", "mondamusic-promo-advertising-music-491682.mp3",
      "mondamusic-upbeat-491686.mp3", "paulyudin-no-copyright-music-482400.mp3",
      "the_mountain-advertising-advertising-music-492799.mp3", "the_mountain-hopeful-hopeful-music-492806.mp3",
      "the_mountain-meditation-meditation-music-490007.mp3", "the_mountain-piano-background-music-487020.mp3",
      "the_mountain-soft-background-music-492811.mp3", "the_mountain-upbeat-upbeat-background-music-487024.mp3"
    ],
    evening:[
      "eliveta-corporate-491206.mp3", "mondamusic-asian-491695.mp3", "mondamusic-chill-491681.mp3",
      "mondamusic-chill-beats-chill-491676.mp3", "mondamusic-dark-ambient-soundscape-dreamscape-2-487315.mp3",
      "mondamusic-dark-ambient-soundscape-dreamscape-2-491706.mp3", "mondamusic-educational-presentation-tutorial-music-491691.mp3",
      "mondamusic-lofi-chill-491719.mp3", "mondamusic-lofi-lofi-chill-lofi-girl-491690.mp3",
      "mondamusic-lounge-491696.mp3", "mondamusic-lounge-jazz-elevator-music-487312.mp3",
      "mondamusic-minimal-491664.mp3", "mondamusic-positive-house-491683.mp3", "mondamusic-vlogs-vlog-youtube-491672.mp3",
      "prettyjohn1-lofi-lofi-chill-lofi-girl-490466.mp3", "prettyjohn1-sad-background-music-489875.mp3", "the_mountain-emotional-emotional-music-490002.mp3"
    ]
  };

  // 根据当前时间判断时段
  const hour = new Date().getHours();
  let timePeriod = "morning";
  if (hour >= 12 && hour < 18) {
    timePeriod = "afternoon";
  } else if (hour >= 18 || hour < 5) {
    timePeriod = "evening";
  }

  // 解析文件名功能：第一个 - 之前为歌手，最后一个 - 之后为ID，中间为歌名
  function parseFileName(filename) {
    const rawName = filename.replace('.mp3', '');
    const parts = rawName.split('-');
    
    if (parts.length < 3) {
      return { artist: "未知艺术家", title: rawName };
    }
    
    const artist = parts[0].replace(/_/g, ' ').toUpperCase();
    const title = parts.slice(1, -1).join(' ').replace(/_/g, ' ');
    return { artist: artist, title: title };
  }

  // 组装当前播放列表
  let playlist = filesMap[timePeriod].map(filename => {
    const info = parseFileName(filename);
    return { artist: info.artist, name: info.title, src: `/Lin/music/${timePeriod}/${encodeURIComponent(filename)}` };
  });

  // 读取本地存储的播放器设置（针对当前时段）
  const storageKey = `LinAudio_${timePeriod}`;
  let playerSettings = JSON.parse(localStorage.getItem(storageKey)) || { mode: 1, disabled:[], vol: 30 };
  let playMode = playerSettings.mode; // 0: 列表循环, 1: 随机播放, 2: 单曲循环
  
  function savePlayerSettings() {
    localStorage.setItem(storageKey, JSON.stringify(playerSettings));
  }

  // ================= 🎂 生日彩蛋特效引擎 =================
  window.activateBirthdayMode = function() {
    console.log("🎂 生日彩蛋触发！特别曲目已加入歌单。");
    
    // 1. 音乐逻辑
    const bdayTracks =[
      "the_mountain-birthday-490600.mp3",
      "the_mountain-cartoon-cartoon-music-489996.mp3"
    ].map(f => ({
      artist: parseFileName(f).artist, name: parseFileName(f).title, src: `/Lin/music/birthday/${encodeURIComponent(f)}`
    }));
    playlist.unshift(...bdayTracks);
    
    const albumArt = document.getElementById('album-art');
    if (albumArt) albumArt.className = 'p-album-art birthday';
    
    if(typeof renderPlaylist === 'function') renderPlaylist(); 
    if(currentHowl) {
        currentHowl.stop();
        loadTrack(0, true);
    }

    // 2. 触发满屏飘带纸屑 (2D Canvas)
    launchConfetti();

    // 3. 动态加载 Three.js 并在此处渲染 3D 礼盒，替换植物
    const gardenLabel = document.getElementById('gardenLabel');
    if (gardenLabel) gardenLabel.innerText = "生日快乐！点击拆开礼物 🎁";
    loadAndShowPresent();
  };

  // --- 彩蛋 1: 飘带与纸屑 ---
  function launchConfetti() {
    let oldCanvas = document.getElementById('confetti-canvas');
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    
    canvas.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:99999; pointer-events:none; opacity:0; transition:opacity 0.8s ease;';
    document.body.appendChild(canvas);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    });

    const ctx = canvas.getContext('2d');
    const retina = Math.min(2, window.devicePixelRatio || 1); 
    let w = window.innerWidth; let h = window.innerHeight;
    canvas.width = w * retina; canvas.height = h * retina;

    const DEG_TO_RAD = Math.PI / 180;
    const colors = [["#df0049", "#660671"],["#00e857", "#005291"], ["#2bebbc", "#05798a"],["#ffd200", "#b06c00"]];
    
    class Vector2 {
       constructor(x, y) { this.x = x; this.y = y; }
    }
    class EulerMass {
       constructor(x, y, mass, drag) {
           this.pos = new Vector2(x, y);
           this.mass = mass; this.drag = drag;
           this.force = new Vector2(0,0); this.vel = new Vector2(0,0);
       }
       AddForce(fx, fy) { this.force.x += fx; this.force.y += fy; }
       Integrate(dt) {
           let speed = Math.sqrt(this.vel.x*this.vel.x + this.vel.y*this.vel.y);
           let accX = (this.force.x - this.drag * this.mass * this.vel.x * speed) / this.mass;
           let accY = (this.force.y - this.drag * this.mass * this.vel.y * speed) / this.mass;
           this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
           this.vel.x += accX * dt; this.vel.y += accY * dt;
           this.force.x = 0; this.force.y = 0;
       }
    }

    class ConfettiRibbon {
       constructor(x, y) {
           this.particleCount = 20;
           this.particleDist = 8.0;
           this.particles =[];
           const ci = Math.floor(Math.random() * colors.length);
           this.front = colors[ci][0]; this.back = colors[ci][1];
           this.xOff = Math.cos(45 * DEG_TO_RAD) * 8.0;
           this.yOff = Math.sin(45 * DEG_TO_RAD) * 8.0;
           this.pos = new Vector2(x, y);
           this.prevPos = new Vector2(x, y);
           this.velInherit = Math.random() * 2 + 4;
           this.time = Math.random() * 100;
           this.oscSpeed = Math.random() * 2 + 2;
           this.oscDist = Math.random() * 40 + 40;
           this.ySpeed = Math.random() * 40 + 80;
           for(let i=0; i<this.particleCount; i++) {
               this.particles.push(new EulerMass(x, y - i * this.particleDist, 1, 0.05));
           }
       }
       update(dt) {
           this.time += dt * this.oscSpeed;
           this.pos.y += this.ySpeed * dt;
           this.pos.x += Math.cos(this.time) * this.oscDist * dt;
           this.particles[0].pos.x = this.pos.x;
           this.particles[0].pos.y = this.pos.y;
           let dx = this.prevPos.x - this.pos.x;
           let dy = this.prevPos.y - this.pos.y;
           let delta = Math.sqrt(dx*dx + dy*dy);
           this.prevPos.x = this.pos.x; this.prevPos.y = this.pos.y;

           for(let i=1; i<this.particleCount; i++) {
               let dirX = this.particles[i-1].pos.x - this.particles[i].pos.x;
               let dirY = this.particles[i-1].pos.y - this.particles[i].pos.y;
               let len = Math.sqrt(dirX*dirX + dirY*dirY);
               if(len>0){ dirX/=len; dirY/=len; }
               this.particles[i].AddForce(dirX * (delta/dt) * this.velInherit, dirY * (delta/dt) * this.velInherit);
           }
           for(let i=1; i<this.particleCount; i++) this.particles[i].Integrate(dt);
           for(let i=1; i<this.particleCount; i++) {
               let rpX = this.particles[i].pos.x - this.particles[i-1].pos.x;
               let rpY = this.particles[i].pos.y - this.particles[i-1].pos.y;
               let len = Math.sqrt(rpX*rpX + rpY*rpY);
               if(len>0){ rpX/=len; rpY/=len; }
               this.particles[i].pos.x = this.particles[i-1].pos.x + rpX * this.particleDist;
               this.particles[i].pos.y = this.particles[i-1].pos.y + rpY * this.particleDist;
           }
           if(this.pos.y > h + this.particleDist * this.particleCount) {
               this.pos.y = -Math.random() * h; this.pos.x = Math.random() * w;
               this.prevPos.x = this.pos.x; this.prevPos.y = this.pos.y;
               for(let i=0; i<this.particleCount; i++) {
                   this.particles[i].pos.x = this.pos.x;
                   this.particles[i].pos.y = this.pos.y - i * this.particleDist;
               }
           }
       }
       draw() {
           for(let i=0; i<this.particleCount-1; i++) {
               let p0x = this.particles[i].pos.x + this.xOff, p0y = this.particles[i].pos.y + this.yOff;
               let p1x = this.particles[i+1].pos.x + this.xOff, p1y = this.particles[i+1].pos.y + this.yOff;
               let side = (this.particles[i].pos.x - this.particles[i+1].pos.x)*(p1y - this.particles[i+1].pos.y) - 
                          (this.particles[i].pos.y - this.particles[i+1].pos.y)*(p1x - this.particles[i+1].pos.x);
               ctx.fillStyle = side < 0 ? this.front : this.back;
               ctx.beginPath();
               ctx.moveTo(this.particles[i].pos.x * retina, this.particles[i].pos.y * retina);
               ctx.lineTo(this.particles[i+1].pos.x * retina, this.particles[i+1].pos.y * retina);
               ctx.lineTo(p1x * retina, p1y * retina);
               ctx.lineTo(p0x * retina, p0y * retina);
               ctx.closePath();
               ctx.fill();
           }
       }
    }

    class Paper {
      constructor() {
        this.pos = { x: Math.random() * w, y: Math.random() * -h };
        this.rotationSpeed = Math.random() * 600 + 800;
        this.angle = DEG_TO_RAD * Math.random() * 360;
        this.rotation = DEG_TO_RAD * Math.random() * 360;
        this.size = 6.0;
        this.oscSpeed = Math.random() * 1.5 + 0.5;
        this.xSpeed = 40.0;
        this.ySpeed = Math.random() * 60 + 50.0;
        this.time = Math.random();
        const ci = Math.floor(Math.random() * colors.length);
        this.front = colors[ci][0]; this.back = colors[ci][1];
        this.corners = Array.from({length: 4}, (_, i) => ({
          x: Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45)),
          y: Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45))
        }));
      }
      update(dt) {
        this.time += dt;
        this.rotation += this.rotationSpeed * dt;
        this.pos.x += Math.cos(this.time * this.oscSpeed) * this.xSpeed * dt;
        this.pos.y += this.ySpeed * dt;
        if (this.pos.y > h) { this.pos.x = Math.random() * w; this.pos.y = -50; }
      }
      draw() {
        const cosA = Math.cos(DEG_TO_RAD * this.rotation);
        ctx.fillStyle = cosA > 0 ? this.front : this.back;
        ctx.beginPath();
        this.corners.forEach((c, i) => {
          const px = (this.pos.x + c.x * this.size) * retina;
          const py = (this.pos.y + c.y * this.size * cosA) * retina;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
      }
    }
    
    const entities =[];
    const paperCount = w < 768 ? 20 : 40;
    const ribbonCount = w < 768 ? 8 : 16;
    for (let i = 0; i < paperCount; i++) entities.push(new Paper());
    for (let i = 0; i < ribbonCount; i++) entities.push(new ConfettiRibbon(Math.random() * w, -Math.random() * h * 2));

    let lastTime = Date.now();
    let rafId;
    let isStopping = false;

    function animate() {
      const now = Date.now();
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      
      if (dt <= 0.001) dt = 0.001; 
      dt = Math.min(dt, 0.05);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      entities.forEach(p => { p.update(dt); p.draw(); });
      
      if (!isStopping) rafId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * retina; canvas.height = h * retina;
    });

    window.stopConfetti = () => {
      canvas.style.opacity = '0';
      setTimeout(() => {
        isStopping = true;
        cancelAnimationFrame(rafId);
        if (document.body.contains(canvas)) canvas.remove(); 
      }, 800);
    };
  }

  async function loadAndShowPresent() {
    const container = document.getElementById('svgGarden');
    if (!container) return;
    
    container.dataset.presentActive = "true"; 

    if (window.THREE) { 
      initPresent(container, window.THREE); 
      return; 
    }

    container.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-main); font-size:12px; font-weight:bold; opacity:0.6; animation: eqPulse 1s infinite alternate;">正在打包礼物...</div>`;

    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js');
      window.THREE = THREE; 
      initPresent(container, THREE);
    } catch (e) {
      console.error("[Lin] 3D 彩蛋引擎加载失败:", e);
      container.innerHTML = `<div style="text-align:center; padding-top:40px; color:#e74c3c; font-size:12px; font-weight:bold;">礼物被快递弄丢了 (网络阻断)</div>`;
    }
  }

  function initPresent(container, THREE) {
    container.innerHTML = ''; 
    let scene, camera, renderer, present, rafId;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let intersects =[];

    scene = new THREE.Scene();
    
    let cw = container.clientWidth || 300;
    let ch = container.clientHeight || 200;
    
    camera = new THREE.PerspectiveCamera(60, cw / ch, 0.1, 1000);
    camera.position.set(22, 22, 22); 
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0); 
    renderer.setSize(cw, ch);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; 
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = window.innerWidth < 768 ? 256 : 512; 
    dirLight.shadow.mapSize.height = window.innerWidth < 768 ? 256 : 512;
    scene.add(dirLight);

    class Present {
      constructor() {
        this.mesh = new THREE.Object3D();
        this.opening = false; this.opened = false;
        this.openTime = 0; this.opacity = 1;
        this.pieces =[];
        
        const S = 8, HS = S/2, divs = 3, fracS = S/divs, HD = divs/2;
        
        const geo = new THREE.PlaneGeometry(fracS, fracS);
        const wrapMat = new THREE.MeshStandardMaterial({ color: 0xffe6e6, side: THREE.DoubleSide, transparent: true }); 
        const ribMat = new THREE.MeshStandardMaterial({ color: 0xff4d79, side: THREE.DoubleSide, transparent: true }); 

        const rand = (min, max) => Math.random() * (max - min) + min;

        for (let s = 0; s < 6; ++s) {
          let side = new THREE.Object3D();
          if(s===0) { side.position.set(0,-HS,0); side.rotation.x = Math.PI/2; }
          else if(s===1) { side.position.set(0,0,-HS); side.rotation.y = Math.PI; }
          else if(s===2) { side.position.set(-HS,0,0); side.rotation.y = -Math.PI/2; }
          else if(s===3) { side.position.set(HS,0,0); side.rotation.y = Math.PI/2; }
          else if(s===4) { side.position.set(0,0,HS); }
          else { side.position.set(0,HS,0); side.rotation.x = -Math.PI/2; }

          for (let h = -HD; h < HD; h++) {
            for (let w = -HD; w < HD; w++) {
              let isM = (w >= -1 && w <= 0) || (h >= -1 && h <= 0 && (s===0||s===5));
              let piece = new THREE.Mesh(geo, isM ? ribMat.clone() : wrapMat.clone());
              piece.receiveShadow = true;
              piece.firstPos = { x: fracS*w + fracS/2, y: fracS*h + fracS/2, z: 0 };
              piece.position.set(piece.firstPos.x, piece.firstPos.y, 0);
              
              piece.vel = new THREE.Vector3(rand(0.5, 1.5) * (Math.random()<0.5?-1:1), rand(0.5, 1.5) * (Math.random()<0.5?-1:1), rand(0.5, 1.5) * (Math.random()<0.5?-1:1));
              piece.rotSpeed = new THREE.Vector3(rand(0.05,0.15)*(Math.random()<0.5?-1:1), rand(0.05,0.15)*(Math.random()<0.5?-1:1), rand(0.05,0.15)*(Math.random()<0.5?-1:1));
              side.add(piece); this.pieces.push(piece);
            }
          }
          this.mesh.add(side);
        }
        
        const bowGeo = new THREE.DodecahedronGeometry(2);
        this.bow = new THREE.Mesh(bowGeo, ribMat.clone());
        this.bow.castShadow = true;
        this.bow.firstPos = { y: HS + 1 };
        this.bow.position.set(0, this.bow.firstPos.y, 0);
        this.bow.vel = new THREE.Vector3(rand(0.5,1.5)*(Math.random()<0.5?-1:1), 1.5, rand(0.5,1.5)*(Math.random()<0.5?-1:1));
        this.bow.rotSpeed = new THREE.Vector3(rand(0.1,0.2), rand(0.1,0.2), rand(0.1,0.2));
        this.mesh.add(this.bow);
        
        this.mesh.rotation.y = Math.PI / 4;
      }

      update() {
        if(!this.opening && !this.opened) {
           this.mesh.rotation.y += 0.01; 
        } else if (this.opening) {
          let scaleBy = 1 - (0.05 * Math.sin(8 * Math.PI * this.openTime/100));
          this.mesh.scale.set(scaleBy, scaleBy, scaleBy);
          this.openTime += 5;
          if (this.openTime >= 100) { this.opening = false; this.opened = true; }
        } else if (this.opened) {
          if (this.opacity > 0) {
            this.opacity -= 0.03;
            this.pieces.forEach(e => {
              e.position.add(e.vel);
              e.rotation.x += e.rotSpeed.x; e.rotation.y += e.rotSpeed.y; e.rotation.z += e.rotSpeed.z;
              e.material.opacity = this.opacity;
            });
            this.bow.position.add(this.bow.vel);
            this.bow.rotation.x += this.bow.rotSpeed.x; this.bow.rotation.y += this.bow.rotSpeed.y;
            this.bow.material.opacity = this.opacity;
          } else {
            this.opacity = 1; this.opened = false; this.openTime = 0;
            this.mesh.scale.set(1,1,1);
            this.pieces.forEach(e => {
              e.position.set(e.firstPos.x, e.firstPos.y, e.firstPos.z);
              e.rotation.set(0,0,0);
              e.material.opacity = 1;
            });
            this.bow.position.set(0, this.bow.firstPos.y, 0);
            this.bow.rotation.set(0,0,0);
            this.bow.material.opacity = 1;
          }
        }
      }
    }

    present = new Present();
    scene.add(present.mesh);

    function animate() {
      rafId = requestAnimationFrame(animate);
      if(present) present.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleInteract = (e) => {
      let cx = e.clientX || (e.touches && e.touches[0].clientX);
      let cy = e.clientY || (e.touches && e.touches[0].clientY);
      if(!cx || !cy) return;
      
      const bcr = renderer.domElement.getBoundingClientRect();
      pointer.x = ((cx - bcr.left) / bcr.width) * 2 - 1;
      pointer.y = -((cy - bcr.top) / bcr.height) * 2 + 1;
      
      raycaster.setFromCamera(pointer, camera);
      intersects = raycaster.intersectObjects(present.mesh.children, true);
      
      if (intersects.length > 0) {
          e.preventDefault(); 
          if (!present.opening && !present.opened) {
              present.opening = true;
              if(window.stopConfetti) window.stopConfetti();
          }
      }
    };

    renderer.domElement.addEventListener("mousedown", handleInteract);
    renderer.domElement.addEventListener("touchstart", handleInteract, {passive: false});
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        let ew = entry.contentRect.width;
        let eh = entry.contentRect.height;
        if (ew > 0 && eh > 0) {
            camera.aspect = ew / eh;
            camera.updateProjectionMatrix();
            renderer.setSize(ew, eh);
        }
      }
    });
    resizeObserver.observe(container);
  }

  let currentTrackIndex = 0;
  let currentHowl = null;
  let currentSoundId = null;
  let isPlaying = false;
  let progressAnimationFrame = null;

  const pPlayBtn = document.getElementById('btn-play');
  const pPrevBtn = document.getElementById('btn-prev');
  const pNextBtn = document.getElementById('btn-next');
  const pModeBtn = document.getElementById('btn-mode');
  const pControlPanel = document.getElementById('player-control-panel');
  const pInfoBar = document.getElementById('player-info');
  const pBar = document.getElementById('p-bar');
  const pProgressBar = document.getElementById('p-progress-bar');
  const trackArtist = document.getElementById('track-artist');
  const trackName = document.getElementById('track-name');
  const volumeSlider = document.getElementById('volumeSlider');
  const autoPlaySwitch = document.getElementById('autoPlaySwitch');
  const albumArt = document.getElementById('album-art');
  
  // 设置唱片机根据时段分配外观颜色
  if (albumArt) albumArt.className = `p-album-art ${timePeriod}`;
  if (volumeSlider) volumeSlider.value = playerSettings.vol;

  // 格式化时间为 MM:SS
  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // 动态渲染交互式播放列表
  function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = playlist.map((track, idx) => {
      const isDisabled = playerSettings.disabled.includes(track.src);
      const isActive = idx === currentTrackIndex;
      const eyeIcon = isDisabled ? '🙉' : '🎵️';
      return `
        <div class="playlist-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}" data-idx="${idx}">
          <div class="playlist-item-info">
            <span class="li-title">${track.name}</span>
            <span class="li-artist">${track.artist}</span>
          </div>
          <div class="li-toggle" data-idx="${idx}" title="${isDisabled ? '解除拉黑' : '拉黑此歌曲'}">${eyeIcon}</div>
        </div>
      `;
    }).join('');

    // 绑定点击事件
    container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const idx = parseInt(item.getAttribute('data-idx'));
        const trackSrc = playlist[idx].src;

        if (e.target.closest('.li-toggle')) {
          e.stopPropagation(); 
          if (playerSettings.disabled.includes(trackSrc)) {
            playerSettings.disabled = playerSettings.disabled.filter(src => src !== trackSrc);
            console.log(`[Lin Debug][恢复] ${playlist[idx].name}`);
          } else {
            playerSettings.disabled.push(trackSrc);
            console.log(`[Lin Debug][拉黑] ${playlist[idx].name}`);
            
            if (idx === currentTrackIndex) {
              let nextValid = getNextValidIndex(currentTrackIndex, 1);
              if (nextValid !== -1) {
                  loadTrack(nextValid, isPlaying);
              } else {
                  pauseTrack();
              }
            }
          }
          savePlayerSettings();
          renderPlaylist(); 
          return;
        }
        
        if (playerSettings.disabled.includes(trackSrc)) return; // 拦截被拉黑歌曲的点击播放
        if (idx !== currentTrackIndex) loadTrack(idx, true);
        else togglePlay();
      });
    });
  }

  function getValidIndices() {
    let valid =[];
    playlist.forEach((t, i) => { if (!playerSettings.disabled.includes(t.src)) valid.push(i); });
    return valid;
  }

  function getNextValidIndex(currentIndex, direction = 1) {
    let valid = getValidIndices();
    if (valid.length === 0) return -1;
    
    if (playMode === 1) {
      if (valid.length === 1) return valid[0];
      let rnd;
      do { rnd = valid[Math.floor(Math.random() * valid.length)]; } while (rnd === currentIndex);
      return rnd;
    } else {
      let pos = valid.indexOf(currentIndex);
      if (pos !== -1) {
        return valid[(pos + direction + valid.length) % valid.length];
      } else {
        if (direction === 1) {
          let nextValid = valid.find(i => i > currentIndex);
          return nextValid !== undefined ? nextValid : valid[0];
        } else {
          let prevValid = valid.slice().reverse().find(i => i < currentIndex);
          return prevValid !== undefined ? prevValid : valid[valid.length - 1];
        }
      }
    }
  }

  function updateModeUI() {
    if (!pModeBtn) return;
    pModeBtn.className = 'p-btn p-mode';
    if (playMode === 0) pModeBtn.classList.add('loop');
    else if (playMode === 1) pModeBtn.classList.add('random');
    else if (playMode === 2) pModeBtn.classList.add('single');
  }

  if (pModeBtn) {
    pModeBtn.addEventListener('click', () => {
      playMode = (playMode + 1) % 3;
      playerSettings.mode = playMode;
      savePlayerSettings();
      updateModeUI();
    });
    updateModeUI();
  }

  function loadTrack(index, autoStart = false) {
    if (typeof Howl === 'undefined' || typeof Howler === 'undefined') {
      console.warn("[Lin 音乐系统] Howler.js 未加载，播放器进入离线模式。");
      if(trackArtist) trackArtist.innerText = "系统离线";
      if(trackName) trackName.innerText = "网络异常或 CDN 被拦截，音乐不可用";
      return;
    }

    currentTrackIndex = index;
    const track = playlist[index];
    trackArtist.innerText = track.artist;
    trackName.innerText = track.name;
    
    const barEl = document.getElementById('p-bar');
    const tCur = document.getElementById('p-time-current');
    const tTot = document.getElementById('p-time-total');
    if (barEl) barEl.style.width = '0%';
    if (tCur) tCur.innerText = "00:00";
    if (tTot) tTot.innerText = "00:00";
    
    renderPlaylist(); 

    if (currentHowl) {
      currentHowl.stop();
      currentHowl.unload();
    }

    currentHowl = new Howl({
      src: [track.src],
      html5: true, 
      autoplay: false, 
      volume: volumeSlider ? volumeSlider.value / 100 : 0.3,
      onload: function() {
        if (tTot) tTot.innerText = formatTime(this.duration());
        if (autoStart) playTrack();
      },
      onplay: function() {
        isPlaying = true;
        updateUI(true);
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        progressAnimationFrame = requestAnimationFrame(stepProgress);
      },
      onpause: function() { isPlaying = false; updateUI(false); },
      onstop: function() { isPlaying = false; updateUI(false); },
      onend: function() {
        if (autoPlaySwitch && autoPlaySwitch.checked) playNext(true); 
        else { isPlaying = false; updateUI(false); }
      },
      onloaderror: function(id, err) { console.error("音频加载失败:", err); }
    });
  }

  const pBarEl = document.getElementById('p-bar');
  const pTimeCurEl = document.getElementById('p-time-current');
  let lastTimeStr = "";
  let lastPercentStr = "";

  function stepProgress() {
    if (!currentHowl || !isPlaying) return;

    if (currentHowl.state() !== 'loaded') {
        progressAnimationFrame = requestAnimationFrame(stepProgress);
        return;
    }
    
    let seek = currentHowl.seek();
    const node = currentHowl._sounds && currentHowl._sounds[0] && currentHowl._sounds[0]._node;
    if (typeof seek !== 'number') {
        seek = node ? node.currentTime : 0;
    }

    let duration = currentHowl.duration() || 0;
    if (duration === 0 && node && node.duration) {
        duration = node.duration;
    }

    if (isNaN(duration) || duration <= 0) {
        progressAnimationFrame = requestAnimationFrame(stepProgress);
        return;
    }

    let percent = duration > 0 ? (seek / duration) * 100 : 0;
    let percentStr = percent.toFixed(2) + '%';
    let timeStr = formatTime(seek);
    
    if (pBarEl && lastPercentStr !== percentStr) {
        pBarEl.style.width = percentStr;
        lastPercentStr = percentStr;
    }
    if (pTimeCurEl && lastTimeStr !== timeStr) {
        pTimeCurEl.innerText = timeStr;
        lastTimeStr = timeStr;
    }
    
    progressAnimationFrame = requestAnimationFrame(stepProgress);
  }

  function updateUI(playing) {
    if (playing) {
      pControlPanel.classList.add('active');
      pInfoBar.classList.add('active');
      pPlayBtn.classList.add('playing');
    } else {
      pControlPanel.classList.remove('active');
      pInfoBar.classList.remove('active');
      pPlayBtn.classList.remove('playing');
    }
  }

  function togglePlay() {
    if (!currentHowl) return;
    if (isPlaying) pauseTrack(); else playTrack();
  }

  function playTrack() { 
    if (!currentHowl) return;
    const vol = volumeSlider ? volumeSlider.value / 100 : 0.3;
    currentHowl.off('fade'); 
    currentHowl.volume(0);
    currentHowl.play();
    currentHowl.fade(0, vol, 1000); 
  }

  function pauseTrack() {
    if (!currentHowl) return;
    const vol = currentHowl.volume();
    isPlaying = false; 
    updateUI(false);
    currentHowl.off('fade');
    currentHowl.fade(vol, 0, 800);
    currentHowl.once('fade', () => {
      currentHowl.pause();
      currentHowl.volume(volumeSlider ? volumeSlider.value / 100 : 0.3); 
    });
  }

  function playNext(auto = false) {
    let validIndices = getValidIndices();
    if (validIndices.length === 0) return pauseTrack();

    const isCurrentDisabled = playerSettings.disabled.includes(playlist[currentTrackIndex].src);
    let nextIndex = currentTrackIndex;
    
    if (auto && playMode === 2 && !isCurrentDisabled) {
       nextIndex = currentTrackIndex;
    } else {
       nextIndex = getNextValidIndex(currentTrackIndex, 1);
    }
    loadTrack(nextIndex, true);
  }

  function playPrev() {
    let validIndices = getValidIndices();
    if (validIndices.length === 0) return pauseTrack();
    loadTrack(getNextValidIndex(currentTrackIndex, -1), true);
  }

  if (pPlayBtn) pPlayBtn.addEventListener('click', togglePlay);
  if (pNextBtn) pNextBtn.addEventListener('click', () => playNext(false));
  if (pPrevBtn) pPrevBtn.addEventListener('click', playPrev);

  if (pProgressBar) {
    pProgressBar.addEventListener('click', (e) => {
      if (!currentHowl) return;
      const rect = pProgressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const targetTime = percent * currentHowl.duration();
      
      const node = currentHowl._sounds && currentHowl._sounds[0] && currentHowl._sounds[0]._node;
      if (node) {
         node.currentTime = targetTime;
      } else {
         currentHowl.seek(targetTime);
      }
    });
  }

  if(playlist.length > 0) {
    renderPlaylist(); 
    
    let validIndices = getValidIndices();
    let startIdx = 0;
    if (validIndices.length > 0) {
        startIdx = playMode === 1 ? validIndices[Math.floor(Math.random() * validIndices.length)] : validIndices[0];
    }

    const initPlay = () => {
      if (autoPlaySwitch && autoPlaySwitch.checked && !isPlaying && currentHowl) playTrack();
      document.removeEventListener('click', initPlay);
    };
    document.addEventListener('click', initPlay);
    
    loadTrack(startIdx, false); 
    if (typeof Howler !== 'undefined') {
        Howler.volume(volumeSlider ? volumeSlider.value / 100 : 0.3);
    }
  } else {
    trackArtist.innerText = "无音乐";
    trackName.innerText = `未找到 ${timePeriod} 时段音乐`;
  }

  // ================= 设置页功能 =================
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const turnSpeedSlider = document.getElementById('turnSpeedSlider');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const fsBtn = document.getElementById('fsBtn');

  if(fsBtn) {
    fsBtn.addEventListener('click', () => {
      document.querySelector('.app-container').classList.toggle('fullscreen-mode');
    });
  }

  if(volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      let vol = e.target.value;
      Howler.volume(vol / 100); 
      // 存储音量设置
      if (typeof playerSettings !== 'undefined') {
        playerSettings.vol = vol;
        savePlayerSettings();
      }
    });
  }

  if(fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      root.style.setProperty('--base-font-size', e.target.value + 'px');
    });
  }

  if(turnSpeedSlider) {
    turnSpeedSlider.addEventListener('input', (e) => {
      let speed = Math.max(0.2, 2.2 - (e.target.value * 0.2)).toFixed(2);
      root.style.setProperty('--turn-speed', speed + 's');
    });
  }

  if(resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      if(fontSizeSlider) fontSizeSlider.value = 15;
      if(volumeSlider) volumeSlider.value = 30;
      if(turnSpeedSlider) turnSpeedSlider.value = 6;
      if(autoPlaySwitch) autoPlaySwitch.checked = true;
      root.style.setProperty('--base-font-size', '15px');
      root.style.setProperty('--turn-speed', '1s');
      Howler.volume(0.3);
      if (typeof playerSettings !== 'undefined') {
        playerSettings.vol = 30;
        playerSettings.mode = 1;
        playerSettings.disabled =[];
        savePlayerSettings();
        if (typeof updateModeUI === 'function') updateModeUI();
        if (typeof renderPlaylist === 'function') renderPlaylist();
      }
    });
  }
}


// ================= 接收 SillyTavern 跨域数据 =================
window.addEventListener('message', (event) => {
  if (!event.data) return;

  // 1. 同步 12 项状态栏
  if (event.data.type === 'SYNC_STATUS') {
    const d = event.data.data;
    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val || '暂无数据'; };
    
    setT('s-state', d['病历状态']);
    setT('s-current', d['本次记录']);
    setT('s-last', d['上次互动']);
    setT('s-relation', d['当前关系']);
    setT('s-special', d['特殊性']);
    setT('s-resource', d['优势资源']);
    setT('s-precaution', d['注意事项']);
    setT('s-cause', d['问题成因']);
    setT('s-impact', d['影响评估']);
    setT('s-plan', d['干预方案']);
    setT('s-action', d['执行事项']);
    
    const targetEl = document.getElementById('s-target');
    if (targetEl) targetEl.innerHTML = `🎯 <strong>预期目标：</strong>${d['预期目标'] || '暂未设定'}`;
  }

  // 2. 触发动态量表引擎
  if (event.data.type === 'TRIGGER_SCALE') {
    const scaleId = event.data.scaleId;
    window.loadAndShowScale(scaleId);
  }

  // 3. 生日彩蛋触发
  if (event.data.type === 'TRIGGER_BIRTHDAY') {
    if (window.activateBirthdayMode) window.activateBirthdayMode();
  }

  // 4. 同步全局聊天记录
  if (event.data.type === 'SYNC_CHAT') {
    const msgs = event.data.messages;
    const chatHistory = document.getElementById('chat-history');
    const chatPage = document.getElementById('page-0');
    if (!chatHistory) return;

    // 简单 Markdown 解析器（处理加粗、斜体、真实换行）
    const parseMD = (str) => {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
    };

    document.querySelectorAll('.temp-note').forEach(el => el.remove());

    const existingNodes = Array.from(chatHistory.children).filter(el => 
      (el.classList.contains('ai-msg') || el.classList.contains('user-note')) && el.id !== 'typing-bubble'
    );

    msgs.forEach((m, i) => {
      const isAI = m.role === 'ai';
      const className = isAI ? 'ai-msg' : 'user-note';
      const contentHTML = parseMD(m.text);
      
      let node = existingNodes[i];
      
      if (node) {
        if (node.className !== className) {
          const newNode = document.createElement('div');
          newNode.className = className;
          newNode.innerHTML = contentHTML;
          if (!isAI) newNode.style.transform = `rotate(${(((i * 13.5) % 6) - 3).toFixed(1)}deg)`;
          chatHistory.replaceChild(newNode, node);
        } else if (node.innerHTML !== contentHTML) {
          node.innerHTML = contentHTML;
        }
      } else {
        const newNode = document.createElement('div');
        newNode.className = className;
        newNode.innerHTML = contentHTML;
        if (!isAI) newNode.style.transform = `rotate(${(((i * 13.5) % 6) - 3).toFixed(1)}deg)`;
        chatHistory.appendChild(newNode);
      }
    });

    const allNodes = Array.from(chatHistory.children).filter(el => el.id !== 'typing-bubble');
    if (allNodes.length > msgs.length) {
      for (let i = msgs.length; i < allNodes.length; i++) {
        allNodes[i].remove();
      }
    }

    if (chatPage) {
      setTimeout(() => chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' }), 50);
    }
  }

  // 5. 实时输入框同步 (当你在酒馆里打字时，浮窗里也能看到)
  if (event.data.type === 'SYNC_INPUT_FROM_ST') {
    if (document.activeElement !== chatInput) {
      chatInput.value = event.data.text;
    }
  }

  // 6. 生成状态控制 (把发送按钮变成停止按钮)
  if (event.data.type === 'GEN_STATE') {
    isGenerating = event.data.state;
    sendBtn.innerHTML = isGenerating 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-top:2px;"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>` 
      : '↑';
    sendBtn.style.background = '';
  }

  // 7. 流式打字机效果注入
  if (event.data.type === 'STREAM_UPDATE') {
    const chatPage = document.getElementById('page-0');
    let typingBubble = document.getElementById('typing-bubble');
    
    if (!typingBubble) {
      typingBubble = document.createElement('div');
      typingBubble.id = 'typing-bubble';
      typingBubble.className = 'ai-msg';
      chatHistory.appendChild(typingBubble);
    }
    
    typingBubble.innerHTML = parseMD(event.data.text) + '<span style="animation: blink 1s infinite;">▌</span>';
    
    // AI 正在打字时，始终让视口吸附在容器最底部，平滑跟随后续文字
    if (chatPage) {
      chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'auto' });
    }
  }
});

window.generateAllSucculents = function() {
  const canvases = document.querySelectorAll('.mini-succulent');
  canvases.forEach(canvas => {
    if (canvas.dataset.drawn === "true") return; 
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const variations =[
      { grad:['#0a3d62', '#b8e994'], border: '#ffaaaa' },
      { grad:['#5a6852', '#cbdbe1'], border: '#cbdbe1' },
      { grad:['#1f572f', '#8ed089'], border: '#8ed089' },
      { grad:['#1b361a', '#50844d'], border: '#6b956b' },
      { grad: ['#281616', '#483033'], border: '#9a9b95' },
      { grad:['#266261', '#bde6f0'], border: '#bde6f0' }
    ];
    
    const v = variations[Math.floor(Math.random() * variations.length)];
    const count = 25 + Math.floor(Math.random() * 20);
    const maxRadius = 3 * Math.sqrt(count);
    const petalCurve = 1 + Math.random();
    const petalPoint = 0.3 + Math.random() * 0.7;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(w / 140, h / 140); 

    for (let i = count; i > 0; i--) {
      const a = i * 137.5 * (Math.PI / 180);
      const r = 3 * Math.sqrt(i);
      const x = r * Math.sin(a);
      const y = r * Math.cos(a);

      const scaleX = 0.2 + (0.8 * (r / maxRadius));
      const scaleY = 1 * (r / maxRadius);
      const rotation = 180 - (i * 137.5);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.scale(scaleX, scaleY);

      ctx.beginPath();
      const res = 40;
      const size = 35;
      for (let j = 0; j <= res; j++) {
        let phi = (Math.PI * 2) * j / res;
        let t1 = Math.pow(Math.abs(Math.cos(3 * phi / 4)), petalPoint);
        let t2 = Math.pow(Math.abs(Math.sin(3 * phi / 4)), petalPoint);
        let rad = Math.pow(t1 + t2, 1 / petalCurve);
        rad = rad === 0 ? 0 : 1 / rad;
        let px = rad * Math.cos(phi) * size;
        let py = rad * Math.sin(phi) * size - (size * 0.2);
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = v.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      const grad = ctx.createRadialGradient(0, size, 0, 0, 0, size);
      grad.addColorStop(0, v.grad[0]);
      grad.addColorStop(1, v.grad[1]);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
    canvas.dataset.drawn = "true";
  });
};

setTimeout(() => {
    if(typeof window.generateAllSucculents === 'function') window.generateAllSucculents();
  }, 500);