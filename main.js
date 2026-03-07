document.addEventListener("DOMContentLoaded", async () => {
  // 1. 动态加载各个标签页的内容
  const pages =['tab0.html', 'tab1.html', 'tab2.html', 'tab3.html'];
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
    // 等待所有 HTML 片段加载完毕再初始化交互
    await Promise.all(fetchPromises);
    initApp();
  } catch (error) {
    console.error("加载片段失败，请确保您正在通过 HTTP 服务（如 Live Server）运行此项目：", error);
    document.body.innerHTML = `<h2 style="color:red; text-align:center; padding: 20px;">跨域错误或文件未找到。<br>请使用 VS Code 的 Live Server 插件或其他 HTTP 服务器运行此网页！</h2>`;
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
          <div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(145deg, #6a11cb 0%, #2575fc 100%); border-radius: 12px; backface-visibility: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2); display:flex; justify-content:center; align-items:center; color:rgba(255,255,255,0.5); font-weight:bold; font-size:18px;">点击翻开</div>
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


  // ================= SVG 植物生成 =================
  let plantGenerated = false;
  function generatePlant() {
    if (plantGenerated) return;
    const container = document.getElementById('svgGarden');
    const label = document.getElementById('gardenLabel');
    if(!container) return;

    const date = new Date();
    const month = date.getMonth();
    const monthNames =["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    
    // 植物生长参数配置
    const pC =[
      { s: "#4a5d23", l: "#2e472d", d: 5, sp: 0.4, ln: 40, t: "M0,0L-3,-15L0,-30L3,-15Z" },
      { s: "#5c4033", l: "#ffb7c5", d: 5, sp: 0.6, ln: 35, t: "M0,0 C-10,-10 -10,-20 0,-20 C10,-20 10,-10 0,0 Z" },
      { s: "#8b9a46", l: "#a8b054", d: 5, sp: 0.7, ln: 45, t: "M0,0 C10,-10 15,-20 0,-40 C-5,-20 0,-10 0,0 Z" },
      { s: "#6b5b53", l: "#ffc0cb", d: 5, sp: 0.5, ln: 35, t: "M0,0 C-15,-10 -15,-25 0,-30 C15,-25 15,-10 0,0 Z" },
      { s: "#2d4c1e", l: "#3a5f27", d: 4, sp: 0.4, ln: 50, t: "M0,0 C-25,-15 -30,-40 0,-60 C30,-40 25,-15 0,0 Z" },
      { s: "#455e14", l: "#5c7a1a", d: 5, sp: 0.5, ln: 40, t: "M0,0 C-5,-5 -5,-15 0,-20 C5,-15 5,-5 0,0 Z" },
      { s: "#305e3a", l: "#e8a0bf", d: 4, sp: 0.3, ln: 55, t: "M0,0 C-20,-10 -30,-30 0,-40 C30,-30 20,-10 0,0 Z" },
      { s: "#68785c", l: "#7a8f6a", d: 3, sp: 0.4, ln: 25, t: "M0,0 C-15,-5 -15,-20 0,-25 C15,-20 15,-5 0,0 Z" },
      { s: "#5c4a3d", l: "#c24100", d: 5, sp: 0.6, ln: 35, t: "M0,-15 L-10,-15 L-5,-5 L-10,5 L0,0 L10,5 L5,-5 L10,-15 Z" },
      { s: "#63594b", l: "#e8c547", d: 5, sp: 0.5, ln: 40, t: "M0,0 L-20,-30 A25,25 0 0,1 20,-30 Z" },
      { s: "#8c9c81", l: "#d1d8c5", d: 4, sp: 0.2, ln: 50, t: "M0,0 C-2,-10 -5,-20 0,-40 C5,-20 2,-10 0,0 Z" },
      { s: "#4a4e4d", l: "#a8b6bf", d: 5, sp: 0.7, ln: 40, t: "M0,0 L-5,-5 L0,-10 L5,-5 Z" }
    ];
    const cfg = pC[month];
    let svgContent = `<svg viewBox="0 0 300 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
    let paths = [];
    let leaves =[];

    function buildBranch(x, y, angle, len, depth, delay) {
      if (depth === 0) return;
      let curve = (Math.random() - 0.5) * 30;
      let x2 = x + Math.sin(angle) * len;
      let y2 = y - Math.cos(angle) * len;
      let cx = x + Math.sin(angle) * (len / 2) + curve;
      let cy = y - Math.cos(angle) * (len / 2);
      let strokeWidth = depth * 1.5;
      paths.push(`<path class="svg-stem" d="M ${x},${y} Q ${cx},${cy} ${x2},${y2}" style="stroke:${cfg.s};stroke-width:${strokeWidth}px; animation-delay:${delay}s;" />`);
      if (depth <= 2 && Math.random() > 0.3) {
        let leafAngle = (angle * 180 / Math.PI) + (Math.random() * 60 - 30);
        let leafDelay = delay + 0.6 + Math.random() * 0.5;
        let scale = 0.4 + Math.random() * 0.4;
        leaves.push(`<g transform="translate(${x2}, ${y2}) rotate(${leafAngle}) scale(${scale})" style="transform-origin: 0 0;"><path class="svg-leaf" d="${cfg.t}" style="fill:${cfg.l};animation-delay:${leafDelay}s;" /></g>`);
      }
      let numBranches = depth === cfg.d ? 2 : (Math.random() > 0.2 ? 2 : 1);
      for (let i = 0; i < numBranches; i++) {
        let newAngle = angle + (Math.random() * cfg.sp * 2 - cfg.sp);
        let newLen = len * (0.6 + Math.random() * 0.2);
        buildBranch(x2, y2, newAngle, newLen, depth - 1, delay + 0.4);
      }
    }

    buildBranch(150, 290, 0, cfg.ln, cfg.d, 0);
    svgContent += paths.join('') + leaves.join('') + `</svg>`;
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

  window.activateBirthdayMode = function() {
    console.log("🎂 生日彩蛋触发！特别曲目已加入歌单。");
    const bdayTracks =[
      "the_mountain-birthday-490600.mp3",
      "the_mountain-cartoon-cartoon-music-489996.mp3"
    ].map(f => ({
      artist: parseFileName(f).artist, name: parseFileName(f).title, src: `/Lin/music/birthday/${encodeURIComponent(f)}`
    }));
    playlist.unshift(...bdayTracks);
    
    // 生日彩蛋：更改唱片机颜色
    const albumArt = document.getElementById('album-art');
    if (albumArt) albumArt.className = 'p-album-art birthday';
    
    if(typeof renderPlaylist === 'function') renderPlaylist(); // 重新渲染歌单
    if(currentHowl) {
        currentHowl.stop();
        loadTrack(0, true);
    }
  };

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

  function stepProgress() {
    if (!currentHowl || !isPlaying) return;
    
    let seek = currentHowl.seek();
    if (typeof seek !== 'number') {
        const node = currentHowl._sounds && currentHowl._sounds[0] && currentHowl._sounds[0]._node;
        seek = node ? node.currentTime : 0;
    }

    let duration = currentHowl.duration() || 0;
    let percent = duration > 0 ? (seek / duration) * 100 : 0;
    
    const barEl = document.getElementById('p-bar');
    const timeCur = document.getElementById('p-time-current');
    if (barEl) barEl.style.width = `${percent}%`;
    if (timeCur) timeCur.innerText = formatTime(seek);
    
    const secFloor = Math.floor(seek);
    if (window._lastLogSec !== secFloor) {
        console.log(`[Lin Debug][播放进度] ${formatTime(seek)} / ${formatTime(duration)} - ${playlist[currentTrackIndex].name}`);
        window._lastLogSec = secFloor;
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
    Howler.volume(volumeSlider ? volumeSlider.value / 100 : 0.3);
  } else {
    trackArtist.innerText = "无音乐";
    trackName.innerText = `未找到 ${timePeriod} 时段音乐`;
  }

  function stepProgress() {
    if (currentHowl && isPlaying) {
      let seek = currentHowl.seek() || 0;
      let percent = (seek / currentHowl.duration()) * 100;
      pBar.style.width = `${percent || 0}%`;
      progressAnimationFrame = requestAnimationFrame(stepProgress);
    }
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
    if (currentHowl.playing()) currentHowl.pause();
    else currentHowl.play();
  }

  function playTrack() { if (currentHowl) currentHowl.play(); }

  function playNext(auto = false) {
    let nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex, auto);
    if (!auto) playTrack(); 
  }

  function playPrev() {
    let prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(prevIndex, false);
    playTrack();
  }

  pPlayBtn.addEventListener('click', togglePlay);
  pNextBtn.addEventListener('click', () => playNext(false));
  pPrevBtn.addEventListener('click', playPrev);

  if(playlist.length > 0) {
    // 现代浏览器通常拦截无交互的自动播放，
    // 因此这里设置在用户首次点击页面的任意位置时，触发自动播放（如果开关是打开的）
    const initPlay = () => {
      if (autoPlaySwitch && autoPlaySwitch.checked && !isPlaying && currentHowl) {
        currentHowl.play();
      }
      document.removeEventListener('click', initPlay);
    };
    document.addEventListener('click', initPlay);
    
    loadTrack(0, false); // 先预加载第一首，通过点击来激活
    Howler.volume(volumeSlider.value / 100);
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