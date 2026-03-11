document.addEventListener('DOMContentLoaded', async () => {
  const pages = ['tab0.html', 'tab1.html', 'tab2.html', 'tab3.html'];
  let isHtmlLoaded = false;

  try {
    const fetchPromises = pages.map((page, index) =>
      fetch(page)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.text();
        })
        .then((html) => {
          document.getElementById(`page-${index}`).innerHTML = html;
        }),
    );
    await Promise.all(fetchPromises);
    isHtmlLoaded = true;
  } catch (error) {
    console.error('加载片段失败：', error);
    document.body.innerHTML = `<h2 style="color:red; text-align:center; padding: 20px;">跨域错误或文件未找到。<br>请确保您正在通过 HTTP 服务运行此项目！</h2>`;
  }

  if (isHtmlLoaded) {
    try {
      initApp();
    } catch (e) {
      console.error('应用初始化过程中出现非致命错误：', e);
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
  window.closeBook = function () {
    tabs.forEach((t) => t.classList.remove('active'));
    pagesContainer.forEach((page) => page.classList.remove('flipped'));
  };

  const backAreas = document.querySelectorAll('.close-book-area');
  backAreas.forEach((area) => {
    area.addEventListener('click', window.closeBook);
  });

  // 启动时是否翻开封面（从本地存储读取设置，默认关闭）
  setTimeout(() => {
    const autoOpen = localStorage.getItem('LinUI_autoOpen') === 'true';
    if (autoOpen) {
      const cover = document.querySelector('.page[data-index="-1"]');
      if (cover) cover.classList.add('flipped');
    }
  }, 400);

  // ====== 标签页切换逻辑 ======
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
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
    if (e) e.preventDefault();
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
        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        document.documentElement.style.setProperty('--ripple-x', `${x}px`);
        document.documentElement.style.setProperty('--ripple-y', `${y}px`);
        document.documentElement.style.setProperty('--ripple-r', `${maxRadius}px`);

        document.startViewTransition(switchTheme);
      } else {
        // 兼容不支持水波纹的旧浏览器，临时赋予CSS渐变
        document.body.style.transition = 'background-color 1.2s ease';
        const notebook = document.querySelector('.notebook');
        const pageFronts = document.querySelectorAll('.page-front');
        if (notebook) notebook.style.transition = 'background-color 1.2s ease';
        pageFronts.forEach((p) => (p.style.transition = 'background-color 1.2s ease'));

        switchTheme();

        setTimeout(() => {
          document.body.style.transition = '';
          if (notebook) notebook.style.transition = '';
          pageFronts.forEach((p) => (p.style.transition = ''));
        }, 1200);
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
  const ohWords = [
    '8cuxn2',
    'f2eyxf',
    'ma8rol',
    'ynq3b0',
    'k3foo3',
    'hd3568',
    'i3o0xp',
    '9lrdp9',
    '68632e',
    'uvr9tv',
    'w0thk5',
    'ujmmpo',
    'q66smu',
    'zyvinv',
    'ia8mus',
    '8knys3',
    '077i0k',
    'skos8v',
    '3u1hv7',
    'kowbr0',
    'xnkky0',
    'tfck9d',
    'sjkl40',
    'evboxw',
    'ml853c',
    '2lyqng',
    '475w7u',
    '1nath3',
    'oed8o3',
    '6cyy5v',
    '5c33q8',
    'bnp85w',
    'ajk2sa',
    'mrlu2c',
    'uwu7bb',
    '5w68r0',
    'vut2kq',
    'zaqb46',
    'o0lkvy',
    '0pt4ij',
    'mynr0h',
    'garhko',
    '0j5370',
    'nsd2e0',
    'o9z0g0',
    '4vke1u',
    'vir293',
    '2ncnww',
    'tgodj4',
    'ltsac7',
    '3gskyd',
    '2qa3mn',
    '6bt92x',
    'x4xa3m',
    'oklbo5',
    '0kidq6',
    '0y57mk',
    'am2kqg',
    'v5uqh1',
    'z87bjv',
    'hq2lc6',
    'g06q99',
    'cw11bo',
    'hytjao',
    'ch3zhc',
    '8w0hv6',
    'nbpsfi',
    'l597w7',
    'n34zyi',
    'f15yek',
    'be2yv2',
    'd4imbq',
    '5fejh1',
    'a4dsm1',
    '44o0pa',
    '21k2l2',
    'qkaxrb',
    '1u46i2',
    'vc5lf6',
    '6a1ktm',
    '9rl12m',
    'hl18q6',
    'jfkj5s',
    's4x2j5',
    'qgpxx0',
    'yf8rwl',
    'l26hfd',
    '8o38z8',
  ];
  const ohImages = [
    't7nxvt',
    'cbtwhq',
    'k7tmry',
    'sk8hvu',
    'macnbz',
    '49aiff',
    'bwazsv',
    'jcccmx',
    'c00lc2',
    '4d2px1',
    'knvkbd',
    'yux922',
    'vhcjbb',
    'upleiw',
    'rxlk8x',
    '7ywke2',
    '013zs9',
    'o9jvrp',
    'slwxks',
    '5pwwd5',
    '6d25m3',
    '22psds',
    'hdgxtx',
    'vksul3',
    'dgvz2e',
    'cztrdd',
    'sx8va6',
    '1fz3sp',
    'e04m72',
    'b2h400',
    'bq1gwn',
    'tv5ave',
    'fcfvpq',
    'e1m3bh',
    '1mw4zo',
    'ywv2v9',
    'ie03kj',
    '7eynf7',
    'w9ucpp',
    'rb4hux',
    'rhwin1',
    '5okqrp',
    'h3j4k8',
    'vcruzy',
    'm12coa',
    's41zvs',
    '9v5was',
    'v2cvjw',
    '77pbia',
    '0nkcds',
    'euw7g2',
    'vze43r',
    '8cc15t',
    '9vm86f',
    'u6czqn',
    '8x1sd8',
    'c5d43l',
    'n68ngq',
    'ewb4zu',
    'vzwkm8',
    'r2du4n',
    '5bcvvk',
    'tbrvza',
    'wc5ujj',
    'kdoe5h',
    'fgn5fv',
    '8usqhh',
    'ccpkcx',
    'gy9bx0',
    '43eq4w',
    '972dt9',
    'f09sze',
    'zdmzxq',
    '9b6wfo',
    '37pka1',
    'od7bxy',
    '82yiep',
    'fbc7rw',
    'oyo4nv',
    'xhb8ox',
    'm371uo',
    'c4w4sy',
    'l6gsz4',
    'np2s61',
    'ovwh0m',
    'wl71lo',
    '6ufv4h',
    'qc6v18',
  ];

  function sendOHCard() {
    globalOverlay.innerHTML = '';
    const randomWord = ohWords[Math.floor(Math.random() * ohWords.length)];
    const randomImage = ohImages[Math.floor(Math.random() * ohImages.length)];

    const wordCardSize = '95%'; // 字卡（底图）大小
    const imageCardSize = '65%'; // 图卡（内嵌图）大小

    const wrapper = document.createElement('div');
    wrapper.className = 'oh-card-wrapper';
    wrapper.innerHTML = `
      <!-- 悬停倾斜外壳 -->
      <div style="margin-bottom: 15px; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer;"
           onmouseenter="this.style.transform='rotate(3deg) scale(1.04)'"
           onmouseleave="this.style.transform='rotate(0deg) scale(1)'">
           
        <!-- 3D 翻转容器 -->
        <div style="position: relative; width: 220px; height: 320px; perspective: 1000px;" 
             onclick="const inner = this.querySelector('.oh-inner'); inner.style.transform = inner.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';">
          
          <div class="oh-inner" style="position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-style: preserve-3d;">
            
            <!-- 牌背 -->
            <div class="oh-image-large" style="position: absolute; width: 100%; height: 100%; margin-bottom: 0; backface-visibility: hidden; box-sizing: border-box; font-family: 'Nunito', 'PingFang SC', sans-serif;">?</div>
            
            <!-- 牌面 -->
            <div style="position: absolute; width: 100%; height: 100%; transform: rotateY(180deg); backface-visibility: hidden; display: flex; justify-content: center; align-items: center; background:#fff; border-radius:12px; overflow:hidden; border: 8px solid #fcfcfc; box-shadow: inset 0 0 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.15); box-sizing: border-box;">
              
              <!-- 字卡 (底图) -->
              <img src="https://files.catbox.moe/${randomWord}.png" style="position: absolute; width: ${wordCardSize}; height: ${wordCardSize}; object-fit: contain; z-index: 1;">
              
              <!-- 图卡 (内图) -->
              <img src="https://files.catbox.moe/${randomImage}.jpg" style="position: absolute; width: ${imageCardSize}; height: ${imageCardSize}; object-fit: contain; z-index: 2; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              
            </div>
          </div>
        </div>
      </div>

      <!-- 排版与文字 -->
      <p style="text-align:center; color: var(--text-main); font-weight: 800; margin-bottom: 5px; font-size: 15px;">这是一张 OH 卡</p>
      <p style="text-align:center; color: var(--text-ai); font-size: 13px; margin-bottom: 15px; opacity: 0.8;">请观察画面，你最先注意到的是什么？</p>
      <button class="close-overlay-btn" onclick="window.closeGlobalOverlay()">收起卡片</button>
    `;
    globalOverlay.appendChild(wrapper);

    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-msg';
    aiMsg.innerText = '我递给了你一张OH卡，看看书本上方的浮层。';
    chatHistory.appendChild(aiMsg);

    if (chatPage) {
      chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });
    }
  }

  // 全局：带离场动效的浮层关闭逻辑
  window.closeGlobalOverlay = function () {
    const overlay = document.getElementById('global-overlay');
    if (!overlay || !overlay.firstElementChild) return;

    // 禁用指针事件以防重复点击，并覆盖行内样式触发退场动画
    overlay.firstElementChild.style.pointerEvents = 'none';
    overlay.firstElementChild.style.animation = 'handBackToTop 1s ease-in-out forwards';

    // 延时 950ms 等待动画临近结束时销毁 DOM
    setTimeout(() => {
      overlay.innerHTML = '';
    }, 950);
  };

  // JSON 量表引擎
  window.loadAndShowScale = async function (scaleId) {
    try {
      const res = await fetch(`scales/${scaleId}.json`);
      if (!res.ok) throw new Error('找不到表单文件');
      const scale = await res.json();
      window.renderScaleUI(scale);
    } catch (e) {
      console.error(e);
      const err = document.createElement('div');
      err.className = 'ai-msg';
      err.innerText = `[系统提示] 无法加载表单 ${scaleId}.json`;
      const chatHistory = document.getElementById('chat-history');
      if (chatHistory) chatHistory.appendChild(err);
    }
  };

  window.renderScaleUI = function (scale) {
    const globalOverlay = document.getElementById('global-overlay');
    if (!globalOverlay) return;

    globalOverlay.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'scale-notebook';

    const optionsHTML = scale.options
      .map(
        (opt) =>
          `<label class="opt-label"><input type="radio" value="${opt.value}"><span>${opt.label}</span></label>`,
      )
      .join('');

    wrapper.innerHTML = `
      <div class="scale-close-btn" onclick="window.closeGlobalOverlay()">×</div>
      
      <h1 class="scale-title">${scale.title}</h1>
      <div class="scale-desc">
        <strong>填写指引：</strong> ${scale.desc}
      </div>
      <div class="scale-questions-container">
        ${scale.questions
          .map(
            (q, idx) => `
          <div class="scale-q" data-idx="${idx}">
            <div class="scale-q-text">${idx + 1}. ${q.q}</div>
            <div class="scale-options" data-factor="${q.f || ''}" data-idx="${idx}">
              ${optionsHTML.replace(/<input type="radio"/g, `<input type="radio" name="sq${idx}"`)}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
      <button class="notebook-btn submit-btn incomplete" id="submitScaleBtn" disabled>还有 ${scale.questions.length} 道题未完成...</button>
    `;

    globalOverlay.appendChild(wrapper);

    // 划掉题目 + 画绿圈
    wrapper.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        const qDiv = e.target.closest('.scale-q');
        qDiv.classList.add('answered');

        // 清除其他选项的选中状态和随机样式
        const labels = qDiv.querySelectorAll('.opt-label');
        labels.forEach((l) => {
          l.classList.remove('circled-option');
          l.style.removeProperty('--rand-rot');
          l.style.removeProperty('--rand-w');
          l.style.removeProperty('--rand-h');
          l.style.removeProperty('--rand-br');
        });

        const label = e.target.closest('label');

        // 随机生成涂鸦参数
        const rot = (Math.random() * 16 - 8).toFixed(1); // -8度 到 8度的随机倾斜
        const w = (Math.random() * 15 + 105).toFixed(1); // 105% 到 120% 的随机宽度
        const h = (Math.random() * 20 + 120).toFixed(1); // 120% 到 140% 的随机高度

        // 随机生成 8 个 40%~60% 的值，构建极其不规则的圆角 (手绘感)
        const r = () => Math.floor(Math.random() * 20 + 40);
        const br = `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;

        // 将随机变量注入到当前 Label 的行内样式中
        label.style.setProperty('--rand-rot', `${rot}deg`);
        label.style.setProperty('--rand-w', `${w}%`);
        label.style.setProperty('--rand-h', `${h}%`);
        label.style.setProperty('--rand-br', br);

        label.classList.add('circled-option');

        // 实时检查是否全部做完，更新提交按钮状态与文本
        const totalQs = scale.questions.length;
        const answeredQs = wrapper.querySelectorAll('.scale-q.answered').length;
        const submitBtn = document.getElementById('submitScaleBtn');

        if (answeredQs === totalQs) {
          submitBtn.classList.remove('incomplete');
          submitBtn.removeAttribute('disabled');
          submitBtn.innerText = '完成评估，同步给林医生';
        } else {
          submitBtn.classList.add('incomplete');
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.innerText = `还有 ${totalQs - answeredQs} 道题未完成...`;
        }
      }
    });

    document.getElementById('submitScaleBtn').onclick = () => {
      let totalScore = 0;
      let posItems = 0;
      let factorScores = {};
      let allAnswered = true;
      if (scale.factors) for (let k in scale.factors) factorScores[k] = 0;

      scale.questions.forEach((q, idx) => {
        const checkedInput = document.querySelector(`input[name="sq${idx}"]:checked`);
        if (!checkedInput) {
          allAnswered = false;
          return;
        }
        let val = parseInt(checkedInput.value);
        totalScore += val;
        if (val > 1) posItems++;
        if (q.f && factorScores[q.f] !== undefined) factorScores[q.f] += val;
      });

      if (!allAnswered) return;

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
        window.parent.postMessage(
          {
            type: 'SEND_CHAT_TO_ST',
            text: `这是我的${scale.title}结果：\n${report}`,
          },
          '*',
        );
      }

      globalOverlay.innerHTML = `
        <div class="scale-notebook" style="text-align:center; padding: 60px 40px;">
          <div class="scale-close-btn" onclick="window.closeGlobalOverlay()">×</div>
          <h2 style="color:#2ecc71; margin-bottom:15px; font-family:'Caveat', cursive; font-size: 32px;">评估已完成 ✨</h2>
          <p style="font-size:16px; font-weight: bold; color:var(--text-main); margin-bottom:10px;">记录已同步给林医生。</p>
          <p style="font-size:14px; color:var(--text-ai); margin-bottom:30px; opacity: 0.8;">“辛苦了，接下来交给我吧。”</p>
          <button class="notebook-btn submit-btn" onclick="window.closeGlobalOverlay()">合上报告</button>
        </div>
      `;
    };
  };

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
        setTimeout(
          () =>
            chatPage.scrollTo({
              top: chatPage.scrollHeight,
              behavior: 'smooth',
            }),
          10,
        );
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
    if (container && container.dataset.presentActive === 'true') return;
    const label = document.getElementById('gardenLabel');
    if (!container) return;

    const date = new Date();
    const month = date.getMonth();

    // 植物月份字典
    const monthNames = [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ];

    // n=品名, c=颜色组, w=权重, tCol/lCol=枝干/叶片颜色，arch=架构, fType=花型, lShape=叶型
    const pC = [
      {
        arch: 'vine',
        fType: 'jasmine',
        lShape: 'willow',
        tCol: '#4a5d23',
        lCol: '#5c7a1a',
        vars: [
          { n: '金梅迎春', c: ['#FFD700'], w: 7000 },
          { n: '小叶迎春', c: ['#FFEA00'], w: 2500 },
          { n: '素馨迎春', c: ['#F4C430'], w: 500 },
        ],
      },

      {
        arch: 'herb',
        fType: 'cluster',
        lShape: 'tear',
        tCol: '#5c4033',
        lCol: '#7a8f6a',
        vars: [
          { n: '金边瑞香', c: ['#E6A8D7'], w: 6000 },
          { n: '白花瑞香', c: ['#FFFFFF', '#FFB7C5'], w: 3000 },
          { n: '蔷薇瑞香', c: ['#DDA0DD'], w: 997.76 },
          {
            n: '林涵霁雨',
            c: ['#00E5FF', '#B23AEE'],
            w: 2.24,
            tCol: '#E0E0E0',
            lCol: '#7FFFD4',
          },
        ],
      },

      {
        arch: 'tree',
        fType: 'peach',
        lShape: 'none',
        tCol: '#3E2F26',
        lCol: '#2d4c1e',
        baseLen: 85,
        lenVar: 35,
        vars: [
          { n: '碧桃', c: ['#FFB7C5', '#FF69B4'], w: 6000 },
          { n: '白花桃', c: ['#FFFFFF', '#FFB7C5'], w: 3000 },
          { n: '绛桃', c: ['#FF1493', '#C71585'], w: 900 },
          {
            n: '紫叶桃',
            c: ['#FF69B4', '#FF1493'],
            w: 100,
            tCol: '#2c141d',
            m: { bProb: 0.95, fProb: 0.15 },
          },
        ],
      },

      {
        arch: 'vine',
        fType: 'rose',
        lShape: 'sharp',
        tCol: '#556B2F',
        lCol: '#3D5222',
        vars: [
          { n: '粉团蔷薇', c: ['#FFC0CB', '#FF69B4'], w: 4500 },
          { n: '七姊妹', c: ['#E32636', '#800020'], w: 3500 },
          { n: '白玉堂', c: ['#FFFFFF', '#F5F5F5'], w: 1500 },
          { n: '黄蔷薇', c: ['#FFD700', '#FFA500'], w: 450 },
          { n: '珊瑚橘', c: ['#FF7F50', '#FF4500'], w: 50 },
        ],
      },

      {
        arch: 'basal',
        fType: 'iris',
        lShape: 'sword',
        tCol: '#4F7942',
        lCol: '#4F7942',
        vars: [
          { n: '蓝蝴蝶', c: ['#6A5ACD', '#E6E6FA'], w: 6000 },
          { n: '深紫鸢尾', c: ['#4B0082', '#8A2BE2'], w: 2500 },
          { n: '白雪鸢尾', c: ['#FFFFFF', '#F0F8FF'], w: 1000 },
          { n: '金脉鸢尾', c: ['#FFD700', '#FFFACD'], w: 500 },
        ],
      },

      {
        arch: 'herb',
        fType: 'simple',
        lShape: 'round',
        tCol: '#5C5448',
        lCol: '#2E472D',
        vars: [
          { n: '大叶栀子', c: ['#FFFFFF', '#F5F5F5'], w: 8000 },
          { n: '水栀子', c: ['#FFFFF0', '#FFF8DC'], w: 2000 },
        ],
      },

      {
        arch: 'basal',
        fType: 'lotus',
        lShape: 'lotus',
        tCol: '#2E8B57',
        lCol: '#2E8B57',
        vars: [
          { n: '红建莲', c: ['#FF69B4', '#FFC0CB'], w: 6000 },
          { n: '白洋淀', c: ['#FFFFFF', '#FFEC8B'], w: 3000 },
          {
            n: '千瓣莲',
            c: ['#FF1493', '#C71585'],
            w: 1000,
            m: { layers: 5, dense: true },
          },
        ],
      },

      {
        arch: 'tree',
        fType: 'micro',
        lShape: 'tear',
        tCol: '#696969',
        lCol: '#355E3B',
        baseLen: 75,
        lenVar: 35,
        vars: [
          { n: '金桂', c: ['#FFD700'], w: 5500 },
          { n: '银桂', c: ['#FFFACD'], w: 3500 },
          { n: '丹桂', c: ['#FFA500'], w: 1000 },
        ],
      },

      {
        arch: 'herb',
        fType: 'mum',
        lShape: 'lobed',
        tCol: '#6B8E23',
        lCol: '#556B2F',
        vars: [
          { n: '秋菊', c: ['#FFD700', '#DAA520'], w: 4500 },
          { n: '白菊', c: ['#FFFFFF', '#D3D3D3'], w: 3000 },
          { n: '紫菊', c: ['#D8BFD8', '#800080'], w: 1500 },
          {
            n: '墨菊',
            c: ['#8B0000', '#4A0404'],
            w: 900,
            m: { cMod: 2.0, lDense: 2.5, fScale: 1.5, hMod: 0.8, dense: true },
          },
          { n: '绿菊', c: ['#98FB98', '#2E8B57'], w: 100 },
        ],
      },

      {
        arch: 'tree',
        fType: 'hibiscus',
        lShape: 'broad',
        tCol: '#5E4B3C',
        lCol: '#4F7942',
        baseLen: 70,
        lenVar: 30,
        vars: [
          { n: '晨白芙蓉', c: ['#FFFFFF', '#FFB6C1'], w: 4500 },
          { n: '午粉芙蓉', c: ['#FF69B4', '#FFF0F5'], w: 4000 },
          { n: '暮红芙蓉', c: ['#DC143C', '#FF1493'], w: 1500 },
        ],
      },

      {
        arch: 'tree',
        fType: 'rose',
        lShape: 'round',
        tCol: '#3B3C36',
        lCol: '#004225',
        baseLen: 65,
        lenVar: 25,
        vars: [
          { n: '赤丹', c: ['#DC143C', '#8B0000'], w: 5000 },
          { n: '宫粉', c: ['#FFC0CB', '#FFF0F5'], w: 3000 },
          { n: '白天鹅', c: ['#FFFFFF', '#F5F5F5'], w: 1950 },
          {
            n: '十八学士',
            c: ['#FF0000', '#FFFFFF'],
            w: 50,
            m: { phyllotaxis: true, petals: 34 },
          },
        ],
      },

      {
        arch: 'tree',
        fType: 'peach',
        lShape: 'none',
        tCol: '#2F2F2F',
        lCol: '#1C1C1C',
        sympodial: true,
        baseLen: 60,
        lenVar: 25,
        vars: [
          { n: '素心腊梅', c: ['#FFFF00', '#FFD700'], w: 7500 },
          { n: '狗牙腊梅', c: ['#FFFACD', '#8B008B'], w: 2500 },
        ],
      },
    ];

    const cfg = Object.assign({}, pC[month]);

    let selectedVar = null;

    if (month === 1 && date.getDate() === 24) {
      selectedVar = cfg.vars.find((v) => v.n === '林涵霁雨');
    }

    if (!selectedVar) {
      let totalWeight = cfg.vars.reduce((sum, v) => sum + v.w, 0);
      let randomSpin = Math.random() * totalWeight;
      for (let v of cfg.vars) {
        if (randomSpin < v.w) {
          selectedVar = v;
          break;
        }
        randomSpin -= v.w;
      }
      if (!selectedVar) selectedVar = cfg.vars[0];
    }

    cfg.fCol = selectedVar.c;
    cfg.name = selectedVar.n;
    if (selectedVar.tCol) cfg.tCol = selectedVar.tCol;
    if (selectedVar.lCol) cfg.lCol = selectedVar.lCol;
    cfg.m = selectedVar.m || {};

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

    let paths = [];
    let organs = [];

    // --- 核心绘图辅助函数 ---
    function addStem(x1, y1, cx, cy, x2, y2, width, color, delay) {
      let len = Math.hypot(x2 - x1, y2 - y1) * 1.2;
      paths.push(
        `<path class="botany-stem" d="M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" style="stroke:${color}; stroke-width:${width.toFixed(1)}px; stroke-dasharray:${len}; stroke-dashoffset:${len}; animation-delay:${delay}s;" />`,
      );
    }

    // 生成叶片 SVG 路径
    function getLeafPath(shape) {
      const dict = {
        willow: 'M0,0 C-4,-15 -4,-35 0,-45 C4,-35 4,-15 0,0 Z',
        sword: 'M0,0 Q-10,-40 0,-100 Q10,-40 0,0 Z',
        lotus: 'M0,-10 C-35,-10 -45,-35 0,-45 C45,-35 35,-10 0,-10 Z',
        lobed:
          'M0,0 C-10,-10 -20,-5 -15,-20 C-25,-25 -10,-35 0,-40 C10,-35 25,-25 15,-20 C20,-5 10,-10 0,0 Z',
        broad: 'M0,0 C-20,-10 -25,-30 0,-45 C25,-30 20,-10 0,0 Z',
        round: 'M0,0 C-15,-8 -18,-22 0,-30 C18,-22 15,-8 0,0 Z',
        tear: 'M0,0 C-6,-8 -8,-20 0,-25 C8,-20 6,-8 0,0 Z',
        sharp: 'M0,0 L-8,-15 L0,-28 L8,-15 Z',
      };
      return dict[shape] || '';
    }

    function addLeaf(x, y, angle, scale, delay) {
      if (cfg.lShape === 'none') return;
      let path = getLeafPath(cfg.lShape);
      organs.push(`<g class="botany-leaf" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;">
        <path d="${path}" fill="${cfg.lCol}" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
      </g>`);
    }

    // 生成花朵构造
    function addFlower(x, y, angle, scale, delay) {
      let fHtml = '';
      let c1 = cfg.fCol[0];
      let c2 = cfg.fCol[1] || c1;

      if (cfg.fType === 'peach') {
        // 5瓣桃花/腊梅 (贴着枝干生长)
        for (let i = 0; i < 5; i++) {
          fHtml += `<path d="M0,0 C-6,-10 -10,-18 0,-22 C10,-18 6,-10 0,0 Z" fill="${c1}" transform="rotate(${i * 72})" opacity="0.9"/>`;
        }
        fHtml += `<circle r="3" fill="${c2}" />`;
      } else if (cfg.fType === 'lotus') {
        // 恢复侧面碗状结构，结合参数化层数
        let layers = cfg.m.layers || 3;
        for (let l = layers; l >= 1; l--) {
          let count = l * 2 + 1;
          let s = 1 - (layers - l) * 0.15;
          let pC = l % 2 === 0 ? c2 : c1;
          let spread = 25 + l * 12; // 扇形展开角度
          for (let i = 0; i < count; i++) {
            let rot = -spread + ((spread * 2) / (count - 1 || 1)) * i + (Math.random() * 4 - 2); // 扇形排布+微调
            let shape = cfg.m.dense
              ? `M0,0 C-5,-20 -3,-45 0,-50 C3,-45 5,-20 0,0 Z`
              : `M0,0 C-10,-15 -8,-45 0,-50 C8,-45 10,-15 0,0 Z`;
            fHtml += `<path d="${shape}" fill="${pC}" transform="rotate(${rot}) scale(${s})" opacity="0.9"/>`;
          }
        }
        // 底部加一个小莲蓬
        fHtml += `<ellipse cx="0" cy="-8" rx="6" ry="3" fill="#FFD700" opacity="0.85"/>`;
      } else if (cfg.fType === 'mum') {
        // 菊花：加入随机长短的错落感与双层管状花瓣
        let mDense = cfg.m.dense ? 40 : 24;
        for (let i = 0; i < mDense; i++) {
          let r = 1 - Math.random() * 0.35; // 花瓣长短不一
          let rot = i * (360 / mDense) + Math.random() * 8;
          // 外层长瓣
          fHtml += `<path d="M0,0 Q-4,-20 0,-${40 * r} Q4,-20 0,0 Z" fill="${c1}" transform="rotate(${rot})" opacity="0.85"/>`;
          // 内层短心
          fHtml += `<path d="M0,0 Q-2,-10 0,-${20 * r} Q2,-10 0,0 Z" fill="${c2}" transform="rotate(${rot + 15})" opacity="0.95"/>`;
        }
        fHtml += `<circle r="4" fill="${c2}" />`;
      } else if (cfg.fType === 'iris') {
        fHtml += `<path d="M0,0 C-15,-20 -20,-40 0,-45 C20,-40 15,-20 0,0 Z" fill="${c2}" transform="rotate(0)" opacity="0.9"/>`;
        fHtml += `<path d="M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z" fill="${c1}" transform="rotate(60)" opacity="0.9"/>`;
        fHtml += `<path d="M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z" fill="${c1}" transform="rotate(-60)" opacity="0.9"/>`;
      } else if (cfg.fType === 'rose') {
        let count = cfg.m.petals || 8;
        for (let i = 1; i <= count; i++) {
          let s,
            rot,
            cx = 0,
            cy = -6,
            c;
          if (cfg.m.phyllotaxis) {
            let r = 2.0 * Math.sqrt(i);
            rot = i * 137.5;
            cx = r * Math.sin((rot * Math.PI) / 180);
            cy = -r * Math.cos((rot * Math.PI) / 180);
            s = 1.2 - i * (1.0 / count);
            c = i > count / 2 ? c2 : c1;
          } else {
            s = 1 - i * 0.08;
            rot = i * 65;
            c = i % 2 === 0 ? c1 : c2;
          }
          fHtml += `<circle cx="${cx}" cy="${cy}" r="10" fill="${c}" transform="rotate(${rot}) scale(${s})" opacity="0.95"/>`;
        }
      } else if (cfg.fType === 'hibiscus') {
        // 芙蓉：宽大重叠的波浪感花瓣，与生动的立体花蕊
        for (let i = 0; i < 5; i++) {
          let rot = i * 72 + (Math.random() * 10 - 5);
          // 宽大透明的外层
          fHtml += `<path d="M0,0 C-25,-10 -35,-40 0,-45 C35,-40 25,-10 0,0 Z" fill="${c1}" transform="rotate(${rot})" opacity="0.85"/>`;
          // 颜色较深的内层渐变效果
          fHtml += `<path d="M0,0 C-10,-5 -15,-20 0,-25 C15,-20 10,-5 0,0 Z" fill="${c2}" transform="rotate(${rot})" opacity="0.6"/>`;
        }
        // 弯曲延伸的雄蕊群
        fHtml += `<path d="M0,0 Q5,-15 0,-28" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>`;
        fHtml += `<circle cx="0" cy="-28" r="2.5" fill="#FFA500"/>`;
        fHtml += `<circle cx="-2.5" cy="-25" r="1.5" fill="#FFA500"/>`;
        fHtml += `<circle cx="2.5" cy="-25" r="1.5" fill="#FFA500"/>`;
      } else if (cfg.fType === 'jasmine' || cfg.fType === 'simple') {
        // 简单4-5瓣花
        for (let i = 0; i < 4; i++) {
          fHtml += `<path d="M0,0 Q-8,-15 0,-20 Q8,-15 0,0 Z" fill="${c1}" transform="rotate(${i * 90})"/>`;
        }
        fHtml += `<circle r="2" fill="#FFD700" />`;
      } else if (cfg.fType === 'cluster' || cfg.fType === 'micro') {
        // 细碎簇生花 (桂花/瑞香)
        for (let i = 0; i < 5; i++) {
          let ox = (Math.random() - 0.5) * 15;
          let oy = (Math.random() - 0.5) * 15;
          fHtml += `<circle cx="${ox}" cy="${oy}" r="3" fill="${c1}" />`;
          fHtml += `<circle cx="${ox + 3}" cy="${oy}" r="3" fill="${c1}" />`;
        }
      }

      let filterStr = cfg.name === '林涵霁雨' ? `filter="drop-shadow(0 0 8px ${c1})"` : '';

      organs.push(
        `<g class="botany-flower" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;" ${filterStr}>${fHtml}</g>`,
      );
    }

    // ================= 生成算法 =================

    // 木本分形树 (桃花, 芙蓉, 山茶, 腊梅, 桂花)
    function buildTree(x, y, angle, length, depth, width, delay) {
      if (depth === 0) return;
      let x2 = x + Math.sin(angle) * length;
      let y2 = y - Math.cos(angle) * length;

      let isSympodial = cfg.sympodial && depth < 5;
      let cx =
        x + Math.sin(angle + (isSympodial ? 0.4 : (Math.random() - 0.5) * 0.4)) * length * 0.5;
      let cy =
        y - Math.cos(angle + (isSympodial ? 0.4 : (Math.random() - 0.5) * 0.4)) * length * 0.5;

      addStem(x, y, cx, cy, x2, y2, width, cfg.tCol, delay);
      let isEndpoint = depth === 1;

      // 提高花朵繁茂度 (簇生花可以在末端一次爆出多朵)
      let fProb = cfg.m.fProb !== undefined ? cfg.m.fProb : 0.6;

      // 让大树结出更大的花朵和叶片 (在基础缩放上再放大30%)
      let organScale = 1.3;

      if (cfg.fType === 'peach' || cfg.fType === 'micro') {
        if (depth <= 4 && Math.random() < fProb) {
          // 几率产生多朵花簇拥
          let blooms = Math.floor(Math.random() * 3) + 1;
          for (let b = 0; b < blooms; b++) {
            // 根据树干的粗细适当扩大簇生花的偏移范围，避免挤在一起
            let ox = (Math.random() - 0.5) * 16;
            let oy = (Math.random() - 0.5) * 16;
            addFlower(
              x2 + ox,
              y2 + oy,
              Math.random() * 360,
              (0.6 + Math.random() * 0.5) * organScale,
              delay + 0.5 + b * 0.1,
            );
          }
        }
      } else {
        if (isEndpoint)
          addFlower(
            x2,
            y2,
            (angle * 180) / Math.PI + (Math.random() * 60 - 30),
            (1.0 + Math.random() * 0.4) * organScale,
            delay + 0.6,
          );
      }

      if (!isEndpoint && cfg.lShape !== 'none' && Math.random() < 0.8) {
        addLeaf(
          x2,
          y2,
          (angle * 180) / Math.PI + 50 + Math.random() * 30,
          (0.7 + Math.random() * 0.4) * organScale,
          delay + 0.3,
        );
        addLeaf(
          x2,
          y2,
          (angle * 180) / Math.PI - 50 - Math.random() * 30,
          (0.7 + Math.random() * 0.4) * organScale,
          delay + 0.3,
        );
      }

      // 底层干可生2-4枝，中层可生0-3枝
      let bProb = cfg.m.bProb !== undefined ? cfg.m.bProb : 0.65;
      let maxBranches = 1;
      if (depth === 5)
        maxBranches = 2 + Math.floor(Math.random() * 3); // 根部 2~4 枝
      else {
        let r = Math.random();
        if (r < bProb - 0.3)
          maxBranches = 3; // 茂盛变异
        else if (r < bProb)
          maxBranches = 2; // 正常分叉
        else if (r > 0.9 && depth < 3) maxBranches = 0; // 自然枯顶
      }

      for (let i = 0; i < maxBranches; i++) {
        // 让分支散得更开更随机
        let dir = i % 2 === 0 ? -1 : 1;
        let spread = maxBranches === 1 ? Math.random() * 0.6 - 0.3 : dir * (0.3 + i * 0.15);
        let newAngle = angle + (isSympodial ? dir * 0.5 : spread) + (Math.random() * 0.4 - 0.2);
        // 分叉越多，子枝干越倾向于缩短，形成自然的树冠穹顶
        let lengthDrop = maxBranches > 2 ? 0.5 : 0.65;
        let newLength = length * (lengthDrop + Math.random() * 0.3);

        buildTree(x2, y2, newAngle, newLength, depth - 1, width * 0.65, delay + 0.15);
      }
    }

    // 基生/丛生型 (荷花, 鸢尾)
    function buildBasal() {
      let numStems =
        cfg.fType === 'lotus'
          ? 4 + Math.floor(Math.random() * 3)
          : 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numStems; i++) {
        let angle = (Math.random() - 0.5) * 0.8; // 随机发散角
        let length = 90 + Math.random() * 80; // 随机高度
        let x2 = Math.sin(angle) * length;
        let y2 = -Math.cos(angle) * length;
        let delay = i * 0.15 + Math.random() * 0.1;

        if (cfg.fType === 'lotus') {
          // 荷花直立茎带微随机弯曲
          let cx = x2 * 0.5 + (Math.random() - 0.5) * 30;
          let cy = y2 * 0.5;
          addStem(0, 0, cx, cy, x2, y2, 3 + Math.random() * 2, cfg.tCol, delay);

          if (i < 2 || Math.random() > 0.6) {
            addLeaf(
              x2,
              y2,
              (angle * 180) / Math.PI + (Math.random() - 0.5) * 20,
              1.0 + Math.random() * 0.8,
              delay + 0.4,
            );
          } else {
            addFlower(
              x2,
              y2,
              (angle * 180) / Math.PI + (Math.random() - 0.5) * 15,
              1.2 + Math.random() * 0.6,
              delay + 0.5,
            );
          }
        } else {
          // 鸢尾：中心长花，两侧长叶
          if (i === Math.floor(numStems / 2) || (numStems > 6 && i === 0)) {
            let fLen = length * (1.1 + Math.random() * 0.3);
            let cx = (Math.random() - 0.5) * 40; // 花葶随机歪曲
            let cy = -fLen * 0.5;
            let fx = Math.sin(angle) * fLen * 0.3;
            let fy = -fLen;
            addStem(0, 0, cx, cy, fx, fy, 4 + Math.random() * 2, cfg.tCol, delay);
            addFlower(fx, fy, (Math.random() - 0.5) * 30, 1.2 + Math.random() * 0.5, delay + 0.5);
          } else {
            // 弯曲剑叶
            let cx = x2 * (1.2 + Math.random() * 0.8);
            let cy = y2 * (0.3 + Math.random() * 0.4);
            addStem(0, 0, cx, cy, x2, y2, 6 + Math.random() * 4, cfg.lCol, delay);
          }
        }
      }
    }

    // 草本单轴型 (菊花, 栀子, 瑞香)
    function buildHerb() {
      // 从 cfg.m 读取形态学变异参数，若无则使用默认值 1.0
      let hMod = cfg.m.hMod || 1.0; // 高度乘数
      let cMod = cfg.m.cMod || 1.0; // 弯曲度(蛇形)乘数
      let lDense = cfg.m.lDense || 1.0; // 叶片密度乘数
      let fScale = cfg.m.fScale || 1.0; // 花朵大小乘数

      let height = (180 + Math.random() * 70) * hMod;
      let curveX = (Math.random() - 0.5) * 80 * cMod; // 控制茎干的弯曲极值
      let endX = curveX * 0.5 + (Math.random() - 0.5) * 40 * cMod; // 顶端偏移

      addStem(0, 0, curveX, -height * 0.5, endX, -height, 6 + Math.random() * 3, cfg.tCol, 0);

      let baseSteps = 4 + Math.floor(Math.random() * 4);
      let steps = Math.floor(baseSteps * lDense); // 应用叶片密度变异

      for (let i = 1; i < steps; i++) {
        // 利用二次贝塞尔方程，计算叶子在弯曲茎干上的坐标
        let t = i / steps;
        let mt = 1 - t;
        let px = mt * mt * 0 + 2 * mt * t * curveX + t * t * endX;
        let py = mt * mt * 0 + 2 * mt * t * (-height * 0.5) + t * t * -height;
        let delay = i * 0.15 + Math.random() * 0.1;

        let lAng = i % 2 === 0 ? -70 : 70;
        lAng += (Math.random() - 0.5) * 40;
        let lScale = 0.8 + Math.random() * 0.6;

        addLeaf(px, py, lAng, lScale, delay);
        // 如果是 simple 类型或触发几率，则对生/多生
        if (cfg.fType === 'simple' || Math.random() > 0.7) {
          addLeaf(
            px,
            py,
            -lAng + (Math.random() - 0.5) * 30,
            lScale * (0.8 + Math.random() * 0.3),
            delay,
          );
        }
      }

      // 生成顶端花朵，并应用缩放乘数
      addFlower(
        endX,
        -height,
        (Math.random() - 0.5) * 40,
        (1.5 + Math.random() * 0.7) * fScale,
        1.0,
      );
    }

    // 藤本垂枝型 (迎春, 蔷薇)
    function buildVine() {
      let numVines = 3 + Math.floor(Math.random() * 4); // 3 到 6 根藤条
      for (let i = 0; i < numVines; i++) {
        let sign = i % 2 === 0 ? 1 : -1;
        let angle = sign * (0.2 + Math.random() * 0.6); // 随机抛射角
        let len = 140 + Math.random() * 100; // 随机藤条长度

        // 生成受重力拉扯的贝塞尔曲线
        let cx = Math.sin(angle) * len * (1 + Math.random() * 0.5);
        let cy = -Math.cos(angle) * len * (1 + Math.random() * 0.5);
        let x2 = cx + sign * len * (0.1 + Math.random() * 0.5); // 末端自然下坠
        let y2 = cy + len * (0.4 + Math.random() * 0.7);

        let delay = i * 0.2 + Math.random() * 0.15;
        addStem(0, 0, cx, cy, x2, y2, 3 + Math.random() * 2, cfg.tCol, delay);

        let numNodes = 3 + Math.floor(Math.random() * 5); // 每根藤条随机节点数
        for (let k = 1; k <= numNodes; k++) {
          let t = k / (numNodes + 1) + (Math.random() - 0.5) * 0.1; // 沿途节点加入微调抖动
          if (t <= 0 || t >= 1) continue;
          let mt = 1 - t;
          let px = mt * mt * 0 + 2 * mt * t * cx + t * t * x2;
          let py = mt * mt * 0 + 2 * mt * t * cy + t * t * y2;

          if (Math.random() > 0.1)
            addLeaf(
              px,
              py,
              sign * 90 + (Math.random() * 60 - 30),
              0.6 + Math.random() * 0.5,
              delay + t,
            );
          if (Math.random() > 0.3)
            addFlower(
              px,
              py,
              sign * 45 + (Math.random() * 50 - 25),
              0.5 + Math.random() * 0.5,
              delay + t + 0.2,
            );
        }
      }
    }

    // 路由分发
    if (cfg.arch === 'tree') {
      let bLen = cfg.baseLen || 70; // 读取当前物种的基础高度
      let lVar = cfg.lenVar || 30; // 读取当前物种的高度变异范围
      let tLength = bLen + Math.random() * lVar;

      // 树干粗细与生成的高度成正比联动，同时加上微小的粗糙随机
      let tWidth = tLength * 0.16 + Math.random() * 4;
      buildTree(0, 0, (Math.random() - 0.5) * 0.2, tLength, 5, tWidth, 0.2);
    } else if (cfg.arch === 'basal') buildBasal();
    else if (cfg.arch === 'herb') buildHerb();
    else if (cfg.arch === 'vine') buildVine();

    svgContent += paths.join('') + organs.join('') + `</g></svg>`;

    requestAnimationFrame(() => {
      container.innerHTML = svgContent;
      label.innerText = `${monthNames[month]} · ${cfg.name}`;
    });
    plantGenerated = true;
  }

  // ================= 音乐播放器系统 (Howler.js) =================
  // 前端JS由于安全限制无法读取文件系统结构，这里将结构映射为JSON
  const filesMap = {
    morning: [
      'atlasaudio-corporate-491319.mp3',
      'atlasaudio-jazz-490623.mp3',
      'atlasaudio-upbeat-491082.mp3',
      'paulyudin-piano-music-piano-485929.mp3',
      'paulyudin-technology-tech-technology-484304.mp3',
      'prettyjohn1-emotional-piano-487334.mp3',
      'prettyjohn1-medical-doctor-clinic-background-487928.mp3',
      'the_mountain-chill-485562.mp3',
      'the_mountain-luxury-luxury-music-490006.mp3',
      'the_mountain-news-news-music-490008.mp3',
      'the_mountain-presentation-presentation-music-490011.mp3',
      'the_mountain-relaxing-relaxing-music-492810.mp3',
      'the_mountain-successful-492812.mp3',
      'the_mountain-wedding-487025.mp3',
    ],
    afternoon: [
      'apalonbeats-afrobeat-afro-beat-2-491432.mp3',
      'maksym_dudchyk-lost-in-love-hip-hop-background-music-for-video-stories-43-second-490026.mp3',
      'mondamusic-background-music-491692.mp3',
      'mondamusic-promo-advertising-music-491682.mp3',
      'mondamusic-upbeat-491686.mp3',
      'paulyudin-no-copyright-music-482400.mp3',
      'the_mountain-advertising-advertising-music-492799.mp3',
      'the_mountain-hopeful-hopeful-music-492806.mp3',
      'the_mountain-meditation-meditation-music-490007.mp3',
      'the_mountain-piano-background-music-487020.mp3',
      'the_mountain-soft-background-music-492811.mp3',
      'the_mountain-upbeat-upbeat-background-music-487024.mp3',
    ],
    evening: [
      'eliveta-corporate-491206.mp3',
      'mondamusic-asian-491695.mp3',
      'mondamusic-chill-491681.mp3',
      'mondamusic-chill-beats-chill-491676.mp3',
      'mondamusic-dark-ambient-soundscape-dreamscape-2-487315.mp3',
      'mondamusic-dark-ambient-soundscape-dreamscape-2-491706.mp3',
      'mondamusic-educational-presentation-tutorial-music-491691.mp3',
      'mondamusic-lofi-chill-491719.mp3',
      'mondamusic-lofi-lofi-chill-lofi-girl-491690.mp3',
      'mondamusic-lounge-491696.mp3',
      'mondamusic-lounge-jazz-elevator-music-487312.mp3',
      'mondamusic-minimal-491664.mp3',
      'mondamusic-positive-house-491683.mp3',
      'mondamusic-vlogs-vlog-youtube-491672.mp3',
      'prettyjohn1-lofi-lofi-chill-lofi-girl-490466.mp3',
      'prettyjohn1-sad-background-music-489875.mp3',
      'the_mountain-emotional-emotional-music-490002.mp3',
    ],
  };

  // 根据当前时间判断时段
  const hour = new Date().getHours();
  let timePeriod = 'morning';
  if (hour >= 12 && hour < 18) {
    timePeriod = 'afternoon';
  } else if (hour >= 18 || hour < 5) {
    timePeriod = 'evening';
  }

  // 解析文件名功能：第一个 - 之前为歌手，最后一个 - 之后为ID，中间为歌名
  function parseFileName(filename) {
    const rawName = filename.replace('.mp3', '');
    const parts = rawName.split('-');

    if (parts.length < 3) {
      return { artist: '未知艺术家', title: rawName };
    }

    const artist = parts[0].replace(/_/g, ' ').toUpperCase();
    const title = parts.slice(1, -1).join(' ').replace(/_/g, ' ');
    return { artist: artist, title: title };
  }

  // 组装当前播放列表
  let playlist = filesMap[timePeriod].map((filename) => {
    const info = parseFileName(filename);
    return {
      artist: info.artist,
      name: info.title,
      src: `/Lin/music/${timePeriod}/${encodeURIComponent(filename)}`,
    };
  });

  // 读取本地存储的播放器设置（针对当前时段）
  const storageKey = `LinAudio_${timePeriod}`;
  let playerSettings = JSON.parse(localStorage.getItem(storageKey)) || {
    mode: 1,
    disabled: [],
    vol: 30,
  };
  let playMode = playerSettings.mode; // 0: 列表循环, 1: 随机播放, 2: 单曲循环

  function savePlayerSettings() {
    localStorage.setItem(storageKey, JSON.stringify(playerSettings));
  }

  // ================= 🎂 生日彩蛋特效引擎 =================
  window.activateBirthdayMode = function () {
    console.log('🎂 生日彩蛋触发！特别曲目已加入歌单。');

    // 1. 音乐逻辑
    const bdayTracks = [
      'the_mountain-birthday-490600.mp3',
      'the_mountain-cartoon-cartoon-music-489996.mp3',
    ].map((f) => ({
      artist: parseFileName(f).artist,
      name: parseFileName(f).title,
      src: `/Lin/music/birthday/${encodeURIComponent(f)}`,
    }));
    playlist.unshift(...bdayTracks);

    const albumArt = document.getElementById('album-art');
    if (albumArt) albumArt.className = 'p-album-art birthday';

    if (typeof renderPlaylist === 'function') renderPlaylist();
    if (currentHowl) {
      currentHowl.stop();
      loadTrack(0, true);
    }

    // 2. 触发满屏飘带纸屑 (2D Canvas)
    launchConfetti();

    // 3. 动态加载 Three.js 并在此处渲染 3D 礼盒，替换植物
    const gardenLabel = document.getElementById('gardenLabel');
    if (gardenLabel) gardenLabel.innerText = '生日快乐！点击拆开礼物 🎁';
    loadAndShowPresent();
  };

  // --- 彩蛋 1: 飘带与纸屑 ---
  function launchConfetti() {
    let oldCanvas = document.getElementById('confetti-canvas');
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';

    canvas.style.cssText =
      'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:99999; pointer-events:none; opacity:0; transition:opacity 0.8s ease;';
    document.body.appendChild(canvas);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        canvas.style.opacity = '1';
      });
    });

    const ctx = canvas.getContext('2d');
    const retina = Math.min(2, window.devicePixelRatio || 1);
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * retina;
    canvas.height = h * retina;

    const DEG_TO_RAD = Math.PI / 180;
    const colors = [
      ['#df0049', '#660671'],
      ['#00e857', '#005291'],
      ['#2bebbc', '#05798a'],
      ['#ffd200', '#b06c00'],
    ];

    class Vector2 {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    }
    class EulerMass {
      constructor(x, y, mass, drag) {
        this.pos = new Vector2(x, y);
        this.mass = mass;
        this.drag = drag;
        this.force = new Vector2(0, 0);
        this.vel = new Vector2(0, 0);
      }
      AddForce(fx, fy) {
        this.force.x += fx;
        this.force.y += fy;
      }
      Integrate(dt) {
        let speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        let accX = (this.force.x - this.drag * this.mass * this.vel.x * speed) / this.mass;
        let accY = (this.force.y - this.drag * this.mass * this.vel.y * speed) / this.mass;
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        this.vel.x += accX * dt;
        this.vel.y += accY * dt;
        this.force.x = 0;
        this.force.y = 0;
      }
    }

    class ConfettiRibbon {
      constructor(x, y) {
        this.particleCount = 20;
        this.particleDist = 8.0;
        this.particles = [];
        const ci = Math.floor(Math.random() * colors.length);
        this.front = colors[ci][0];
        this.back = colors[ci][1];
        this.xOff = Math.cos(45 * DEG_TO_RAD) * 8.0;
        this.yOff = Math.sin(45 * DEG_TO_RAD) * 8.0;
        this.pos = new Vector2(x, y);
        this.prevPos = new Vector2(x, y);
        this.velInherit = Math.random() * 2 + 4;
        this.time = Math.random() * 100;
        this.oscSpeed = Math.random() * 2 + 2;
        this.oscDist = Math.random() * 40 + 40;
        this.ySpeed = Math.random() * 40 + 80;
        for (let i = 0; i < this.particleCount; i++) {
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
        let delta = Math.sqrt(dx * dx + dy * dy);
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;

        for (let i = 1; i < this.particleCount; i++) {
          let dirX = this.particles[i - 1].pos.x - this.particles[i].pos.x;
          let dirY = this.particles[i - 1].pos.y - this.particles[i].pos.y;
          let len = Math.sqrt(dirX * dirX + dirY * dirY);
          if (len > 0) {
            dirX /= len;
            dirY /= len;
          }
          this.particles[i].AddForce(
            dirX * (delta / dt) * this.velInherit,
            dirY * (delta / dt) * this.velInherit,
          );
        }
        for (let i = 1; i < this.particleCount; i++) this.particles[i].Integrate(dt);
        for (let i = 1; i < this.particleCount; i++) {
          let rpX = this.particles[i].pos.x - this.particles[i - 1].pos.x;
          let rpY = this.particles[i].pos.y - this.particles[i - 1].pos.y;
          let len = Math.sqrt(rpX * rpX + rpY * rpY);
          if (len > 0) {
            rpX /= len;
            rpY /= len;
          }
          this.particles[i].pos.x = this.particles[i - 1].pos.x + rpX * this.particleDist;
          this.particles[i].pos.y = this.particles[i - 1].pos.y + rpY * this.particleDist;
        }
        if (this.pos.y > h + this.particleDist * this.particleCount) {
          this.pos.y = -Math.random() * h;
          this.pos.x = Math.random() * w;
          this.prevPos.x = this.pos.x;
          this.prevPos.y = this.pos.y;
          for (let i = 0; i < this.particleCount; i++) {
            this.particles[i].pos.x = this.pos.x;
            this.particles[i].pos.y = this.pos.y - i * this.particleDist;
          }
        }
      }
      draw() {
        for (let i = 0; i < this.particleCount - 1; i++) {
          let p0x = this.particles[i].pos.x + this.xOff,
            p0y = this.particles[i].pos.y + this.yOff;
          let p1x = this.particles[i + 1].pos.x + this.xOff,
            p1y = this.particles[i + 1].pos.y + this.yOff;
          let side =
            (this.particles[i].pos.x - this.particles[i + 1].pos.x) *
              (p1y - this.particles[i + 1].pos.y) -
            (this.particles[i].pos.y - this.particles[i + 1].pos.y) *
              (p1x - this.particles[i + 1].pos.x);
          ctx.fillStyle = side < 0 ? this.front : this.back;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].pos.x * retina, this.particles[i].pos.y * retina);
          ctx.lineTo(this.particles[i + 1].pos.x * retina, this.particles[i + 1].pos.y * retina);
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
        this.front = colors[ci][0];
        this.back = colors[ci][1];
        this.corners = Array.from({ length: 4 }, (_, i) => ({
          x: Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45)),
          y: Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45)),
        }));
      }
      update(dt) {
        this.time += dt;
        this.rotation += this.rotationSpeed * dt;
        this.pos.x += Math.cos(this.time * this.oscSpeed) * this.xSpeed * dt;
        this.pos.y += this.ySpeed * dt;
        if (this.pos.y > h) {
          this.pos.x = Math.random() * w;
          this.pos.y = -50;
        }
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

    const entities = [];
    const paperCount = w < 768 ? 20 : 40;
    const ribbonCount = w < 768 ? 8 : 16;
    for (let i = 0; i < paperCount; i++) entities.push(new Paper());
    for (let i = 0; i < ribbonCount; i++)
      entities.push(new ConfettiRibbon(Math.random() * w, -Math.random() * h * 2));

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
      entities.forEach((p) => {
        p.update(dt);
        p.draw();
      });

      if (!isStopping) rafId = requestAnimationFrame(animate);
    }
    animate();

    setTimeout(() => {
      if (!isStopping && window.stopConfetti) window.stopConfetti();
    }, 12000);

    window.addEventListener('resize', () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * retina;
      canvas.height = h * retina;
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

    container.dataset.presentActive = 'true';

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
      console.error('[Lin] 3D 彩蛋引擎加载失败:', e);
      container.innerHTML = `<div style="text-align:center; padding-top:40px; color:#e74c3c; font-size:12px; font-weight:bold;">礼物被快递弄丢了 (网络阻断)</div>`;
    }
  }

  function initPresent(container, THREE) {
    container.innerHTML = '';
    let scene, camera, renderer, present, rafId;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let intersects = [];

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
        this.opening = false;
        this.opened = false;
        this.openTime = 0;
        this.opacity = 1;
        this.pieces = [];

        const S = 8,
          HS = S / 2,
          divs = 3,
          fracS = S / divs,
          HD = divs / 2;

        const geo = new THREE.PlaneGeometry(fracS, fracS);
        const wrapMat = new THREE.MeshStandardMaterial({
          color: 0xffe6e6,
          side: THREE.DoubleSide,
          transparent: true,
        });
        const ribMat = new THREE.MeshStandardMaterial({
          color: 0xff4d79,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const rand = (min, max) => Math.random() * (max - min) + min;

        for (let s = 0; s < 6; ++s) {
          let side = new THREE.Object3D();
          if (s === 0) {
            side.position.set(0, -HS, 0);
            side.rotation.x = Math.PI / 2;
          } else if (s === 1) {
            side.position.set(0, 0, -HS);
            side.rotation.y = Math.PI;
          } else if (s === 2) {
            side.position.set(-HS, 0, 0);
            side.rotation.y = -Math.PI / 2;
          } else if (s === 3) {
            side.position.set(HS, 0, 0);
            side.rotation.y = Math.PI / 2;
          } else if (s === 4) {
            side.position.set(0, 0, HS);
          } else {
            side.position.set(0, HS, 0);
            side.rotation.x = -Math.PI / 2;
          }

          for (let h = -HD; h < HD; h++) {
            for (let w = -HD; w < HD; w++) {
              let isM = (w >= -1 && w <= 0) || (h >= -1 && h <= 0 && (s === 0 || s === 5));
              let piece = new THREE.Mesh(geo, isM ? ribMat.clone() : wrapMat.clone());
              piece.receiveShadow = true;
              piece.firstPos = {
                x: fracS * w + fracS / 2,
                y: fracS * h + fracS / 2,
                z: 0,
              };
              piece.position.set(piece.firstPos.x, piece.firstPos.y, 0);

              piece.vel = new THREE.Vector3(
                rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
                rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
                rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
              );
              piece.rotSpeed = new THREE.Vector3(
                rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
                rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
                rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
              );
              side.add(piece);
              this.pieces.push(piece);
            }
          }
          this.mesh.add(side);
        }

        const bowGeo = new THREE.DodecahedronGeometry(2);
        this.bow = new THREE.Mesh(bowGeo, ribMat.clone());
        this.bow.castShadow = true;
        this.bow.firstPos = { y: HS + 1 };
        this.bow.position.set(0, this.bow.firstPos.y, 0);
        this.bow.vel = new THREE.Vector3(
          rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
          1.5,
          rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
        );
        this.bow.rotSpeed = new THREE.Vector3(rand(0.1, 0.2), rand(0.1, 0.2), rand(0.1, 0.2));
        this.mesh.add(this.bow);

        this.mesh.rotation.y = Math.PI / 4;
      }

      update() {
        if (!this.opening && !this.opened) {
          this.mesh.rotation.y += 0.01;
        } else if (this.opening) {
          let scaleBy = 1 - 0.05 * Math.sin((8 * Math.PI * this.openTime) / 100);
          this.mesh.scale.set(scaleBy, scaleBy, scaleBy);
          this.openTime += 5;
          if (this.openTime >= 100) {
            this.opening = false;
            this.opened = true;
          }
        } else if (this.opened) {
          if (this.opacity > 0) {
            this.opacity -= 0.03;
            this.pieces.forEach((e) => {
              e.position.add(e.vel);
              e.rotation.x += e.rotSpeed.x;
              e.rotation.y += e.rotSpeed.y;
              e.rotation.z += e.rotSpeed.z;
              e.material.opacity = this.opacity;
            });
            this.bow.position.add(this.bow.vel);
            this.bow.rotation.x += this.bow.rotSpeed.x;
            this.bow.rotation.y += this.bow.rotSpeed.y;
            this.bow.material.opacity = this.opacity;
          } else {
            this.opacity = 1;
            this.opened = false;
            this.openTime = 0;
            this.mesh.scale.set(1, 1, 1);
            this.pieces.forEach((e) => {
              e.position.set(e.firstPos.x, e.firstPos.y, e.firstPos.z);
              e.rotation.set(0, 0, 0);
              e.material.opacity = 1;
            });
            this.bow.position.set(0, this.bow.firstPos.y, 0);
            this.bow.rotation.set(0, 0, 0);
            this.bow.material.opacity = 1;
          }
        }
      }
    }

    present = new Present();
    scene.add(present.mesh);

    let idleFrames = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (present) {
        present.update();
        if (!present.opening && present.opened) {
          idleFrames++;
          if (idleFrames > 120) return;
        } else {
          idleFrames = 0;
        }
      }
      renderer.render(scene, camera);
    }
    animate();

    const handleInteract = (e) => {
      let cx = e.clientX || (e.touches && e.touches[0].clientX);
      let cy = e.clientY || (e.touches && e.touches[0].clientY);
      if (!cx || !cy) return;

      const bcr = renderer.domElement.getBoundingClientRect();
      pointer.x = ((cx - bcr.left) / bcr.width) * 2 - 1;
      pointer.y = -((cy - bcr.top) / bcr.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      intersects = raycaster.intersectObjects(present.mesh.children, true);

      if (intersects.length > 0) {
        e.preventDefault();
        if (!present.opening && !present.opened) {
          present.opening = true;
          if (window.stopConfetti) window.stopConfetti();
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', handleInteract);
    renderer.domElement.addEventListener('touchstart', handleInteract, {
      passive: false,
    });

    const resizeObserver = new ResizeObserver((entries) => {
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
  let playHistory = [];
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
  const autoOpenSwitch = document.getElementById('autoOpenSwitch');
  const albumArt = document.getElementById('album-art');

  // 设置唱片机根据时段分配外观颜色
  if (albumArt) albumArt.className = `p-album-art ${timePeriod}`;
  if (volumeSlider) volumeSlider.value = playerSettings.vol;

  // 格式化时间为 MM:SS
  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // 动态渲染交互式播放列表
  function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = playlist
      .map((track, idx) => {
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
      })
      .join('');

    // 绑定点击事件
    container.querySelectorAll('.playlist-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const idx = parseInt(item.getAttribute('data-idx'));
        const trackSrc = playlist[idx].src;

        if (e.target.closest('.li-toggle')) {
          e.stopPropagation();
          if (playerSettings.disabled.includes(trackSrc)) {
            playerSettings.disabled = playerSettings.disabled.filter((src) => src !== trackSrc);
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
    let valid = [];
    playlist.forEach((t, i) => {
      if (!playerSettings.disabled.includes(t.src)) valid.push(i);
    });
    return valid;
  }

  function getNextValidIndex(currentIndex, direction = 1) {
    let valid = getValidIndices();
    if (valid.length === 0) return -1;

    if (playMode === 1) {
      if (valid.length === 1) return valid[0];
      let rnd;
      do {
        rnd = valid[Math.floor(Math.random() * valid.length)];
      } while (rnd === currentIndex);
      return rnd;
    } else {
      let pos = valid.indexOf(currentIndex);
      if (pos !== -1) {
        return valid[(pos + direction + valid.length) % valid.length];
      } else {
        if (direction === 1) {
          let nextValid = valid.find((i) => i > currentIndex);
          return nextValid !== undefined ? nextValid : valid[0];
        } else {
          let prevValid = valid
            .slice()
            .reverse()
            .find((i) => i < currentIndex);
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

  let preloadedNextIndex = -1;
  let preloadedHowl = null;

  function preloadNextTrack() {
    let validIndices = getValidIndices();
    if (validIndices.length === 0) return;

    let nextIndex = -1;
    if (playMode === 1) {
      if (validIndices.length === 1) nextIndex = validIndices[0];
      else {
        do {
          nextIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        } while (nextIndex === currentTrackIndex);
      }
    } else {
      let pos = validIndices.indexOf(currentTrackIndex);
      if (pos !== -1) {
        nextIndex = validIndices[(pos + 1) % validIndices.length];
      } else {
        let nextValid = validIndices.find((i) => i > currentTrackIndex);
        nextIndex = nextValid !== undefined ? nextValid : validIndices[0];
      }
    }

    if (nextIndex === preloadedNextIndex && preloadedHowl) return;
    if (preloadedHowl) preloadedHowl.unload();

    preloadedNextIndex = nextIndex;
    preloadedHowl = new Howl({
      src: [playlist[nextIndex].src],
      html5: true,
      preload: true,
      volume: 1,
    });
  }

  function bindHowlEvents(howlObj, autoStart) {
    howlObj.on('load', function () {
      const tTot = document.getElementById('p-time-total');
      if (tTot) tTot.innerText = formatTime(this.duration());
      if (autoStart) playTrack();
    });
    howlObj.on('play', function () {
      isPlaying = true;
      updateUI(true);

      this.fade(this.volume(), 1, 1000);
      setTimeout(() => {
        if (this.playing()) this.volume(1);
      }, 1050);

      if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = requestAnimationFrame(stepProgress);
    });
    howlObj.on('pause', function () {
      isPlaying = false;
      updateUI(false);
    });
    howlObj.on('stop', function () {
      isPlaying = false;
      updateUI(false);
    });
    howlObj.on('end', function () {
      if (autoPlaySwitch && autoPlaySwitch.checked) playNext(true);
      else {
        isPlaying = false;
        updateUI(false);
      }
    });
    howlObj.on('loaderror', function (id, err) {
      console.error('音频加载失败:', err);
    });
  }

  // 增加 isPrev 参数，判断是否为“返回上一首”操作
  function loadTrack(index, autoStart = false, isPrev = false) {
    if (typeof Howl === 'undefined' || typeof Howler === 'undefined') {
      console.warn('[Lin 音乐系统] Howler.js 未加载，播放器进入离线模式。');
      if (trackArtist) trackArtist.innerText = '系统离线';
      if (trackName) trackName.innerText = '网络异常或 CDN 被拦截，音乐不可用';
      return;
    }

    // 如果不是在按“上一首”，且存在有效的上一首歌曲，则记录进历史栈
    if (currentHowl && !isPrev && currentTrackIndex !== index) {
      playHistory.push(currentTrackIndex);
      if (playHistory.length > 50) playHistory.shift(); // 最多追溯 50 首歌，防内存溢出
    }

    currentTrackIndex = index;
    const track = playlist[index];
    trackArtist.innerText = track.artist;
    trackName.innerText = track.name;

    const barEl = document.getElementById('p-bar');
    const tCur = document.getElementById('p-time-current');
    const tTot = document.getElementById('p-time-total');
    if (barEl) barEl.style.width = '0%';
    if (tCur) tCur.innerText = '00:00';
    if (tTot) tTot.innerText = '00:00';

    renderPlaylist();

    if (currentHowl) {
      if (isPlaying) {
        const fadingHowl = currentHowl;
        fadingHowl.off();
        fadingHowl.fade(fadingHowl.volume(), 0, 800);
        fadingHowl.once('fade', () => {
          fadingHowl.stop();
          fadingHowl.unload();
        });
      } else {
        currentHowl.stop();
        currentHowl.unload();
      }
    }

    if (preloadedNextIndex === index && preloadedHowl) {
      currentHowl = preloadedHowl;
      preloadedHowl = null;
      preloadedNextIndex = -1;

      currentHowl.off('load');
      currentHowl.off('play');
      currentHowl.off('pause');
      currentHowl.off('stop');
      currentHowl.off('end');
      currentHowl.off('loaderror');
      bindHowlEvents(currentHowl, autoStart);

      if (currentHowl.state() === 'loaded') {
        if (tTot) tTot.innerText = formatTime(currentHowl.duration());
        if (autoStart) playTrack();
      }
    } else {
      currentHowl = new Howl({
        src: [track.src],
        html5: true,
        preload: true,
        volume: autoStart ? 0 : 1,
      });
      bindHowlEvents(currentHowl, autoStart);
    }

    preloadNextTrack();
  }

  const pBarEl = document.getElementById('p-bar');
  const pTimeCurEl = document.getElementById('p-time-current');
  let lastTimeStr = '';
  let lastPercentStr = '';
  let lastRafTime = 0;

  function stepProgress(timestamp) {
    if (!currentHowl || !isPlaying) return;

    if (timestamp - lastRafTime < 100) {
      progressAnimationFrame = requestAnimationFrame(stepProgress);
      return;
    }
    lastRafTime = timestamp;

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
    if (isPlaying) pauseTrack();
    else playTrack();
  }

  function playTrack() {
    if (!currentHowl) return;
    currentHowl.off('fade');

    if (!currentHowl.playing()) {
      currentHowl.volume(0); // 局部归零，通过 onplay 回调去触发 1000ms 的淡入到 1
      currentHowl.play();
    } else {
      isPlaying = true;
      updateUI(true);
      currentHowl.fade(currentHowl.volume(), 1, 1000);
      setTimeout(() => {
        if (currentHowl && currentHowl.playing()) currentHowl.volume(1);
      }, 1050);

      if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = requestAnimationFrame(stepProgress);
    }
  }

  function pauseTrack() {
    if (!currentHowl) return;
    isPlaying = false;
    updateUI(false);
    currentHowl.off('fade');
    currentHowl.fade(currentHowl.volume(), 0, 800);
    currentHowl.once('fade', () => {
      if (!isPlaying) currentHowl.pause(); // 淡出完毕后真正暂停
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
      if (
        preloadedNextIndex !== -1 &&
        !playerSettings.disabled.includes(playlist[preloadedNextIndex].src)
      ) {
        nextIndex = preloadedNextIndex;
      } else {
        nextIndex = getNextValidIndex(currentTrackIndex, 1);
      }
    }
    loadTrack(nextIndex, true);
  }

  function playPrev() {
    let validIndices = getValidIndices();
    if (validIndices.length === 0) return pauseTrack();

    let prevIndex = -1;
    // 优先从历史记录栈中回溯
    while (playHistory.length > 0) {
      let idx = playHistory.pop();
      // 必须确保历史记录中的这首歌没有在刚才被拉黑
      if (!playerSettings.disabled.includes(playlist[idx].src)) {
        prevIndex = idx;
        break;
      }
    }

    // 如果历史栈被掏空（或者都是被拉黑的歌），则按照现有模式（顺序/随机）给个上一首
    if (prevIndex === -1) {
      prevIndex = getNextValidIndex(currentTrackIndex, -1);
    }

    // 传入 isPrev = true 标志，防止这次后退操作又被错误记入历史
    loadTrack(prevIndex, true, true);
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

  if (playlist.length > 0) {
    renderPlaylist();

    let validIndices = getValidIndices();
    let startIdx = 0;
    if (validIndices.length > 0) {
      startIdx =
        playMode === 1
          ? validIndices[Math.floor(Math.random() * validIndices.length)]
          : validIndices[0];
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
    trackArtist.innerText = '无音乐';
    trackName.innerText = `未找到 ${timePeriod} 时段音乐`;
  }

  // ================= 设置页功能 =================
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const turnSpeedSlider = document.getElementById('turnSpeedSlider');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const fsBtn = document.getElementById('fsBtn');

  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      document.querySelector('.app-container').classList.toggle('fullscreen-mode');
    });
  }

  if (autoOpenSwitch) {
    autoOpenSwitch.checked = localStorage.getItem('LinUI_autoOpen') === 'true';
    autoOpenSwitch.addEventListener('change', (e) => {
      localStorage.setItem('LinUI_autoOpen', e.target.checked);
    });
  }

  if (volumeSlider) {
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

  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      root.style.setProperty('--base-font-size', e.target.value + 'px');
    });
  }

  if (turnSpeedSlider) {
    turnSpeedSlider.addEventListener('input', (e) => {
      let speed = Math.max(0.2, 2.2 - e.target.value * 0.2).toFixed(2);
      root.style.setProperty('--turn-speed', speed + 's');
    });
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      if (fontSizeSlider) fontSizeSlider.value = 15;
      if (volumeSlider) volumeSlider.value = 30;
      if (turnSpeedSlider) turnSpeedSlider.value = 6;
      if (autoPlaySwitch) autoPlaySwitch.checked = true;
      if (autoOpenSwitch) {
        autoOpenSwitch.checked = false;
        localStorage.setItem('LinUI_autoOpen', 'false');
      }
      root.style.setProperty('--base-font-size', '15px');
      root.style.setProperty('--turn-speed', '1s');
      Howler.volume(0.3);
      if (typeof playerSettings !== 'undefined') {
        playerSettings.vol = 30;
        playerSettings.mode = 1;
        playerSettings.disabled = [];
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
    const setT = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val || '暂无数据';
    };

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
    if (targetEl)
      targetEl.innerHTML = `🎯 <strong>预期目标：</strong>${d['预期目标'] || '暂未设定'}`;
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
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    };

    document.querySelectorAll('.temp-note').forEach((el) => el.remove());

    const existingNodes = Array.from(chatHistory.children).filter(
      (el) =>
        (el.classList.contains('ai-msg') || el.classList.contains('user-note')) &&
        el.id !== 'typing-bubble',
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

    const allNodes = Array.from(chatHistory.children).filter((el) => el.id !== 'typing-bubble');
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

    typingBubble.innerHTML =
      parseMD(event.data.text) + '<span style="animation: blink 1s infinite;">▌</span>';

    // AI 正在打字时，始终让视口吸附在容器最底部，平滑跟随后续文字
    if (chatPage) {
      chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'auto' });
    }
  }
});
