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

  // 暗黑模式灯绳
  const lampCord = document.getElementById('lampCord');
  let isDarkMode = false;
  const toggleDarkMode = (e) => {
    if(e) e.preventDefault();
    lampCord.classList.add('pulled');
    setTimeout(() => {
      lampCord.classList.remove('pulled');
      isDarkMode = !isDarkMode;
      if (isDarkMode) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
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

  function sendOHCard() {
    globalOverlay.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'oh-card-wrapper';
    wrapper.innerHTML = `
      <div class="oh-image-large">?</div>
      <p style="text-align:center; color: var(--text-main); font-weight: 600; margin-bottom: 10px;">这是一张 OH 卡</p>
      <p style="text-align:center; color: var(--text-ai); font-size: 13px;">请观察画面，你最先注意到的是什么？</p>
      <button class="close-overlay-btn" onclick="document.getElementById('global-overlay').innerHTML=''">收起卡片</button>
    `;
    globalOverlay.appendChild(wrapper);

    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-msg';
    aiMsg.innerText = "我递给了你一张OH卡，看看书本上方的浮层。";
    chatHistory.appendChild(aiMsg);
    chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });
  }

  function sendSCL90() {
    globalOverlay.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'scl-wrapper';
    
    // 生成带可选项的 SCL-90 量表内容
    let formHTML = `
      <div class="scl-title">SCL-90 症状自评量表</div>
      <div class="scl-desc">请根据最近一周的实际感受选择</div>
    `;
    
    const questions =[
      "1. 头痛", "2. 感到紧张或容易激动", "3. 头脑中有不必要的想法或字句盘旋", 
      "4. 感到眩晕或昏倒", "5. 睡眠不佳"
    ];
    
    questions.forEach((q, idx) => {
      formHTML += `
        <div class="scl-q">
          <div class="scl-q-text">${q}</div>
          <div class="scl-options">
            <label><input type="radio" name="q${idx}" value="1"><span>没有</span></label>
            <label><input type="radio" name="q${idx}" value="2"><span>很轻</span></label>
            <label><input type="radio" name="q${idx}" value="3"><span>中等</span></label>
            <label><input type="radio" name="q${idx}" value="4"><span>偏重</span></label>
            <label><input type="radio" name="q${idx}" value="5"><span>严重</span></label>
          </div>
        </div>
      `;
    });

    formHTML += `<button class="close-overlay-btn" onclick="document.getElementById('global-overlay').innerHTML=''">提交并收起表单</button>`;
    wrapper.innerHTML = formHTML;
    globalOverlay.appendChild(wrapper);

    const aiMsg = document.createElement('div');
    aiMsg.className = 'ai-msg';
    aiMsg.innerText = "这是一份 SCL-90 量表，请在浮层中填写你的真实感受。";
    chatHistory.appendChild(aiMsg);
    chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const userNote = document.createElement('div');
    userNote.className = 'user-note';
    userNote.innerText = text;
    userNote.style.transform = `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)`;
    chatHistory.appendChild(userNote);
    chatInput.value = '';
    chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('oh卡')) {
        sendOHCard();
      } else if (lowerText.includes('表单') || lowerText.includes('scl')) {
        sendSCL90();
      } else {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-msg';
        aiMsg.innerText = "我听到了。把这些思绪留在这张纸上吧，今晚好好休息。";
        chatHistory.appendChild(aiMsg);
        chatPage.scrollTo({ top: chatPage.scrollHeight, behavior: 'smooth' });
      }
    }, 800);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
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

  // 洗牌算法（打乱数组）实现随机播放
  function shufflePlaylist(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  if (playlist.length > 0) {
    shufflePlaylist(playlist);
  }

  let currentTrackIndex = 0;
  let currentHowl = null;
  let isPlaying = false;
  let progressAnimationFrame = null;

  const pPlayBtn = document.getElementById('btn-play');
  const pPrevBtn = document.getElementById('btn-prev');
  const pNextBtn = document.getElementById('btn-next');
  const pControlPanel = document.getElementById('player-control-panel');
  const pInfoBar = document.getElementById('player-info');
  const pBar = document.getElementById('p-bar');
  const trackArtist = document.getElementById('track-artist');
  const trackName = document.getElementById('track-name');
  const volumeSlider = document.getElementById('volumeSlider');
  const autoPlaySwitch = document.getElementById('autoPlaySwitch');

  function loadTrack(index, autoStart = false) {
    currentTrackIndex = index;
    const track = playlist[index];
    trackArtist.innerText = track.artist;
    trackName.innerText = track.name;
    pBar.style.width = '0%';
    
    if (currentHowl) currentHowl.unload();

    currentHowl = new Howl({
      src:[track.src],
      html5: true, 
      autoplay: autoStart,
      volume: volumeSlider.value / 100,
      onplay: function() {
        isPlaying = true;
        updateUI(true);
        requestAnimationFrame(stepProgress);
      },
      onpause: function() {
        isPlaying = false;
        updateUI(false);
      },
      onend: function() {
        if (autoPlaySwitch && autoPlaySwitch.checked) {
          playNext(true); // 播完如果开关开启则自动播放下一首
        } else {
          isPlaying = false;
          updateUI(false);
        }
      },
      onloaderror: function(id, err) {
        console.error("音频加载失败:", err);
      }
    });
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
      let vol = e.target.value / 100;
      Howler.volume(vol); 
    });
  }

  if(fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      root.style.setProperty('--base-font-size', e.target.value + 'px');
    });
  }

  if(turnSpeedSlider) {
    turnSpeedSlider.addEventListener('input', (e) => {
      root.style.setProperty('--turn-speed', e.target.value + 's');
    });
  }

  if(resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      if(fontSizeSlider) fontSizeSlider.value = 15;
      if(volumeSlider) volumeSlider.value = 30;
      if(turnSpeedSlider) turnSpeedSlider.value = 1;
      if (autoPlaySwitch) autoPlaySwitch.checked = true;
      root.style.setProperty('--base-font-size', '15px');
      root.style.setProperty('--turn-speed', '1s');
      Howler.volume(0.3);
    });
  }
}