/* CoreWorkPal UI Simulator Application Logic */

// --- Constants & Config ---
const UPDATE_INTERVAL_DEFAULT = 1500;
const UPDATE_INTERVAL_LOWPOWER = 4000;
const BUBBLE_TIMEOUT = 3000;

const PET_STATE_IMAGES = {
  Idle: new URL('./assets/pets/corecat_idle.png', import.meta.url).href,
  IdleBlink: new URL('./assets/pets/corecat_idle_blink.png', import.meta.url).href,
  RepairLight: new URL('./assets/pets/corecat_repair_light.png', import.meta.url).href,
  RepairHeavy: new URL('./assets/pets/corecat_repair_heavy.png', import.meta.url).href,
  TemperatureCheck: new URL('./assets/pets/corecat_temperature_check.png', import.meta.url).href,
  MemoryCrowded: new URL('./assets/pets/corecat_memory_crowded.png', import.meta.url).href,
  DataSorting: new URL('./assets/pets/corecat_data_sorting.png', import.meta.url).href,
  Sleep: new URL('./assets/pets/corecat_sleep.png', import.meta.url).href,
  Celebrate: new URL('./assets/pets/corecat_celebrate.png', import.meta.url).href,
};

const BUBBLE_TEXTS = {
  Idle: [
    "正在全力监控您的工作区...",
    "今天系统状态非常好哦！",
    "悄悄告诉你，攒了不少零件呢。",
    "喵呜~ 今天也要加油工作呀！",
    "工坊运转正常，我守着呢。"
  ],
  RepairLight: [
    "CPU 稍微有点热，我调调风扇。",
    "别急别急，我在做轻度维护。",
    "拿小扳手紧一下这里的螺丝。",
    "系统负荷上升了，看我的！"
  ],
  RepairHeavy: [
    "哇！CPU 占用太高啦，重装芯片！",
    "核心工作台要烧起来啦，快降温！",
    "护目镜戴好了，紧急大修中！",
    "别乱动，核心部件在拆卸维护！"
  ],
  TemperatureCheck: [
    "好热好热！赶紧用温度计测测。",
    "风扇正在全速旋转，散热中！",
    "降温喷雾就绪，温度快降下来~",
    "电脑好像在大脑发热哦。"
  ],
  MemoryCrowded: [
    "内存仓库堆满了，零件快放不下啦！",
    "抱紧我的内存条，不要丢！",
    "太多未整理的缓存包了，挤爆喵！",
    "需要清理一下零件库吗？"
  ],
  DataSorting: [
    "网络传输通道好繁忙，数据整理中...",
    "整理 diagnostic 平板里的系统日志。",
    "好多数据包在飞，像流星雨一样！",
    "认真录入归档档案柜中。"
  ],
  Sleep: [
    "呼…… 呼…… 睡着了喵……",
    "Zzz... 芯片进入休眠模式...",
    "晚安，工坊进入挂机省电模式。",
    "好困，趴着打个小盹吧..."
  ],
  Celebrate: [
    "耶！工坊升级成功！零件更棒了！",
    "太棒啦！核心效率又提升了喵！",
    "好开心！给你变个小火花！",
    "工坊大吉！我们是最默契的伙伴！"
  ]
};

// --- Application State ---
let state = {
  // Stats
  level: 1,
  parts: 280,
  insight: 12,
  efficiency: 1.2,
  stability: 98,
  onlineSeconds: 9300, // 2h 35m

  // Active configurations
  petSize: 100, // percentage (60 to 150)
  petOpacity: 90, // percentage (20 to 100)
  staticMode: false,
  lowPowerMode: false,
  bubbleEnabled: true,
  monitorBarVisible: true,
  monitorBarMode: 'default', // 'micro', 'default', 'expanded'
  petVisible: true,
  isPaused: false, // is pet sleeping / paused

  // Animation temporary locks
  celebrateLock: false,
  nodLock: false,
  isBlinking: false,

  // Hardware Simulation Data
  metrics: {
    cpu: 23,
    gpu: 18,
    ram: 46,
    net: 1.2, // MB/s
    temp: 68, // Celsius
    disk: 62, // percentage
    partsPerMin: 32
  },

  // State spike triggers (for testing purposes)
  spikes: {
    cpu: false,
    gpu: false,
    ram: false,
    net: false,
    temp: false
  }
};

// --- DOM References ---
// Desktop items
const desktopCanvas = document.getElementById('desktop-canvas');
const petContainer = document.getElementById('pet-container');
const petSprite = document.getElementById('pet-sprite');
const petStatusLight = document.getElementById('pet-status-light');
const petSpeechBubble = document.getElementById('pet-speech-bubble');
const petQuickPanel = document.getElementById('pet-quick-panel');
const quickPanelArrow = document.getElementById('quick-panel-arrow');
const monitorBar = document.getElementById('monitor-bar');
const customContextMenu = document.getElementById('custom-context-menu');
const mainWindow = document.getElementById('main-window');
const clockEl = document.getElementById('taskbar-clock');

// Taskbar & shortcut buttons
const shortcutApp = document.getElementById('icon-coreworkpal');
const taskbarAppIcon = document.getElementById('taskbar-icon-app');
const trayAppIcon = document.getElementById('tray-app-icon');
const btnWinClose = document.getElementById('btn-win-close');
const btnWinMin = document.getElementById('btn-win-min');
const btnWinTray = document.getElementById('btn-win-tray');

// Quick Panel inputs & items
const btnQuickSettings = document.getElementById('btn-quick-settings');
const btnQuickClose = document.getElementById('btn-quick-close');
const panelSecondaryMenu = document.getElementById('panel-secondary-menu');
const quickPanelMsg = document.getElementById('quick-panel-msg');
const quickStatusDot = document.getElementById('quick-status-dot');

const quickBtnOpen = document.getElementById('quick-btn-open');
const quickBtnPause = document.getElementById('quick-btn-pause');
const quickBtnMonitor = document.getElementById('quick-btn-monitor');
const quickBtnHide = document.getElementById('quick-btn-hide');

const sliderQuickSize = document.getElementById('quick-slider-size');
const sliderQuickOpacity = document.getElementById('quick-slider-opacity');
const valQuickSize = document.getElementById('quick-val-size');
const valQuickOpacity = document.getElementById('quick-val-opacity');

const toggleQuickStatic = document.getElementById('quick-toggle-static');
const toggleQuickPower = document.getElementById('quick-toggle-power');
const toggleQuickBubble = document.getElementById('quick-toggle-bubble');

// Secondary Quick settings items
const secOpenMain = document.getElementById('sec-open-main');
const secResetPos = document.getElementById('sec-reset-pos');
const secTrayToggle = document.getElementById('sec-tray-toggle');
const secExit = document.getElementById('sec-exit');

// Metric elements
const chipCpuVal = document.getElementById('chip-cpu-val');
const chipCpuBg = document.getElementById('chip-cpu-bg');
const chipRamVal = document.getElementById('chip-ram-val');
const chipRamBg = document.getElementById('chip-ram-bg');
const chipTempVal = document.getElementById('chip-temp-val');
const chipTempBg = document.getElementById('chip-temp-bg');
const quickEfficiency = document.getElementById('quick-efficiency');
const quickStability = document.getElementById('quick-stability');

const barCpuVal = document.getElementById('bar-cpu-val');
const barGpuVal = document.getElementById('bar-gpu-val');
const barRamVal = document.getElementById('bar-ram-val');
const barNetVal = document.getElementById('bar-net-val');
const barTempVal = document.getElementById('bar-temp-val');
const barPartsVal = document.getElementById('bar-parts-val');

// Context Menu items
const menuOpenMain = document.getElementById('menu-open-main');
const menuTogglePanel = document.getElementById('menu-toggle-panel');
const menuTogglePause = document.getElementById('menu-toggle-pause');
const menuToggleBar = document.getElementById('menu-toggle-bar');
const menuToggleStatic = document.getElementById('menu-toggle-static');
const menuHidePet = document.getElementById('menu-hide-pet');
const menuExit = document.getElementById('menu-exit');

