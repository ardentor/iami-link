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

  var CSS =
    '#iami-cd{position:fixed;left:0;right:0;top:0;z-index:1000;' +
      'background:#101318;border-bottom:1px solid #262a33;color:#fff;' +
      'font-family:inherit;line-height:1.25;-webkit-font-smoothing:antialiased;' +
      'padding-top:env(safe-area-inset-top)}' +
    '#iami-cd *{box-sizing:border-box;margin:0;padding:0}' +
    '#iami-cd .cd-in{max-width:560px;margin:0 auto;padding:9px 16px;display:flex;' +
      'align-items:center;justify-content:space-between;gap:12px}' +
    '#iami-cd .cd-lab{min-width:0;flex:1 1 auto}' +
    /* 회차 이름이 길면 이름만 「…」로 접고 「· 마감까지」는 남긴다 (실측 — 통째로 접으면 무슨 시계인지 사라진다) */
    '#iami-cd .cd-lab b{display:flex;font-size:14px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;min-width:0}' +
    '#iami-cd .cd-lab b .cd-r{overflow:hidden;text-overflow:ellipsis;min-width:0}' +
    '#iami-cd .cd-lab b .cd-s{flex:0 0 auto}' +
    '#iami-cd .cd-lab b em{font-style:normal}' +
    '#iami-cd .cd-lab span{display:block;font-size:11.5px;color:#aeb4c0;font-weight:600;margin-top:3px;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#iami-cd .cd-t{display:flex;gap:4px;flex:0 0 auto}' +
    '#iami-cd .cd-u{min-width:36px;text-align:center;background:#1456f0;border-radius:7px;padding:4px 3px 3px}' +
    '#iami-cd .cd-u i{display:block;font-style:normal;font-size:19px;font-weight:800;' +
      'font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1.1}' +
    '#iami-cd .cd-u em{display:block;font-style:normal;font-size:9.5px;font-weight:700;color:#e3ecff;margin-top:1px}' +
    '#iami-cd .cd-u.cd-d{background:#fff;color:#0f1012}' +
    '#iami-cd .cd-u.cd-d em{color:#3a4150}' +
    '#iami-cd .cd-bar{height:3px;background:#262a33}' +
    '#iami-cd .cd-bar i{display:block;height:100%;width:0;background:#ea5ec1;transition:width 1s linear}' +
    '#iami-cd.cd-hot .cd-u{animation:iamicd 1.6s ease-in-out infinite}' +
    '@keyframes iamicd{0%,100%{box-shadow:0 0 0 0 rgba(234,94,193,0)}50%{box-shadow:0 0 0 3px rgba(234,94,193,.55)}}' +
    '#iami-cd.cd-over .cd-t{display:none}' +
    '@media (prefers-reduced-motion:reduce){#iami-cd.cd-hot .cd-u{animation:none}#iami-cd .cd-bar i{transition:none}}' +
    '@media (min-width:600px){#iami-cd .cd-lab b{font-size:15px}#iami-cd .cd-u{min-width:42px}#iami-cd .cd-u i{font-size:21px}}' +
    '.iami-cd-sp{display:block}';

  function mount(v, skew) {
    if (document.getElementById('iami-cd')) return;     // 두 번 붙지 않는다
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var bar = document.createElement('div');
    bar.id = 'iami-cd';
    bar.setAttribute('role', 'timer');
    bar.innerHTML =
      '<div class="cd-in">' +
        '<div class="cd-lab"><b><em class="cd-r"></em><em class="cd-s"></em></b><span></span></div>' +
        '<div class="cd-t" aria-hidden="true">' +
          '<span class="cd-u cd-d"><i></i><em>일</em></span>' +
          '<span class="cd-u"><i></i><em>시간</em></span>' +
          '<span class="cd-u"><i></i><em>분</em></span>' +
          '<span class="cd-u"><i></i><em>초</em></span>' +
        '</div>' +
      '</div>' +
      '<div class="cd-bar"><i></i></div>';

    /* 고정 막대가 본문 첫 줄을 덮지 않게 같은 높이의 빈 칸을 맨 앞에 둔다 */
    var sp = document.createElement('div');
    sp.className = 'iami-cd-sp';
    sp.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(sp, document.body.firstChild);
    document.body.appendChild(bar);

    function fit() { sp.style.height = bar.offsetHeight + 'px'; }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(bar);
    else window.addEventListener('resize', fit);

    var title = bar.querySelector('.cd-lab b');
    var tR    = title.querySelector('.cd-r');
    var tS    = title.querySelector('.cd-s');
    var sub   = bar.querySelector('.cd-lab > span');
    function say(r, s) { tR.textContent = r; tS.textContent = s; }
    var box   = bar.querySelectorAll('.cd-u i');
    var dBox  = bar.querySelector('.cd-u.cd-d');
    var fill  = bar.querySelector('.cd-bar i');
    var round = v.s.round ? String(v.s.round) : '한정 판매';
    var timer = null, lastAria = '';

    function draw() {
      var now = Date.now() + skew;
      var before = now < v.st.getTime();
      var target = before ? v.st.getTime() : v.en.getTime();
      var left = target - now;

      /* 🔴 부제에 회차 이름까지 넣으면 360px 에서 날짜가 「…」로 잘린다 (실측) — 회차는 제목 줄로 올린다 */
      if (!before && left <= 0) {                      // 끝났다
        bar.className = 'cd-over';
        say('판매가 마감되었습니다', '');
        sub.textContent = round + ' · ' + label(v.en);
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

      box[0].textContent = d;
      box[1].textContent = pad(h);
      box[2].textContent = pad(m);
      box[3].textContent = pad(s);
      dBox.style.display = d > 0 ? '' : 'none';

      var hot = !before && left < DAY;
      bar.className = hot ? 'cd-hot' : '';
      if (before) {
        say(round, '\u00a0· 오픈까지');
        sub.textContent = label(v.st) + ' 오픈';
        fill.style.width = '0';
      } else {
        say(round, kday(now) === kday(v.en.getTime() - 1) ? '\u00a0· 오늘 마감' : '\u00a0· 마감까지');
        sub.textContent = label(v.en) + ' 마감';
        var span = v.en - v.st;
        fill.style.width = Math.max(0, Math.min(100, (now - v.st.getTime()) / span * 100)).toFixed(2) + '%';
      }

      /* 읽어 주는 기기에는 1초마다가 아니라 분이 바뀔 때만 새로 알린다 */
      var aria = title.textContent + ' ' + (d > 0 ? d + '일 ' : '') + h + '시간 ' + m + '분';
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
