// 展示主题
console.log("%c Theme.Halcyon v" + '1.0.0' + " %c https://github.com/shyxnok/hexo-theme-Halcyon ", "color: white; background: rgb(12, 128, 230); padding:5px 0;", "padding:4px;border:1px solid rgb(12, 128, 230);");

/**
 * Halcyon Theme — main.js
 * Based on Shoka design: nav scroll, dropdowns, background images, theme toggle
 */

(function () {
  'use strict';

  var THEME_KEY = 'halcyon-theme';
  var html = document.documentElement;

  // ===== Theme =====
  function getPreferredTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    var hljsLight = document.getElementById('hljs-light');
    var hljsDark = document.getElementById('hljs-dark');
    if (hljsLight && hljsDark) {
      hljsLight.disabled = theme === 'dark';
      hljsDark.disabled = theme === 'light';
    }
  }

  var currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Theme toggle via .right .item.theme
  var themeBtn = document.querySelector('#nav .right .item.theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      currentTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);

      // Toggle icon class
      var icon = this.querySelector('.ic');
      if (icon) {
        if (currentTheme === 'dark') {
          icon.classList.remove('i-sun');
          icon.classList.add('i-moon');
        } else {
          icon.classList.remove('i-moon');
          icon.classList.add('i-sun');
        }
      }
    });
  }

  // ===== Navigation =====
  var nav = document.getElementById('nav');
  var toggleBtn = document.querySelector('#nav .toggle');
  var menu = document.querySelector('#nav .menu');

  // ---- Scroll: show/hide nav with background ----
  var lastScroll = 0;
  var scrollThreshold = 10;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY || window.pageYOffset;

    // Add background when scrolled past header
    if (nav) {
      nav.classList.toggle('show', scrollY > 50);
    }

    // Hide on scroll down, show on scroll up
    if (Math.abs(scrollY - lastScroll) > scrollThreshold && scrollY > 200) {
      if (nav) {
        nav.classList.toggle('down', scrollY > lastScroll);
        nav.classList.toggle('up', scrollY < lastScroll);
      }
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ---- Mobile hamburger toggle ----
  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', function () {
      var isOpen = toggleBtn.classList.toggle('open');
      nav.classList.toggle('mobile-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on link click
    menu.querySelectorAll('.item:not(.dropdown) > a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleBtn.classList.remove('open');
        if (nav) nav.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Dropdown toggle (click) ----
  document.querySelectorAll('#nav .menu .item.dropdown > a').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var parent = this.parentElement;

      // Close other dropdowns
      document.querySelectorAll('#nav .menu .item.dropdown.open').forEach(function (dd) {
        if (dd !== parent) dd.classList.remove('open');
      });

      parent.classList.toggle('open');
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#nav .menu .item.dropdown')) {
      document.querySelectorAll('#nav .menu .item.dropdown.open').forEach(function (dd) {
        dd.classList.remove('open');
      });
    }
  });

  // ---- Active nav detection ----
  var currentPath = window.location.pathname;
  document.querySelectorAll('#nav .menu .item a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;

    var isActive = (href === '/' && currentPath === '/') ||
                   (href !== '/' && currentPath.startsWith(href));

    if (isActive) {
      link.closest('.item').classList.add('active');
      // If in a dropdown, also mark parent
      var parentDropdown = link.closest('.dropdown');
      if (parentDropdown) parentDropdown.classList.add('active');
    }
  });

})();

// ===== Background Images =====
(function () {
  'use strict';

  var imgs = document.getElementById('imgs');
  if (!imgs) return;

  var items = imgs.querySelectorAll('.item[data-background-image]');
  items.forEach(function (item) {
    var url = item.getAttribute('data-background-image');
    if (url) {
      item.style.backgroundImage = 'url(' + url + ')';
    }
  });
})();

// ===== PJAX animation (brand fade-in) =====
document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('loaded');
});

// ========== 加载动画 ==========
document.addEventListener('DOMContentLoaded', function () {
  var loader = document.getElementById('loading');

  if (!loader) return;

  var isFirstVisit = !localStorage.getItem('visited');

  if (isFirstVisit) {
    loader.style.display = 'flex';

    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('hidden');
        localStorage.setItem('visited', 'true');
      }, 3000);
    });
  } else {
    loader.style.display = 'none';
  }
});

/**
 * 点击烟花粒子特效 - 独立抽离版
 * 依赖: anime.js
 */
const ClickFireworks = (function () {
  const defaultOptions = {
    particleNum: 30,
    colors: [
      "rgba(255,182,185,.9)",
      "rgba(250,227,217,.9)",
      "rgba(187,222,214,.9)",
      "rgba(138,198,209,.9)"
    ],
    circleRadiusMin: 80,
    circleRadiusMax: 160,
    particleRadiusMin: 16,
    particleRadiusMax: 32,
    particleMoveMin: 50,
    particleMoveMax: 180
  };

  let canvasEl, ctx;
  let pointerX = 0;
  let pointerY = 0;
  let tapEvent = "click";
  let options = {};

  function initCanvas() {
    canvasEl = document.createElement("canvas");
    canvasEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999999;
    `;
    document.body.appendChild(canvasEl);
    ctx = canvasEl.getContext("2d");
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize, false);
  }

  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + "px";
    canvasEl.style.height = window.innerHeight + "px";
    ctx.scale(2, 2);
  }

  function updateCoords(e) {
    pointerX = e.clientX || (e.touches && e.touches[0].clientX);
    pointerY = e.clientY || (e.touches && e.touches[0].clientY);
  }

  function setParticuleDirection(p) {
    const angle = anime.random(0, 360) * Math.PI / 180;
    const value = anime.random(options.particleMoveMin, options.particleMoveMax);
    const radius = [-1, 1][anime.random(0, 1)] * value;
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle)
    };
  }

  function createParticule(x, y) {
    const p = {};
    p.x = x;
    p.y = y;
    p.color = options.colors[anime.random(0, options.colors.length - 1)];
    p.radius = anime.random(options.particleRadiusMin, options.particleRadiusMax);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    };
    return p;
  }

  function createCircle(x, y) {
    const p = {};
    p.x = x;
    p.y = y;
    p.color = "#FFF";
    p.radius = 0.1;
    p.alpha = 0.5;
    p.lineWidth = 6;
    p.draw = function () {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    return p;
  }

  function renderParticule(anim) {
    for (let i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }

  function animateParticules(x, y) {
    const circle = createCircle(x, y);
    const particules = [];
    for (let i = 0; i < options.particleNum; i++) {
      particules.push(createParticule(x, y));
    }

    anime.timeline()
      .add({
        targets: particules,
        x: p => p.endPos.x,
        y: p => p.endPos.y,
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule
      })
      .add({
        targets: circle,
        radius: anime.random(options.circleRadiusMin, options.circleRadiusMax),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: "linear",
          duration: anime.random(600, 800)
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule
      }, 0);
  }

  function bindEvent() {
    const render = anime({
      duration: Infinity,
      update: function () {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }
    });

    document.addEventListener(tapEvent, function (e) {
      render.play();
      updateCoords(e);
      animateParticules(pointerX, pointerY);
    }, false);
  }

  function init(customOpts) {
    options = Object.assign({}, defaultOptions, customOpts || {});
    initCanvas();
    bindEvent();
  }

  return {
    init: init,
    fire: function (x, y) {
      animateParticules(x, y);
    }
  };
})();

// ========== 启动特效 ==========
ClickFireworks.init();