// Main Window sidebar navigation
const navDashboard = document.getElementById('nav-dashboard');
const navWorkshop = document.getElementById('nav-workshop');
const navSettings = document.getElementById('nav-settings');
const navAbout = document.getElementById('nav-about');

const pageDashboard = document.getElementById('page-dashboard');
const pageWorkshop = document.getElementById('page-workshop');
const pageSettings = document.getElementById('page-settings');
const pageAbout = document.getElementById('page-about');

// Main Window Header stats
const winLevelVal = document.getElementById('window-level-val');
const winPartsVal = document.getElementById('window-parts-val');
const winInsightVal = document.getElementById('window-insight-val');

// Page 1: Dashboard items
const heroSpeechBubble = document.getElementById('hero-speech-bubble');
const heroPetImg = document.getElementById('hero-pet-img');
const heroStatusTag = document.getElementById('hero-status-tag');
const heroBtnFeed = document.getElementById('hero-btn-feed');
const heroBtnClean = document.getElementById('hero-btn-clean');

const dbCpuVal = document.getElementById('dashboard-cpu-val');
const dbCpuStatus = document.getElementById('dashboard-cpu-status');
const dbCpuBar = document.getElementById('dashboard-cpu-bar');

const dbGpuVal = document.getElementById('dashboard-gpu-val');
const dbGpuStatus = document.getElementById('dashboard-gpu-status');
const dbGpuBar = document.getElementById('dashboard-gpu-bar');

const dbRamVal = document.getElementById('dashboard-ram-val');
const dbRamStatus = document.getElementById('dashboard-ram-status');
const dbRamBar = document.getElementById('dashboard-ram-bar');

const dbNetVal = document.getElementById('dashboard-net-val');
const dbNetStatus = document.getElementById('dashboard-net-status');
const dbNetBar = document.getElementById('dashboard-net-bar');

const dbTempVal = document.getElementById('dashboard-temp-val');
const dbTempStatus = document.getElementById('dashboard-temp-status');
const dbTempBar = document.getElementById('dashboard-temp-bar');

const dbDiskVal = document.getElementById('dashboard-disk-val');
const dbDiskStatus = document.getElementById('dashboard-disk-status');
const dbDiskBar = document.getElementById('dashboard-disk-bar');

const stripParts = document.getElementById('strip-parts');
const stripInsight = document.getElementById('strip-insight');
const stripEfficiency = document.getElementById('strip-efficiency');
const stripStability = document.getElementById('strip-stability');
const stripTime = document.getElementById('strip-time');

// Page 2: Workshop items
const modCpu = document.getElementById('mod-cpu');
const modGpu = document.getElementById('mod-gpu');
const modRam = document.getElementById('mod-ram');
const modNet = document.getElementById('mod-net');
const modTemp = document.getElementById('mod-temp');
const modDisk = document.getElementById('mod-disk');

const modCpuStat = document.getElementById('mod-cpu-stat');
const modGpuStat = document.getElementById('mod-gpu-stat');
const modRamStat = document.getElementById('mod-ram-stat');
const modNetStat = document.getElementById('mod-net-stat');
const modTempStat = document.getElementById('mod-temp-stat');
const modDiskStat = document.getElementById('mod-disk-stat');

const modCpuBar = document.getElementById('mod-cpu-bar');
const modGpuBar = document.getElementById('mod-gpu-bar');
const modRamBar = document.getElementById('mod-ram-bar');
const modNetBar = document.getElementById('mod-net-bar');
const modTempBar = document.getElementById('mod-temp-bar');
const modDiskBar = document.getElementById('mod-disk-bar');

const workshopLevelLabel = document.getElementById('workshop-level-label');
const workshopCostParts = document.getElementById('workshop-cost-parts');
const workshopCostInsight = document.getElementById('workshop-cost-insight');
const btnUpgradeWorkshop = document.getElementById('btn-upgrade-workshop');

// Workshop Detail modal
const moduleDetailModal = document.getElementById('module-detail-modal');
const modalTitleText = document.getElementById('modal-title-text');
const modalIllustImg = document.getElementById('modal-illust-img');
const btnModalClose = document.getElementById('btn-modal-close');
const btnSubUpgrade1 = document.getElementById('btn-sub-upgrade-1');
const btnSubUpgrade2 = document.getElementById('btn-sub-upgrade-2');
const subUpgradeL1 = document.getElementById('sub-upgrade-l1');
const subUpgradeL2 = document.getElementById('sub-upgrade-l2');

// Page 3: Settings items
const btnSettingsPausePet = document.getElementById('btn-settings-pause-pet');
const btnSettingsExitApp = document.getElementById('btn-settings-exit-app');

const sliderSetSize = document.getElementById('set-slider-size');
const sliderSetOpacity = document.getElementById('set-slider-opacity');
const valSetSize = document.getElementById('set-val-size');
const valSetOpacity = document.getElementById('set-val-opacity');

const toggleSetBubble = document.getElementById('set-toggle-bubble');
const toggleSetStatic = document.getElementById('set-toggle-static');
const toggleSetBar = document.getElementById('set-toggle-bar');
const toggleSetCompact = document.getElementById('set-toggle-compact');
const toggleSetOntop = document.getElementById('set-toggle-ontop');
const toggleSetLowpower = document.getElementById('set-toggle-lowpower');
const toggleSetStartup = document.getElementById('set-toggle-startup');
const toggleSetNotification = document.getElementById('set-toggle-notification');

const selectSetPosition = document.getElementById('set-select-position');
const selectSetSound = document.getElementById('set-select-sound');

// Page 4: About items
const linkDoc = document.getElementById('link-doc');
const linkResetAll = document.getElementById('link-reset-all');

// --- Helper Functions ---

// Web Audio API Synthesizer (Zero Dependency retro chimes and cute frequency sweeps)
function playAudioFeedback(type) {
  const soundMode = selectSetSound ? selectSetSound.value : 'soft';
  if (soundMode === 'none') return;
  
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  
  if (type === 'click') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    if (soundMode === 'classic') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else { // 'soft'
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } else if (type === 'upgrade') {
    const now = ctx.currentTime;
    const notes = soundMode === 'classic' ? [523.25, 659.25, 783.99, 1046.50] : [392, 523, 659, 880];
    const typeOsc = soundMode === 'classic' ? 'square' : 'triangle';
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = typeOsc;
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.05, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.22);
    });
  } else if (type === 'meow') {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    
    osc1.frequency.setValueAtTime(700, now);
    osc1.frequency.exponentialRampToValueAtTime(1050, now + 0.06);
    osc1.frequency.linearRampToValueAtTime(800, now + 0.28);
    
    osc2.frequency.setValueAtTime(703, now);
    osc2.frequency.exponentialRampToValueAtTime(1057, now + 0.06);
    osc2.frequency.linearRampToValueAtTime(807, now + 0.28);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(1300, now + 0.08);
    filter.Q.setValueAtTime(1.8, now);
    
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.28);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }
}

// Get current visual height of pet in pixels based on percentage size
function getPetHeight() {
  return 142 * (state.petSize / 100);
}

// Convert seconds to HH:MM format
function formatOnlineTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Random range generator
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// --- Draggable Implementation (Simple & Robust) ---
function makeElementDraggable(elmnt, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const handle = dragHandle || elmnt;

  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    // Exclude button and input clicks from dragging
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.classList.contains('panel-icon-btn')) {
      return;
    }
    
    e = e || window.event;
    e.preventDefault();
    
    // Get mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    // Apply visual drag states
    if (elmnt === petContainer) {
      elmnt.classList.add('dragging');
      // If quick panel is open, close it during drag to avoid detach
      hideQuickPanel();
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // Set the element's new position
    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    // Screen bounds restriction
    const maxLeft = window.innerWidth - elmnt.offsetWidth;
    const maxTop = window.innerHeight - elmnt.offsetHeight - 48; // taskbar offset
    
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";

    // Clear bottom / right parameters to use top/left absolute positioning
    elmnt.style.bottom = 'auto';
    elmnt.style.right = 'auto';
  }

  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;

    if (elmnt === petContainer) {
      elmnt.classList.remove('dragging');
    }
  }
}

