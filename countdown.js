/* ═══════════════════════════════════════════════════════════════════════
   한정판매 마감 초시계 — 판매 랜딩 맨 위에 붙는다

   2026-09-24 대표님 지시 — 「앞으로 기획전할때(한정판매) 제일 상단에
   초시계같은걸 넣어서 긴박감을 주도록해 며칠남았는지」

   쓰는 법 — 랜딩 페이지 </body> 바로 앞에 한 줄
     <script src="https://ardentor.github.io/iami-link/countdown.js?v=YYYYMMDD" defer></script>

   🔴 마감 시각을 페이지에 적지 않는다 — sales.json 하나가 정본이다.
      이 페이지 주소와 sales.json 의 url 이 같은 회차를 찾아 그 end 로 센다.
      회차를 새로 등록하면(링크허브-판매등록.ps1) 초시계도 저절로 그 회차를 센다.
      다른 주소(신청서 등)에 붙이려면 data-url="그 회차 랜딩 주소" 를 준다.
   🔴 못 찾으면 아무것도 그리지 않는다 — 지어낸 마감으로 재촉하지 않는다.
   🔴 시각은 한국시간이다 (sales.json 에 꼬리 없이 적힌다) — 여기서 +09:00 을 붙여 읽는다.
      링크 허브 index.html 의 kst()·dayGap() 과 같은 규칙이라 허브 「마감 D-n」과 안 어긋난다.
   🔴 글은 담담하게 둔다 (카피라이팅 §3 「긴박함·과대 포장은 쓰지 않는다」).
      긴박감은 줄어드는 숫자가 맡는다 — 「서두르세요」 같은 말을 얹지 않는다.
   🔴 브랜드 핑크는 장식(진행 막대)에만 쓴다 — 글자에 쓰지 않는다 (명암비 2.8:1).
═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var me = document.currentScript;
  function attr(n) { return me ? me.getAttribute(n) : null; }

  var SALES = attr('data-sales') || 'https://ardentor.github.io/iami-link/sales.json';
  var PAGE  = norm(attr('data-url') || location.href);
  var WEEK  = ['일', '월', '화', '수', '목', '금', '토'];
  var DAY   = 86400e3;

  /* 주소 비교용 — 프로토콜·쿼리·해시·index.html 을 떼고, 폴더 주소는 끝 슬래시를 맞춘다 */
  function norm(u) {
    var a;
    try { a = new URL(u, location.href); } catch (e) { return ''; }
    var p = a.pathname.replace(/\/index\.html?$/i, '/');
    if (!/\/$/.test(p) && !/\.[a-z0-9]+$/i.test(p)) p += '/';
    try { p = decodeURI(p); } catch (e) { /* 그대로 둔다 */ }
    return a.host.toLowerCase() + p;
  }

  /* 허브 index.html 의 kst() 와 같다 — 날짜만 주면 그날 0시 */
  function kst(s) {
    if (!s) return null;
    var t = String(s).trim();
    if (t.length === 10) t += 'T00:00';
    var d = new Date(t + ':00+09:00');
    return isNaN(d.getTime()) ? null : d;
  }
  /* 한국시간 달력 날짜 번호 */
  function kday(ms) { return Math.floor((ms + 9 * 3600e3) / DAY); }
  function label(d) {
    var k = new Date(d.getTime() + 9 * 3600e3);
    var hh = k.getUTCHours(), mm = k.getUTCMinutes();
    return (k.getUTCMonth() + 1) + '월 ' + k.getUTCDate() + '일(' + WEEK[k.getUTCDay()] + ') ' +
           pad(hh) + ':' + pad(mm);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }   // 글은 전부 textContent 로 넣는다 — HTML 로 안 넣는다

  /* 이 페이지의 회차 고르기 — 판매 중 > 곧 오픈 > 가장 최근에 끝난 것 */
  function pick(rows, now) {
    var mine = [];
    (rows || []).forEach(function (s) {
      if (!s || !s.url || norm(s.url) !== PAGE) return;
      /* 🔴 public:false 는 「대표님이 아직 공개 말라」 하신 회차다 — 허브·팝업처럼 여기서도 안 띄운다.
            같은 주소를 다음 회차가 이어 쓰므로, 안 거르면 그 회차 이름·시각이 새어 나간다 (아거스 1R) */
      if (s.public === false) return;
      var st = kst(s.start), en = kst(s.end);
      if (!st || !en || en <= st) return;               // 날짜가 깨진 회차는 세지 않는다
      mine.push({ s: s, st: st, en: en });
    });
    var open = mine.filter(function (v) { return now >= v.st && now < v.en; })
                   .sort(function (a, b) { return a.en - b.en; })[0];
    if (open) return open;
    var soon = mine.filter(function (v) { return now < v.st; })
                   .sort(function (a, b) { return a.st - b.st; })[0];
    if (soon) return soon;
    return mine.sort(function (a, b) { return b.en - a.en; })[0] || null;
  }

  /* 2026-09-24 대표님 시안(「직잭 블랙 프라이데이」 화면) — 검은 판 · 큰 숫자 4칸 · 쌍점 · 밑에 DAYS/HRS/MINS/SECS.
     🔴 고정 막대가 아니라 페이지 맨 위 한 덩이다 — 큰 판을 고정하면 폰 화면 절반을 계속 가린다.
     🔴 시안의 빨간 글자는 따르지 않는다 — 우리 색(블루)은 뒷배경 번짐에만, 핑크는 진행 막대에만 쓴다. */
  var CSS =
    '#iami-cd{position:relative;overflow:hidden;color:#fff;text-align:center;' +
      'background:radial-gradient(120% 90% at 50% 0%,rgba(20,86,240,.30) 0%,rgba(20,86,240,0) 60%),#0b0c10;' +
      'font-family:inherit;line-height:1.2;-webkit-font-smoothing:antialiased;' +
      'padding:calc(26px + env(safe-area-inset-top)) 16px 0}' +
    '#iami-cd *{box-sizing:border-box;margin:0;padding:0}' +
    '#iami-cd .cd-r{font-size:13px;font-weight:700;letter-spacing:.08em;color:#9fb6ff;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#iami-cd .cd-cap{font-size:15px;font-weight:600;color:#d7dbe3;margin-top:6px}' +
    '#iami-cd .cd-t{display:flex;justify-content:center;align-items:flex-start;gap:clamp(4px,2vw,14px);margin-top:14px}' +
    '#iami-cd .cd-u{min-width:2.2ch;font-size:clamp(38px,12vw,60px)}' +
    '#iami-cd .cd-u i{display:block;font-style:normal;font-weight:500;letter-spacing:-.02em;' +
      'font-variant-numeric:tabular-nums;line-height:1}' +
    '#iami-cd .cd-u em{display:block;font-style:normal;font-size:12px;font-weight:600;letter-spacing:.06em;' +
      'color:#e6e8ee;margin-top:8px}' +
    '#iami-cd .cd-c{font-size:clamp(26px,8vw,40px);line-height:clamp(38px,12vw,60px);color:#6b7280;font-weight:700}' +
    '#iami-cd .cd-sub{font-size:12.5px;color:#aeb4c0;font-weight:600;margin-top:16px;padding-bottom:20px}' +
    '#iami-cd .cd-bar{height:3px;background:#22252d;margin:0 -16px}' +
    '#iami-cd .cd-bar i{display:block;height:100%;width:0;background:#ea5ec1;transition:width 1s linear}' +
    /* 하루 안 남으면 쌍점이 1초마다 숨 쉰다 — 글자 색은 안 바꾼다 */
    '#iami-cd.cd-hot .cd-c{animation:iamicd 1s steps(1) infinite}' +
    '@keyframes iamicd{50%{opacity:.25}}' +
    '#iami-cd.cd-over .cd-t{display:none}' +
    '#iami-cd.cd-over .cd-cap{font-size:20px;color:#fff}' +
    '@media (prefers-reduced-motion:reduce){#iami-cd.cd-hot .cd-c{animation:none}#iami-cd .cd-bar i{transition:none}}';

  function mount(v, skew) {
    if (document.getElementById('iami-cd')) return;     // 두 번 붙지 않는다
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bar = document.createElement('section');
    bar.id = 'iami-cd';
    bar.setAttribute('role', 'timer');
    bar.innerHTML =
      '<p class="cd-r"></p>' +
      '<p class="cd-cap"></p>' +
      '<div class="cd-t" aria-hidden="true">' +
        '<span class="cd-u"><i></i><em>DAYS</em></span><span class="cd-c">:</span>' +
        '<span class="cd-u"><i></i><em>HRS</em></span><span class="cd-c">:</span>' +
        '<span class="cd-u"><i></i><em>MINS</em></span><span class="cd-c">:</span>' +
        '<span class="cd-u"><i></i><em>SECS</em></span>' +
      '</div>' +
      '<p class="cd-sub"></p>' +
      '<div class="cd-bar"><i></i></div>';
    document.body.insertBefore(bar, document.body.firstChild);   // 페이지 맨 위
    /* 페이지 body 의 바깥 여백(기본 8px 등) 때문에 판 위·옆에 틈이 생긴다 — 그만큼 밖으로 당겨 가장자리에 붙인다 */
    (function () {
      var cs = getComputedStyle(document.body);
      var mt = (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.paddingTop) || 0);
      var ml = (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.paddingLeft) || 0);
      var mr = (parseFloat(cs.marginRight) || 0) + (parseFloat(cs.paddingRight) || 0);
      bar.style.margin = (-mt) + 'px ' + (-mr) + 'px 0 ' + (-ml) + 'px';
    })();

    var tR    = bar.querySelector('.cd-r');
    var cap   = bar.querySelector('.cd-cap');
    var sub   = bar.querySelector('.cd-sub');
    var box   = bar.querySelectorAll('.cd-u i');
    var fill  = bar.querySelector('.cd-bar i');
    var round = v.s.round ? String(v.s.round) : '한정 판매';
    var timer = null, lastAria = '';
    tR.textContent = round;                              // 글은 전부 textContent — HTML 로 안 넣는다

    function draw() {
      var now = Date.now() + skew;
      var before = now < v.st.getTime();
      var target = before ? v.st.getTime() : v.en.getTime();
      var left = target - now;

      if (!before && left <= 0) {                      // 끝났다
        bar.className = 'cd-over';
        cap.textContent = '판매가 마감되었습니다';
        sub.textContent = label(v.en) + ' 마감';
        fill.style.width = '100%';
        bar.setAttribute('aria-label', round + ' 판매가 마감되었습니다');
        if (timer) { clearTimeout(timer); timer = null; }
        return false;
      }
      if (before && left <= 0) { left = 0; }

      var s = Math.floor(left / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600);  s -= h * 3600;
      var m = Math.floor(s / 60);    s -= m * 60;

      box[0].textContent = pad(d);                     // 100일 넘으면 세 자리 그대로
      box[1].textContent = pad(h);
      box[2].textContent = pad(m);
      box[3].textContent = pad(s);

      bar.className = (!before && left < DAY) ? 'cd-hot' : '';
      if (before) {
        cap.textContent = '오픈까지 남은 시간';
        sub.textContent = label(v.st) + ' 오픈';
        fill.style.width = '0';
      } else {
        cap.textContent = kday(now) === kday(v.en.getTime() - 1) ? '오늘 마감 · 남은 시간' : '마감까지 남은 시간';
        sub.textContent = label(v.en) + ' 마감';
        var span = v.en - v.st;
        fill.style.width = Math.max(0, Math.min(100, (now - v.st.getTime()) / span * 100)).toFixed(2) + '%';
      }

      /* 읽어 주는 기기에는 1초마다가 아니라 분이 바뀔 때만 새로 알린다 */
      var aria = round + ' ' + cap.textContent + ' ' + (d > 0 ? d + '일 ' : '') + h + '시간 ' + m + '분';
      if (aria !== lastAria) { bar.setAttribute('aria-label', aria + ' · ' + sub.textContent); lastAria = aria; }
      return true;
    }

    function tick() {
      if (!draw()) return;
      var now = Date.now() + skew;
      timer = setTimeout(tick, 1000 - (now % 1000) + 5);   // 초가 바뀌는 순간에 맞춘다
    }
    tick();
    /* 폰이 잠들었다 깨면 타이머가 밀려 있다 — 돌아오면 바로 다시 센다 */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && bar.className !== 'cd-over') {
        if (timer) clearTimeout(timer);
        tick();
      }
    });
  }

  function start() {
    fetch(SALES + (SALES.indexOf('?') < 0 ? '?' : '&') + 'v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('sales.json ' + r.status);
        /* 폰 시계가 1분 넘게 틀렸으면 서버 시각으로 맞춘다 (같은 출처일 때만 Date 머리가 보인다) */
        var skew = 0, hd = r.headers.get('Date'), t = hd ? Date.parse(hd) : NaN;
        if (!isNaN(t) && Math.abs(t - Date.now()) > 60e3) skew = t - Date.now();
        return r.json().then(function (j) { return { j: j, skew: skew }; });
      })
      .then(function (x) {
        var v = pick(x.j && x.j.sales, Date.now() + x.skew);
        if (!v) { if (window.console) console.info('[초시계] 이 주소의 판매 회차가 sales.json 에 없습니다:', PAGE); return; }
        mount(v, x.skew);
      })
      .catch(function (e) { if (window.console) console.warn('[초시계] 그리지 않음 —', e && e.message); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
