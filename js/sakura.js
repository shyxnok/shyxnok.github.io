/**
 * 主题内置 Canvas 樱花特效
 * 存放位置：主题/scripts/sakura-canvas.js
 * 配置位置：主题/_config.yml
 * 配置项：
 *   enable: true             // 默认开启演示
 *   switchable: true         // 是否可切换
 *   sakuraNum: 15            // 樱花数量：21
 *   limitTimes: -1           // 越界限制次数：-1（无限循环）
 *   size: { min: 1, max: 2 } // 樱花大小范围
 *   opacity: { min: 0.1, max: 0.9 } // 樱花透明度范围
 *   speed: {
 *     horizontal: { min: -1.7, max: -1.2 } // 樱花水平速度范围
 *     vertical: { min: 1.5, max: 2.2 } // 樱花垂直速度范围
 *     rotation: 0.01 // 樱花旋转速度
 *     fadeSpeed: 0.01 // 樱花消失/渐隐速度
 *   }
 *   zIndex: 100 // 樱花 Z-index 层级
 *  项目参考：https://github.com/CuteLeaf/Firefly
 */
// 合并默认配置 + 主题配置
const defaultConfig = {
  enable: true,
  switchable: true,
  sakuraNum: 10,
  limitTimes: -1,
  size: { min: 1, max: 1.5 },
  opacity: { min: 0.1, max: 0.9 },
  speed: {
    horizontal: { min: -1.7, max: -1.2 },
    vertical: { min: 0.3, max: 0.9 },
    rotation: 0.01,
    fadeSpeed: 0.01
  },
  zIndex: 100
};

// 读取布局输出的全局配置，合并覆盖
const sakuraConfig = Object.assign({}, defaultConfig, window.config.sakura || {});

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

class Sakura {
  constructor(x, y, s, r, a, fn, idx, img, limitArray, config) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = r;
    this.a = a;
    this.fn = fn;
    this.idx = idx;
    this.img = img;
    this.limitArray = limitArray;
    this.config = config;
  }

  draw(cxt) {
    cxt.save();
    cxt.translate(this.x, this.y);
    cxt.rotate(this.r);
    cxt.globalAlpha = this.a;
    cxt.drawImage(this.img, 0, 0, 30 * this.s, 30 * this.s);
    cxt.restore();
  }

  update() {
    this.x = this.fn.x(this.x, this.y);
    this.y = this.fn.y(this.y, this.y);
    this.r = this.fn.r(this.r);
    this.a = this.fn.a(this.a);

    if (
      this.x > windowWidth ||
      this.x < -40 ||
      this.y > windowHeight ||
      this.a <= 0
    ) {
      if (this.limitArray[this.idx] === -1) {
        this.resetPosition();
      } else {
        if (this.limitArray[this.idx] > 0) {
          this.resetPosition();
          this.limitArray[this.idx]--;
        }
      }
    }
  }

  resetPosition() {
    this.r = getRandom('fnr', this.config);
    if (Math.random() > 0.4) {
      this.x = getRandom('x', this.config);
      this.y = -30;
      this.s = getRandom('s', this.config);
      this.r = getRandom('r', this.config);
      this.a = getRandom('a', this.config);
    } else {
      this.x = windowWidth + 10;
      this.y = getRandom('y', this.config) * 0.6;
      this.s = getRandom('s', this.config);
      this.r = getRandom('r', this.config);
      this.a = getRandom('a', this.config);
    }
  }
}

class SakuraList {
  constructor() {
    this.list = [];
  }
  push(sakura) { this.list.push(sakura); }
  update() {
    for (let i = 0, len = this.list.length; i < len; i++) {
      this.list[i].update();
    }
  }
  draw(cxt) {
    for (let i = 0, len = this.list.length; i < len; i++) {
      this.list[i].draw(cxt);
    }
  }
  get(i) { return this.list[i]; }
  size() { return this.list.length; }
}