// --- Position Quick Panel next to Pet dynamically ---
function alignQuickPanel() {
  if (!state.petVisible) return;
  
  const petRect = petContainer.getBoundingClientRect();
  const panelW = 276;
  const panelH = petQuickPanel.offsetHeight || 318;
  const padding = 12;

  let leftPos = petRect.right + padding;
  let topPos = petRect.top;
  let arrowDir = 'left';

  // Check right boundary overflow
  if (leftPos + panelW > window.innerWidth) {
    leftPos = petRect.left - panelW - padding;
    arrowDir = 'right';
  }

  // Check top boundary overflow
  if (topPos + panelH > window.innerHeight - 48) {
    topPos = window.innerHeight - 48 - panelH - padding;
  }
  topPos = Math.max(10, topPos);

  petQuickPanel.style.left = `${leftPos}px`;
  petQuickPanel.style.top = `${topPos}px`;

  // Draw arrow pointing to pet center vertically
  quickPanelArrow.className = 'panel-arrow';
  if (arrowDir === 'left') {
    quickPanelArrow.classList.add('panel-arrow-left');
    const petCenterOffset = (petRect.height / 2) - 8;
    quickPanelArrow.style.top = `${Math.min(panelH - 20, Math.max(15, petRect.top - topPos + petCenterOffset))}px`;
    quickPanelArrow.style.left = '-8px';
  } else {
    quickPanelArrow.classList.add('panel-arrow-right');
    const petCenterOffset = (petRect.height / 2) - 8;
    quickPanelArrow.style.top = `${Math.min(panelH - 20, Math.max(15, petRect.top - topPos + petCenterOffset))}px`;
    quickPanelArrow.style.left = 'auto';
    quickPanelArrow.style.right = '-8px';
  }
}

function showQuickPanel() {
  if (state.isPaused) return; // Sleeping pets don't open panels
  petQuickPanel.classList.add('show');
  alignQuickPanel();
}

function hideQuickPanel() {
  petQuickPanel.classList.remove('show');
  panelSecondaryMenu.classList.remove('show');
}

// --- Context Menu Management ---
function showContextMenu(x, y) {
  customContextMenu.style.left = `${x}px`;
  customContextMenu.style.top = `${y}px`;
  
  // Guard borders
  const menuW = 190;
  const menuH = 260;
  if (x + menuW > window.innerWidth) {
    customContextMenu.style.left = `${x - menuW}px`;
  }
  if (y + menuH > window.innerHeight - 48) {
    customContextMenu.style.top = `${y - menuH}px`;
  }

  customContextMenu.classList.add('show');
}

function hideContextMenu() {
  customContextMenu.classList.remove('show');
}

// --- Pet State Evaluation Engine ---
function determinePetState() {
  if (state.celebrateLock) return 'Celebrate';
  if (state.isPaused) return 'Sleep';

  const m = state.metrics;
  
  // CPU/GPU heavy maintenance
  if (m.cpu > 80 || m.gpu > 80) return 'RepairHeavy';
  // Hot temps
  if (m.temp > 75) return 'TemperatureCheck';
  // High RAM usage
  if (m.ram > 75) return 'MemoryCrowded';
  // Active net downloading
  if (m.net > 5.0) return 'DataSorting';
  // CPU medium maintenance
  if (m.cpu > 50) return 'RepairLight';
  
  if (state.isBlinking) return 'IdleBlink';
  
  return 'Idle';
}

let lastVisualState = 'Idle';

// Update pet sprite image & status dot based on state
function syncPetVisuals() {
  if (!state.petVisible) {
    petContainer.style.display = 'none';
    return;
  }
  petContainer.style.display = 'flex';

  const petState = determinePetState();
  
  // Trigger alert flash if transition is into a warning state
  if (lastVisualState !== petState) {
    const isWarning = ['RepairLight', 'RepairHeavy', 'TemperatureCheck', 'MemoryCrowded'].includes(petState);
    const wasNormal = ['Idle', 'Sleep', 'IdleBlink'].includes(lastVisualState);
    if (isWarning && wasNormal) {
      triggerAlertFlash();
    }
    lastVisualState = petState;
  }

  const imgPath = PET_STATE_IMAGES[petState];

  // Update images with smooth fading transition to prevent sudden texture pops
  const oldSrc = petSprite.getAttribute('src');
  if (oldSrc !== imgPath) {
    const isBlinkSwitch = (oldSrc && (oldSrc.includes('blink') || imgPath.includes('blink')));
    if (isBlinkSwitch) {
      // Instant switch for blinking to make it look sharp and natural
      petSprite.src = imgPath;
      petSprite.style.opacity = state.petOpacity / 100;
    } else {
      petSprite.style.opacity = '0';
      setTimeout(() => {
        petSprite.src = imgPath;
        petSprite.style.opacity = state.petOpacity / 100;
      }, 150);
    }
  } else {
    petSprite.style.opacity = state.petOpacity / 100;
  }
  heroPetImg.src = imgPath;

  // Update state tags in UI
  let statusText = 'Idle 闲置';
  let badgeClass = 'status-light-blue';
  
  switch(petState) {
    case 'Idle':
      statusText = 'Idle 闲置中';
      badgeClass = 'status-light-blue';
      break;
    case 'RepairLight':
      statusText = 'Repair 微调中';
      badgeClass = 'status-light-orange';
      break;
    case 'RepairHeavy':
      statusText = 'Repair 紧急抢修';
      badgeClass = 'status-light-red';
      break;
    case 'TemperatureCheck':
      statusText = 'Cooling 冷却降温';
      badgeClass = 'status-light-red';
      break;
    case 'MemoryCrowded':
      statusText = 'Storage 零件整理';
      badgeClass = 'status-light-orange';
      break;
    case 'DataSorting':
      statusText = 'Sorting 归档传输';
      badgeClass = 'status-light-blue';
      break;
    case 'Sleep':
      statusText = 'Sleep 睡眠休眠';
      badgeClass = 'status-light-blue';
      break;
    case 'Celebrate':
      statusText = 'Level Up 庆祝';
      badgeClass = 'status-light-blue';
      break;
  }

  heroStatusTag.innerText = statusText;
  
  // Update status light colors
  petStatusLight.className = `status-light-dot ${badgeClass}`;
  quickStatusDot.className = `panel-status-dot`;
  
  if (badgeClass === 'status-light-blue') {
    petStatusLight.style.color = 'var(--color-tech-cyan)';
    petStatusLight.style.backgroundColor = 'var(--color-tech-cyan)';
    quickStatusDot.style.backgroundColor = 'var(--color-tech-cyan)';
    quickStatusDot.style.boxShadow = '0 0 6px var(--color-tech-cyan)';
  } else if (badgeClass === 'status-light-orange') {
    petStatusLight.style.color = 'var(--color-brand-orange)';
    petStatusLight.style.backgroundColor = 'var(--color-brand-orange)';
    quickStatusDot.style.backgroundColor = 'var(--color-brand-orange)';
    quickStatusDot.style.boxShadow = '0 0 6px var(--color-brand-orange)';
  } else {
    petStatusLight.style.color = 'var(--color-danger)';
    petStatusLight.style.backgroundColor = 'var(--color-danger)';
    quickStatusDot.style.backgroundColor = 'var(--color-danger)';
    quickStatusDot.style.boxShadow = '0 0 6px var(--color-danger)';
  }

  // Handle static mode (freeze animation frames)
  if (state.staticMode || state.isPaused) {
    petSprite.classList.remove('pet-breath-animation');
    petStatusLight.classList.remove('pulse-animation');
  } else {
    petSprite.classList.add('pet-breath-animation');
    petStatusLight.classList.add('pulse-animation');
  }

  // Sync Pause Button label
  if (state.isPaused) {
    quickBtnPause.innerText = '唤醒';
    btnSettingsPausePet.innerText = '唤醒 CoreCat';
  } else {
    quickBtnPause.innerText = '暂停';
    btnSettingsPausePet.innerText = '暂停 / 沉睡';
  }

  // Inject dynamic micro-elements
  injectStateEffects(petState);
}

// Dynamically generate and overlay state micro-elements to make the pet feel alive
function injectStateEffects(petState) {
  const container = document.getElementById('pet-effects-container');
  if (!container) return;
  
  // Clear previous elements
  container.innerHTML = '';
  
  // Reset custom wobble animation
  petSprite.classList.remove('pet-wobble-animation');
  if (!state.staticMode && !state.isPaused) {
    if (petState === 'MemoryCrowded') {
      petSprite.classList.remove('pet-breath-animation');
      petSprite.classList.add('pet-wobble-animation');
    } else {
      petSprite.classList.add('pet-breath-animation');
    }
  }

  if (state.staticMode || state.isPaused) return;

  switch(petState) {
    case 'Sleep':
      // Staggered animated floating 'Zzz's
      for (let i = 0; i < 3; i++) {
        const zzz = document.createElement('div');
        zzz.className = 'zzz-particle';
        zzz.innerText = 'Z';
        zzz.style.fontSize = `${9 + i * 2}px`;
        zzz.style.animationDelay = `${i * 0.9}s`;
        container.appendChild(zzz);
      }
      break;
    case 'RepairLight':
      // Floating orange sparks near the wrench
      for (let i = 0; i < 3; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark-particle';
        spark.style.animationDelay = `${i * 0.4}s`;
        spark.style.left = `${randomRange(-5, 5)}px`;
        spark.style.top = `${randomRange(-5, 5)}px`;
        container.appendChild(spark);
      }
      break;
    case 'RepairHeavy':
      // Glowing aura overlay
      const glow = document.createElement('div');
      glow.className = 'heavy-glow';
      container.appendChild(glow);
      break;
    case 'TemperatureCheck':
      // Blue aura and floating cool ice crystals
      const coolGlow = document.createElement('div');
      coolGlow.className = 'cooling-glow';
      container.appendChild(coolGlow);
      
      for (let i = 0; i < 3; i++) {
        const ice = document.createElement('div');
        ice.className = 'ice-particle';
        ice.style.animationDelay = `${i * 0.6}s`;
        container.appendChild(ice);
      }
      break;
    case 'DataSorting':
      // Digital cyan dots streaming vertically
      for (let i = 0; i < 4; i++) {
        const dot = document.createElement('div');
        dot.className = 'data-dot';
        dot.style.animationDelay = `${i * 0.35}s`;
        dot.style.marginLeft = `${randomRange(-12, 12)}px`;
        container.appendChild(dot);
      }
      break;
    case 'Celebrate':
      // Explosive arpeggiated starburst particles
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach((angle, idx) => {
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.innerText = idx % 2 === 0 ? '✦' : '★';
        
        const rad = (angle * Math.PI) / 180;
        const dist = randomRange(45, 80);
        const dx = Math.round(Math.cos(rad) * dist);
        const dy = Math.round(Math.sin(rad) * dist);
        const rot = Math.round(randomRange(-90, 90));
        
        star.style.setProperty('--dx', `${dx}px`);
        star.style.setProperty('--dy', `${dy}px`);
        star.style.setProperty('--rot', `${rot}deg`);
        star.style.animationDelay = `${randomRange(0, 0.15)}s`;
        
        container.appendChild(star);
      });
      break;
  }
}

// Play click nod animation
function playNodAnimation() {
  if (state.nodLock || state.isPaused) return;
  state.nodLock = true;
  petContainer.classList.add('pet-click-nod');
  
  setTimeout(() => {
    petContainer.classList.remove('pet-click-nod');
    state.nodLock = false;
  }, 160);
}

// Triggers Celebrate animation loop for 2.2 seconds
function triggerCelebrate() {
  state.celebrateLock = true;
  syncPetVisuals();
  showSpeechBubble("升级成功！工坊大吉喵！");
  
  setTimeout(() => {
    state.celebrateLock = false;
    syncPetVisuals();
  }, 2200);
}

// Periodically trigger blinking animation during idle state
function startBlinkCycle() {
  function scheduleNextBlink() {
    const delay = randomRange(3000, 7000);
    setTimeout(() => {
      if (!state.isPaused && !state.staticMode && determinePetState() === 'Idle') {
        triggerBlink();
      }
      scheduleNextBlink();
    }, delay);
  }
  scheduleNextBlink();
}

function triggerBlink() {
  state.isBlinking = true;
  syncPetVisuals();
  
  setTimeout(() => {
    state.isBlinking = false;
    syncPetVisuals();
  }, 160);
}

// Flash the L1 status light on critical state transition (240ms duration)
function triggerAlertFlash() {
  petStatusLight.classList.remove('alert-flash-animation');
  // force reflow
  void petStatusLight.offsetWidth;
  petStatusLight.classList.add('alert-flash-animation');
  
  // Clean up class after animation completes
  setTimeout(() => {
    petStatusLight.classList.remove('alert-flash-animation');
  }, 240);
}

// Show temporary speech bubble over pet L1
function showSpeechBubble(message) {
  if (!state.bubbleEnabled || !state.petVisible || state.isPaused) return;

  petSpeechBubble.innerText = message;
  petSpeechBubble.classList.add('show');
  
  setTimeout(() => {
    petSpeechBubble.classList.remove('show');
  }, BUBBLE_TIMEOUT);
}

// Periodically speak based on state
function handleRandomSpeaking() {
  if (!state.bubbleEnabled || state.isPaused || state.celebrateLock) return;
  
  const petState = determinePetState();
  const msgList = BUBBLE_TEXTS[petState] || BUBBLE_TEXTS['Idle'];
  const randomIndex = Math.floor(Math.random() * msgList.length);
  const speechText = msgList[randomIndex];

  showSpeechBubble(speechText);
  
  // Set text inside Quick Panel as well
  quickPanelMsg.innerText = speechText;
  heroSpeechBubble.innerText = speechText;
}

// --- Global UI Values Synchronizer ---
function syncConfigUI() {
  // Size
  valQuickSize.innerText = `${state.petSize}%`;
  valSetSize.innerText = `${state.petSize}%`;
  sliderQuickSize.value = state.petSize;
  sliderSetSize.value = state.petSize;

  const h = getPetHeight();
  petSprite.style.height = `${h}px`;

  // Opacity
  valQuickOpacity.innerText = `${state.petOpacity}%`;
  valSetOpacity.innerText = `${state.petOpacity}%`;
  sliderQuickOpacity.value = state.petOpacity;
  sliderSetOpacity.value = state.petOpacity;
  
  petSprite.style.opacity = state.petOpacity / 100;

  // Toggles active state classes
  if (state.staticMode) {
    toggleQuickStatic.classList.add('active');
    toggleSetStatic.checked = true;
  } else {
    toggleQuickStatic.classList.remove('active');
    toggleSetStatic.checked = false;
  }

  if (state.lowPowerMode) {
    toggleQuickPower.classList.add('active');
    toggleSetLowpower.checked = true;
  } else {
    toggleQuickPower.classList.remove('active');
    toggleSetLowpower.checked = false;
  }

  if (state.bubbleEnabled) {
    toggleQuickBubble.classList.add('active');
    toggleSetBubble.checked = true;
  } else {
    toggleQuickBubble.classList.remove('active');
    toggleSetBubble.checked = false;
  }

  // MonitorBar
  if (state.monitorBarVisible) {
    monitorBar.style.display = 'flex';
    toggleSetBar.checked = true;
    secTrayToggle.innerText = '📊 隐藏监控条';
  } else {
    monitorBar.style.display = 'none';
    toggleSetBar.checked = false;
    secTrayToggle.innerText = '📊 显示监控条';
  }

  // Always on top z-index sync
  if (toggleSetOntop) {
    monitorBar.style.zIndex = toggleSetOntop.checked ? '200' : '45';
  }

  if (state.monitorBarMode === 'compact') {
    monitorBar.className = 'glass-panel compact';
    toggleSetCompact.checked = true;
  } else if (state.monitorBarMode === 'expanded') {
    monitorBar.className = 'glass-panel expanded';
    toggleSetCompact.checked = false;
  } else {
    monitorBar.className = 'glass-panel';
    toggleSetCompact.checked = false;
  }

  // Global level indicator
  winLevelVal.innerText = state.level;
  winPartsVal.innerText = state.parts;
  winInsightVal.innerText = state.insight;
  workshopLevelLabel.innerText = `Level ${state.level}`;

  // Efficiency modifiers
  quickEfficiency.innerText = `高效 (x${state.efficiency.toFixed(1)})`;
  quickStability.innerText = `${state.stability}%`;

  stripParts.innerText = state.parts;
  stripInsight.innerText = state.insight;
  stripEfficiency.innerText = `x${state.efficiency.toFixed(1)}`;
  stripStability.innerText = `${state.stability}%`;

  // Sync Upgrade Panel Cost states
  const nextCostParts = state.level * 150;
  const nextCostInsight = state.level * 5;

  workshopCostParts.innerText = `${nextCostParts} / ${state.parts}`;
  workshopCostInsight.innerText = `${nextCostInsight} / ${state.insight}`;

  if (state.parts >= nextCostParts && state.insight >= nextCostInsight) {
    btnUpgradeWorkshop.classList.remove('disabled');
    btnUpgradeWorkshop.disabled = false;
  } else {
    btnUpgradeWorkshop.classList.add('disabled');
    btnUpgradeWorkshop.disabled = true;
  }

  // Settings screen selections
  selectSetPosition.value = selectSetPosition.value || 'custom';
  selectSetSound.value = selectSetSound.value || 'soft';

  // Toggle startup & notification checkbox values
  toggleSetStartup.checked = state.startupEnabled !== false;
  toggleSetNotification.checked = state.notificationsEnabled !== false;

  syncPetVisuals();
}