function getRandom(option, config) {
  let ret, random;
  switch (option) {
    case 'x': ret = Math.random() * windowWidth; break;
    case 'y': ret = Math.random() * windowHeight; break;
    case 's': ret = config.size.min + Math.random() * (config.size.max - config.size.min); break;
    case 'r': ret = Math.random() * Math.PI * 2; break;
    case 'a': ret = config.opacity.min + Math.random() * (config.opacity.max - config.opacity.min); break;
    case 'fnx':
      random = config.speed.horizontal.min + Math.random() * (config.speed.horizontal.max - config.speed.horizontal.min);
      ret = (x) => x + random;
      break;
    case 'fny':
      random = config.speed.vertical.min + Math.random() * (config.speed.vertical.max - config.speed.vertical.min);
      ret = (_, y) => y + random;
      break;
    case 'fnr': ret = (r) => r + config.speed.rotation; break;
    case 'fna': ret = (alpha) => alpha - config.speed.fadeSpeed * 0.01; break;
  }
  return ret;
}

class SakuraManager {
  constructor(config) {
    this.config = config;
    this.canvas = null;
    this.ctx = null;
    this.sakuraList = null;
    this.animationId = null;
    this.img = null;
    this.isRunning = false;
  }

  async init() {
    if (!this.config.enable || this.isRunning) return;
    this.img = new Image();
    // 你的花瓣图片路径：站点根目录 /images/sakura.png
    this.img.src = '/images/sakura.png';

    await new Promise(resolve => {
      this.img.onload = resolve;
      this.img.onerror = resolve;
    });

    this.createCanvas();
    this.createSakuraList();
    this.startAnimation();
    this.isRunning = true;
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.height = windowHeight;
    this.canvas.width = windowWidth;
    this.canvas.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:${this.config.zIndex};transform:translateZ(0)`;
    this.canvas.id = 'canvas_sakura';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this._boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this._boundHandleResize);
  }

  createSakuraList() {
    if (!this.img || !this.ctx) return;
    this.sakuraList = new SakuraList();
    const limitArray = new Array(this.config.sakuraNum).fill(this.config.limitTimes);

    for (let i = 0; i < this.config.sakuraNum; i++) {
      const randomX = getRandom('x', this.config);
      const randomY = getRandom('y', this.config);
      const randomS = getRandom('s', this.config);
      const randomR = getRandom('r', this.config);
      const randomA = getRandom('a', this.config);
      const randomFnx = getRandom('fnx', this.config);
      const randomFny = getRandom('fny', this.config);
      const randomFnR = getRandom('fnr', this.config);
      const randomFnA = getRandom('fna', this.config);

      const sakura = new Sakura(
        randomX, randomY, randomS, randomR, randomA,
        { x: randomFnx, y: randomFny, r: randomFnR, a: randomFnA },
        i, this.img, limitArray, this.config
      );
      sakura.draw(this.ctx);
      this.sakuraList.push(sakura);
    }
  }

  startAnimation() {
    if (!this.ctx || !this.canvas || !this.sakuraList) return;
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.sakuraList.update();
      this.sakuraList.draw(this.ctx);
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  handleResize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = windowWidth;
      this.canvas.height = windowHeight;
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
    if (this._boundHandleResize) {
      window.removeEventListener('resize', this._boundHandleResize);
      this._boundHandleResize = null;
    }
    this.isRunning = false;
  }

  toggle() {
    this.isRunning ? this.stop() : this.init();
  }

  updateConfig(newConfig) {
    const wasRunning = this.isRunning;
    if (wasRunning) this.stop();
    this.config = newConfig;
    if (wasRunning && newConfig.enable) this.init();
  }

  getIsRunning() {
    return this.isRunning;
  }
}

// 全局实例
let globalSakuraManager = null;
function initSakura(config) {
  if (globalSakuraManager) {
    globalSakuraManager.updateConfig(config);
  } else {
    globalSakuraManager = new SakuraManager(config);
    window.sakuraManager = globalSakuraManager;
    if (config.enable) globalSakuraManager.init();
  }
}

// 页面初始化执行
(function () {
  if (window.sakuraInitialized) return;
  const storedEnabled = localStorage.getItem("sakuraEnabled");
  const isEnabled = storedEnabled !== null ? storedEnabled === "true" : sakuraConfig.enable;
  const cfg = Object.assign({}, sakuraConfig, { enable: isEnabled });
  initSakura(cfg);
  window.sakuraInitialized = true;
})();