// --- Metrics Simulation Loop ---
function fluctuateMetrics() {
  const m = state.metrics;
  
  // Normal random oscillations
  if (!state.spikes.cpu) {
    m.cpu = Math.round(m.cpu + randomRange(-4, 4));
    m.cpu = Math.max(5, Math.min(m.cpu, 75)); // clamp normal
  } else {
    m.cpu = Math.round(m.cpu + randomRange(-2, 2));
    m.cpu = Math.max(85, Math.min(m.cpu, 98)); // clamped spike
  }

  if (!state.spikes.gpu) {
    m.gpu = Math.round(m.gpu + randomRange(-3, 3));
    m.gpu = Math.max(2, Math.min(m.gpu, 70));
  } else {
    m.gpu = Math.round(m.gpu + randomRange(-2, 2));
    m.gpu = Math.max(80, Math.min(m.gpu, 95));
  }

  if (!state.spikes.ram) {
    m.ram = Math.round(m.ram + randomRange(-1, 1.5));
    m.ram = Math.max(30, Math.min(m.ram, 74));
  } else {
    m.ram = Math.round(m.ram + randomRange(-1, 1));
    m.ram = Math.max(80, Math.min(m.ram, 92));
  }

  if (!state.spikes.temp) {
    m.temp = Math.round(m.temp + randomRange(-1.5, 1.5));
    m.temp = Math.max(45, Math.min(m.temp, 74));
  } else {
    m.temp = Math.round(m.temp + randomRange(-0.5, 1));
    m.temp = Math.max(78, Math.min(m.temp, 88));
  }

  if (!state.spikes.net) {
    m.net = parseFloat((m.net + randomRange(-0.4, 0.4)).toFixed(1));
    m.net = Math.max(0.1, Math.min(m.net, 4.8));
  } else {
    m.net = parseFloat((m.net + randomRange(-0.5, 0.8)).toFixed(1));
    m.net = Math.max(6.2, Math.min(m.net, 14.5));
  }

  // Disk normal fluctuations
  m.disk = Math.max(40, Math.min(65, Math.round(m.disk + randomRange(-0.2, 0.2))));

  // Update stability based on CPU and Temperature loads
  let targetStability = 98;
  if (m.cpu > 80) targetStability -= 8;
  if (m.temp > 75) targetStability -= 12;
  state.stability = Math.max(60, targetStability + Math.round(randomRange(-2, 2)));

  // Parts production accumulation: parts grow proportional to core metrics & level
  if (!state.isPaused) {
    const increment = Math.round((m.cpu * 0.1 + state.level * 2) * state.efficiency);
    state.parts += increment;
    
    // Low chance to produce an insight dot
    if (Math.random() < 0.12) {
      state.insight += 1;
    }
  }

  // Refresh output texts
  syncMetricsUI();
}

function syncMetricsUI() {
  const m = state.metrics;

  // L2 Quick chips
  chipCpuVal.innerText = `${m.cpu}%`;
  chipCpuBg.style.width = `${m.cpu}%`;
  chipRamVal.innerText = `${m.ram}%`;
  chipRamBg.style.width = `${m.ram}%`;
  chipTempVal.innerText = `${m.temp}℃`;
  chipTempBg.style.width = `${m.temp}%`;

  if (m.cpu > 80) {
    chipCpuBg.style.backgroundColor = 'var(--color-danger)';
  } else if (m.cpu > 50) {
    chipCpuBg.style.backgroundColor = 'var(--color-brand-orange)';
  } else {
    chipCpuBg.style.backgroundColor = 'var(--color-tech-cyan)';
  }

  if (m.ram > 75) {
    chipRamBg.style.backgroundColor = 'var(--color-brand-orange)';
  } else {
    chipRamBg.style.backgroundColor = 'var(--color-tech-cyan)';
  }

  if (m.temp > 75) {
    chipTempBg.style.backgroundColor = 'var(--color-danger)';
  } else {
    chipTempBg.style.backgroundColor = 'var(--color-brand-orange)';
  }

  // L1 MonitorBar values
  barCpuVal.innerText = `${m.cpu}%`;
  barGpuVal.innerText = `${m.gpu}%`;
  barRamVal.innerText = `${m.ram}%`;
  barNetVal.innerText = `↓${m.net}M`;
  barTempVal.innerText = `${m.temp}℃`;
  barPartsVal.innerText = `+${Math.round((m.cpu * 0.1 + state.level * 2) * state.efficiency)}/m`;

  barCpuVal.style.color = m.cpu > 80 ? 'var(--color-danger)' : (m.cpu > 50 ? 'var(--color-brand-orange)' : 'var(--color-tech-cyan)');
  barTempVal.style.color = m.temp > 75 ? 'var(--color-danger)' : 'var(--color-brand-orange-strong)';

  // Page 1: Dashboard UI Sync
  dbCpuVal.innerText = `${m.cpu}%`;
  dbCpuBar.style.width = `${m.cpu}%`;
  dbCpuStatus.innerText = m.cpu > 80 ? '负荷' : (m.cpu > 50 ? '温热' : '稳定');
  dbCpuStatus.className = `card-badge ${m.cpu > 80 ? 'badge-danger' : (m.cpu > 50 ? 'badge-warning' : 'badge-normal')}`;
  if (m.cpu > 80) dbCpuBar.style.backgroundColor = 'var(--color-danger)';
  else if (m.cpu > 50) dbCpuBar.style.backgroundColor = 'var(--color-brand-orange)';
  else dbCpuBar.style.backgroundColor = 'var(--color-tech-cyan)';

  dbGpuVal.innerText = `${m.gpu}%`;
  dbGpuBar.style.width = `${m.gpu}%`;
  dbGpuStatus.innerText = m.gpu > 80 ? '饱满' : '正常';
  dbGpuStatus.className = `card-badge ${m.gpu > 80 ? 'badge-danger' : 'badge-normal'}`;

  dbRamVal.innerText = `${m.ram}%`;
  dbRamBar.style.width = `${m.ram}%`;
  dbRamStatus.innerText = m.ram > 75 ? '拥挤' : '正常';
  dbRamStatus.className = `card-badge ${m.ram > 75 ? 'badge-warning' : 'badge-normal'}`;

  dbNetVal.innerText = `${m.net} MB/s`;
  dbNetBar.style.width = `${Math.min(100, Math.round((m.net / 15) * 100))}%`;
  dbNetStatus.innerText = m.net > 5.0 ? '繁忙' : '畅通';
  dbNetStatus.className = `card-badge ${m.net > 5.0 ? 'badge-warning' : 'badge-normal'}`;

  dbTempVal.innerText = `${m.temp}℃`;
  dbTempBar.style.width = `${m.temp}%`;
  dbTempStatus.innerText = m.temp > 75 ? '高温' : '安全';
  dbTempStatus.className = `card-badge ${m.temp > 75 ? 'badge-danger' : 'badge-normal'}`;

  dbDiskVal.innerText = `${m.disk}%`;
  dbDiskBar.style.width = `${m.disk}%`;

  // Page 2: Workshop UI Sync
  modCpuStat.innerText = `负荷: ${m.cpu}%`;
  modCpuBar.style.width = `${m.cpu}%`;
  
  modGpuStat.innerText = `负荷: ${m.gpu}%`;
  modGpuBar.style.width = `${m.gpu}%`;
  
  modRamStat.innerText = `占用: ${m.ram}%`;
  modRamBar.style.width = `${m.ram}%`;
  
  modNetStat.innerText = `流量: ${m.net}MB/s`;
  modNetBar.style.width = `${Math.min(100, Math.round((m.net / 15) * 100))}%`;
  
  modTempStat.innerText = `温度: ${m.temp}℃`;
  modTempBar.style.width = `${m.temp}%`;
  if (m.temp > 75) modTempBar.style.backgroundColor = 'var(--color-danger)';
  else modTempBar.style.backgroundColor = 'var(--color-brand-orange)';

  modDiskStat.innerText = `归档: ${m.disk}%`;
  modDiskBar.style.width = `${m.disk}%`;

  // Global header level stats
  winPartsVal.innerText = state.parts;
  winInsightVal.innerText = state.insight;

  const nextCostParts = state.level * 150;
  const nextCostInsight = state.level * 5;
  workshopCostParts.innerText = `${nextCostParts} / ${state.parts}`;
  workshopCostInsight.innerText = `${nextCostInsight} / ${state.insight}`;

  if (state.parts >= nextCostParts && state.insight >= nextCostInsight) {
    btnUpgradeWorkshop.classList.remove('disabled');
    btnUpgradeWorkshop.disabled = false;
  } else {
    btnUpgradeWorkshop.classList.add('disabled');
    btnUpgradeWorkshop.disabled = true;
  }

  // Output strip metrics
  stripParts.innerText = state.parts;
  stripInsight.innerText = state.insight;
  stripStability.innerText = `${state.stability}%`;

  // State evaluation
  syncPetVisuals();
  
  // Real-time panel offset sync if visible
  if (petQuickPanel.classList.contains('show')) {
    alignQuickPanel();
  }
}

// --- Sim spikes for testing state changes (Triggers on card click) ---
function setupMetricCardSpikeTriggers() {
  const setupSpike = (cardEl, metricKey) => {
    cardEl.addEventListener('click', () => {
      if (state.isPaused) return;
      state.spikes[metricKey] = true;
      state.metrics[metricKey] = metricKey === 'net' ? 12.8 : 92; // Immediate spike
      syncMetricsUI();
      showSpeechBubble(`${metricKey.toUpperCase()} 发生异常大负载！开始诊断修复！`);
      
      // Auto restore after 6 seconds
      setTimeout(() => {
        state.spikes[metricKey] = false;
        showSpeechBubble(`${metricKey.toUpperCase()} 修复工作已完成，负荷降低。`);
      }, 6000);
    });
  };

  setupSpike(document.getElementById('card-cpu'), 'cpu');
  setupSpike(document.getElementById('card-gpu'), 'gpu');
  setupSpike(document.getElementById('card-ram'), 'ram');
  setupSpike(document.getElementById('card-net'), 'net');
  setupSpike(document.getElementById('card-temp'), 'temp');
}

// --- Main Window Tabs Switcher ---
function switchTab(activeTabId, activePageEl) {
  // Clear active classes from nav items
  [navDashboard, navWorkshop, navSettings, navAbout].forEach(item => {
    item.classList.remove('active');
  });

  // Clear active classes from pages
  [pageDashboard, pageWorkshop, pageSettings, pageAbout].forEach(page => {
    page.classList.remove('active');
  });

  // Set active on targets
  document.getElementById(activeTabId).classList.add('active');
  activePageEl.classList.add('active');
}

// --- Workshop Sub-Upgrade Details Popup ---
let activeModuleKey = '';
const subUpgrades = {
  cpu: { l1: 1, l2: 1, name: '核心工作台' },
  gpu: { l1: 1, l2: 1, name: '图形渲染平台' },
  ram: { l1: 1, l2: 1, name: '零件仓库' },
  net: { l1: 1, l2: 1, name: '数据传输站' },
  temp: { l1: 1, l2: 1, name: '冷却风扇墙' },
  disk: { l1: 1, l2: 1, name: '数据归档柜' }
};

function openModuleDetails(moduleKey) {
  activeModuleKey = moduleKey;
  const data = subUpgrades[moduleKey];
  
  modalTitleText.innerText = data.name;
  subUpgradeL1.innerText = `零件强化: LV.${data.l1} → LV.${data.l1 + 1}`;
  subUpgradeL2.innerText = `工艺优化: LV.${data.l2} → LV.${data.l2 + 1}`;

  btnSubUpgrade1.innerText = `升级 (🔧${data.l1 * 50})`;
  btnSubUpgrade2.innerText = `升级 (🔧${data.l2 * 80})`;

  // Set image source based on key
  modalIllustImg.src = `./assets/modules/module_${moduleKey === 'cpu' ? 'cpu_core_workbench' : (moduleKey === 'ram' ? 'ram_parts_warehouse' : (moduleKey === 'net' ? 'net_transfer_station' : (moduleKey === 'temp' ? 'temp_cooling_wall' : (moduleKey === 'disk' ? 'disk_archive_cabinet' : 'gpu_graphic_bench'))))}.png`;

  moduleDetailModal.classList.add('show');
}

function closeModuleDetails() {
  moduleDetailModal.classList.remove('show');
}

// --- Time / Clock simulation ---
function updateClock() {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
  clockEl.innerHTML = `${timeStr}<br>${dateStr}`;
}

// --- App Event Handlers Setup ---
function initializeEventHandlers() {
  // Double click pet to open main window
  petContainer.addEventListener('dblclick', () => {
    if (state.isPaused) return;
    openMainWindow();
    playAudioFeedback('upgrade');
  });

  // Single click pet nod and toggle L2
  petContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('speech-bubble')) return;
    if (petContainer.classList.contains('dragging')) return;
    
    playNodAnimation();
    if (petQuickPanel.classList.contains('show')) {
      hideQuickPanel();
      playAudioFeedback('click');
    } else {
      showQuickPanel();
      playAudioFeedback('meow');
    }
  });

  // Close Quick Panel
  btnQuickClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hideQuickPanel();
    playAudioFeedback('click');
  });

  // Open secondary settings dropdown
  btnQuickSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    panelSecondaryMenu.classList.toggle('show');
    playAudioFeedback('click');
  });

  // Action buttons L2
  quickBtnOpen.addEventListener('click', () => {
    openMainWindow();
    hideQuickPanel();
    playAudioFeedback('click');
  });

  quickBtnPause.addEventListener('click', () => {
    togglePauseState();
    playAudioFeedback('click');
  });

  quickBtnMonitor.addEventListener('click', () => {
    toggleMonitorBar();
    playAudioFeedback('click');
  });

  quickBtnHide.addEventListener('click', () => {
    hidePetState();
    hideQuickPanel();
    playAudioFeedback('click');
  });

  // Quick settings sliders sync
  sliderQuickSize.addEventListener('change', () => {
    playAudioFeedback('click');
  });
  sliderQuickSize.addEventListener('input', (e) => {
    state.petSize = parseInt(e.target.value);
    syncConfigUI();
  });

  sliderQuickOpacity.addEventListener('change', () => {
    playAudioFeedback('click');
  });
  sliderQuickOpacity.addEventListener('input', (e) => {
    state.petOpacity = parseInt(e.target.value);
    syncConfigUI();
  });

  // Quick settings toggles
  toggleQuickStatic.addEventListener('click', () => {
    state.staticMode = !state.staticMode;
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleQuickPower.addEventListener('click', () => {
    toggleLowPowerMode();
    playAudioFeedback('click');
  });

  toggleQuickBubble.addEventListener('click', () => {
    state.bubbleEnabled = !state.bubbleEnabled;
    syncConfigUI();
    playAudioFeedback('click');
  });

  // Secondary Cog settings clicks
  secOpenMain.addEventListener('click', () => {
    openMainWindow();
    hideQuickPanel();
    playAudioFeedback('click');
  });

  secResetPos.addEventListener('click', () => {
    petContainer.style.bottom = '100px';
    petContainer.style.right = '100px';
    petContainer.style.top = 'auto';
    petContainer.style.left = 'auto';
    
    monitorBar.style.top = '40px';
    monitorBar.style.left = '50%';
    monitorBar.style.transform = 'translateX(-50%)';
    
    hideQuickPanel();
    showSpeechBubble("位置已重置喵！");
    playAudioFeedback('upgrade');
  });

  secTrayToggle.addEventListener('click', () => {
    toggleMonitorBar();
    panelSecondaryMenu.classList.remove('show');
    playAudioFeedback('click');
  });

  secExit.addEventListener('click', () => {
    exitApplication();
  });

  // MonitorBar modes (Micro -> Default -> Expanded)
  monitorBar.addEventListener('dblclick', () => {
    if (state.monitorBarMode === 'default') {
      state.monitorBarMode = 'expanded';
    } else if (state.monitorBarMode === 'expanded') {
      state.monitorBarMode = 'compact';
    } else {
      state.monitorBarMode = 'default';
    }
    syncConfigUI();
    playAudioFeedback('upgrade');
  });



  // Desktop Icons Selection
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopIcons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      playAudioFeedback('click');
    });
  });

  // Desktop Background Click to Deselect Icons & Close Quick Panel
  desktopCanvas.addEventListener('click', (e) => {
    if (e.target.id === 'desktop-canvas' || e.target.id === 'desktop-grid' || e.target.classList.contains('blueprint-circle')) {
      desktopIcons.forEach(i => i.classList.remove('selected'));
      hideQuickPanel();
    }
  });

  // Desktop Shortcut Double Clicks
  document.getElementById('icon-coreworkpal').addEventListener('dblclick', (e) => {
    e.stopPropagation();
    openMainWindow();
    playAudioFeedback('upgrade');
  });

  document.getElementById('icon-computer').addEventListener('dblclick', (e) => {
    e.stopPropagation();
    showSpeechBubble("正在建立电脑数据链路...");
    playAudioFeedback('click');
  });

  document.getElementById('icon-bin').addEventListener('dblclick', (e) => {
    e.stopPropagation();
    showSpeechBubble("回收站里全都是零件碎屑呢~");
    playAudioFeedback('meow');
  });

  // Custom Context Menu clicks
  menuOpenMain.addEventListener('click', () => {
    openMainWindow();
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuTogglePanel.addEventListener('click', () => {
    showQuickPanel();
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuTogglePause.addEventListener('click', () => {
    togglePauseState();
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuToggleBar.addEventListener('click', () => {
    toggleMonitorBar();
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuToggleStatic.addEventListener('click', () => {
    state.staticMode = !state.staticMode;
    syncConfigUI();
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuHidePet.addEventListener('click', () => {
    if (state.petVisible) {
      hidePetState();
    } else {
      showPetState();
    }
    hideContextMenu();
    playAudioFeedback('click');
  });

  menuExit.addEventListener('click', () => {
    exitApplication();
  });

  // Sidebar navigation switching
  const handleNavClick = (navEl, tabId, pageEl) => {
    navEl.addEventListener('click', () => {
      switchTab(tabId, pageEl);
      playAudioFeedback('click');
    });
  };
  handleNavClick(navDashboard, 'nav-dashboard', pageDashboard);
  handleNavClick(navWorkshop, 'nav-workshop', pageWorkshop);
  handleNavClick(navSettings, 'nav-settings', pageSettings);
  handleNavClick(navAbout, 'nav-about', pageAbout);

  // Main window controls
  btnWinClose.addEventListener('click', () => {
    closeMainWindow();
    playAudioFeedback('click');
  });
  btnWinMin.addEventListener('click', () => {
    closeMainWindow();
    playAudioFeedback('click');
  });
  btnWinTray.addEventListener('click', () => {
    closeMainWindow();
    playAudioFeedback('click');
  });
  taskbarAppIcon.addEventListener('click', () => {
    toggleMainWindow();
    playAudioFeedback('click');
  });
  shortcutApp.addEventListener('click', (e) => {
    // Single click handles selection, double click opens
    e.stopPropagation();
  });

  // Tray icon double click
  trayAppIcon.addEventListener('dblclick', () => {
    openMainWindow();
    playAudioFeedback('upgrade');
  });
  trayAppIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    showContextMenu(window.innerWidth - 210, window.innerHeight - 300);
    playAudioFeedback('click');
  });

  // Spikes on metric cards
  setupMetricCardSpikeTriggers();

  // Dashboard quick actions
  heroBtnFeed.addEventListener('click', () => {
    if (state.isPaused) return;
    triggerCelebrate();
    playAudioFeedback('meow');
  });

  heroBtnClean.addEventListener('click', () => {
    if (state.isPaused) return;
    state.spikes.ram = true;
    state.metrics.ram = 92;
    syncMetricsUI();
    showSpeechBubble("开始整理内存碎片，清理垃圾零件！");
    playAudioFeedback('click');
    
    setTimeout(() => {
      state.spikes.ram = false;
      state.metrics.ram = 38;
      syncMetricsUI();
      triggerCelebrate();
      showSpeechBubble("整理完毕！零件清点入库！");
      playAudioFeedback('meow');
    }, 3500);
  });

  // Workshop Upgrade Button click
  btnUpgradeWorkshop.addEventListener('click', () => {
    const costParts = state.level * 150;
    const costInsight = state.level * 5;

    if (state.parts >= costParts && state.insight >= costInsight) {
      state.parts -= costParts;
      state.insight -= costInsight;
      state.level += 1;
      state.efficiency += 0.1;

      // Celebrate
      triggerCelebrate();
      syncConfigUI();
      playAudioFeedback('upgrade');
    }
  });

  // Module Details opens
  const bindModuleCard = (modEl, key) => {
    modEl.addEventListener('click', () => {
      openModuleDetails(key);
      playAudioFeedback('click');
    });
  };
  bindModuleCard(modCpu, 'cpu');
  bindModuleCard(modGpu, 'gpu');
  bindModuleCard(modRam, 'ram');
  bindModuleCard(modNet, 'net');
  bindModuleCard(modTemp, 'temp');
  bindModuleCard(modDisk, 'disk');

  btnModalClose.addEventListener('click', () => {
    closeModuleDetails();
    playAudioFeedback('click');
  });

  // Modal sub upgrades
  btnSubUpgrade1.addEventListener('click', () => {
    const data = subUpgrades[activeModuleKey];
    const cost = data.l1 * 50;
    if (state.parts >= cost) {
      state.parts -= cost;
      data.l1 += 1;
      state.efficiency += 0.05;
      openModuleDetails(activeModuleKey);
      syncConfigUI();
      triggerCelebrate();
      playAudioFeedback('upgrade');
    } else {
      showSpeechBubble("所需零件不足喵！");
    }
  });

  btnSubUpgrade2.addEventListener('click', () => {
    const data = subUpgrades[activeModuleKey];
    const cost = data.l2 * 80;
    if (state.parts >= cost) {
      state.parts -= cost;
      data.l2 += 1;
      state.efficiency += 0.08;
      openModuleDetails(activeModuleKey);
      syncConfigUI();
      triggerCelebrate();
      playAudioFeedback('upgrade');
    } else {
      showSpeechBubble("所需零件不足喵！");
    }
  });

  // Settings tab binds
  btnSettingsPausePet.addEventListener('click', () => {
    togglePauseState();
    playAudioFeedback('click');
  });
  btnSettingsExitApp.addEventListener('click', () => {
    exitApplication();
  });

  sliderSetSize.addEventListener('change', () => {
    playAudioFeedback('click');
  });
  sliderSetSize.addEventListener('input', (e) => {
    state.petSize = parseInt(e.target.value);
    syncConfigUI();
  });

  sliderSetOpacity.addEventListener('change', () => {
    playAudioFeedback('click');
  });
  sliderSetOpacity.addEventListener('input', (e) => {
    state.petOpacity = parseInt(e.target.value);
    syncConfigUI();
  });

  toggleSetBubble.addEventListener('change', (e) => {
    state.bubbleEnabled = e.target.checked;
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleSetStatic.addEventListener('change', (e) => {
    state.staticMode = e.target.checked;
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleSetBar.addEventListener('change', (e) => {
    state.monitorBarVisible = e.target.checked;
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleSetCompact.addEventListener('change', (e) => {
    state.monitorBarMode = e.target.checked ? 'compact' : 'default';
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleSetLowpower.addEventListener('change', (e) => {
    toggleLowPowerMode();
    playAudioFeedback('click');
  });

  toggleSetOntop.addEventListener('change', (e) => {
    syncConfigUI();
    playAudioFeedback('click');
  });

  toggleSetStartup.addEventListener('change', (e) => {
    state.startupEnabled = e.target.checked;
    playAudioFeedback('click');
  });

  toggleSetNotification.addEventListener('change', (e) => {
    state.notificationsEnabled = e.target.checked;
    playAudioFeedback('click');
  });

  // Select boxes settings
  selectSetPosition.addEventListener('change', (e) => {
    const pos = e.target.value;
    playAudioFeedback('click');
    if (pos === 'top') {
      monitorBar.style.top = '10px';
      monitorBar.style.left = '50%';
      monitorBar.style.transform = 'translateX(-50%)';
      monitorBar.style.bottom = 'auto';
    } else if (pos === 'bottom') {
      monitorBar.style.bottom = '60px';
      monitorBar.style.top = 'auto';
      monitorBar.style.left = '50%';
      monitorBar.style.transform = 'translateX(-50%)';
    }
  });

  selectSetSound.addEventListener('change', () => {
    playAudioFeedback('upgrade');
  });

  // About resets
  linkResetAll.addEventListener('click', (e) => {
    e.preventDefault();
    state.level = 1;
    state.parts = 280;
    state.insight = 12;
    state.efficiency = 1.2;
    subUpgrades.cpu.l1 = 1; subUpgrades.cpu.l2 = 1;
    subUpgrades.gpu.l1 = 1; subUpgrades.gpu.l2 = 1;
    subUpgrades.ram.l1 = 1; subUpgrades.ram.l2 = 1;
    subUpgrades.net.l1 = 1; subUpgrades.net.l2 = 1;
    subUpgrades.temp.l1 = 1; subUpgrades.temp.l2 = 1;
    subUpgrades.disk.l1 = 1; subUpgrades.disk.l2 = 1;
    
    syncConfigUI();
    showSpeechBubble("工坊配置数据已恢复出厂设置喵！");
    playAudioFeedback('upgrade');
  });

  // Custom Context Menu global listener
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (e.target.closest('#pet-container') || e.target.id === 'desktop-canvas' || e.target.id === 'desktop-grid' || e.target.closest('.blueprint-circle')) {
      showContextMenu(e.clientX, e.clientY);
      playAudioFeedback('click');
    } else {
      hideContextMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#custom-context-menu')) {
      hideContextMenu();
    }
    if (!e.target.closest('#btn-quick-settings') && !e.target.closest('#panel-secondary-menu')) {
      panelSecondaryMenu.classList.remove('show');
    }
  });
}

// --- Toggle Window States ---
function openMainWindow() {
  mainWindow.classList.add('show');
  taskbarAppIcon.classList.add('active');
}

function closeMainWindow() {
  mainWindow.classList.remove('show');
  taskbarAppIcon.classList.remove('active');
}

function toggleMainWindow() {
  if (mainWindow.classList.contains('show')) {
    closeMainWindow();
  } else {
    openMainWindow();
  }
}

function togglePauseState() {
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    hideQuickPanel();
    showSpeechBubble("Zzz... 开始休眠省电啦...");
  } else {
    showSpeechBubble("喵呜！芯片唤醒！继续监控工作区！");
  }
  syncConfigUI();
}

function toggleMonitorBar() {
  state.monitorBarVisible = !state.monitorBarVisible;
  syncConfigUI();
}

function toggleLowPowerMode() {
  state.lowPowerMode = !state.lowPowerMode;
  
  // Re-initialize metrics simulation interval
  clearInterval(metricsIntervalId);
  const interval = state.lowPowerMode ? UPDATE_INTERVAL_LOWPOWER : UPDATE_INTERVAL_DEFAULT;
  metricsIntervalId = setInterval(fluctuateMetrics, interval);
  
  syncConfigUI();
  
  if (state.lowPowerMode) {
    showSpeechBubble("低功耗模式已开启，数据轮询减慢。");
  } else {
    showSpeechBubble("常规性能就绪，系统全速率刷新！");
  }
}

function hidePetState() {
  state.petVisible = false;
  menuHidePet.innerText = "👻 显示桌宠";
  syncConfigUI();
}

function showPetState() {
  state.petVisible = true;
  menuHidePet.innerText = "👻 隐藏桌宠";
  syncConfigUI();
}

function exitApplication() {
  if (confirm("确定要关闭 CoreWorkPal 吗？\n关闭后猫咪将离线，停止生成组装零件。")) {
    document.body.innerHTML = `
      <div style="background: #0B111A; height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #F4F7FB; font-family: sans-serif;">
        <h2 style="color: #F4A641; margin-bottom: 12px;">CoreWorkPal 诊断程序已离线</h2>
        <p style="color: #B9C5D4; font-size: 14px;">猫咪工程师已回窝休息。感谢今天的陪伴！</p>
        <button onclick="window.location.reload()" style="margin-top: 24px; height: 36px; padding: 0 16px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #F4F7FB; cursor: pointer;">重启工坊系统</button>
      </div>
    `;
  }
}

// --- Intervals IDs ---
let metricsIntervalId;
let speakIntervalId;
let timeIntervalId;

// --- Initialize App ---
function init() {
  // Make windows draggable
  makeElementDraggable(petContainer);
  makeElementDraggable(monitorBar);
  makeElementDraggable(mainWindow, document.getElementById('window-titlebar'));

  // Sync initial UI elements
  syncConfigUI();
  updateClock();

  // Start the blinking cycle
  startBlinkCycle();

  // Setup loop intervals
  metricsIntervalId = setInterval(fluctuateMetrics, UPDATE_INTERVAL_DEFAULT);
  
  // Random dialog bubble every 15-20 seconds
  speakIntervalId = setInterval(() => {
    handleRandomSpeaking();
  }, 16000);

  // Time clock update every second
  timeIntervalId = setInterval(updateClock, 1000);

  // Counter timer for online seconds
  setInterval(() => {
    if (!state.isPaused) {
      state.onlineSeconds += 1;
      stripTime.innerText = formatOnlineTime(state.onlineSeconds);
    }
  }, 1000);

  // Setup click triggers
  initializeEventHandlers();

  // Intro message after 1.5 seconds
  setTimeout(() => {
    showSpeechBubble("喵呜！CoreWorkPal 已安全就绪！");
  }, 1500);
}

// Start application
window.onload = init;
