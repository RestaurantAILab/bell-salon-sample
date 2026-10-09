// 提案用の説明レイヤー（Ponさんへの説明用）。サイト本体とは独立していて、
// index.html の <script src="js/notes.js"> を 1 行消せば完全に外れる。
// 吹き出しは「指している中身」の実寸（文字の範囲）を測って、その横・上下に置く。
(function () {
  // ?notes=0 で説明なしの素の状態を表示する（納品前の確認用）
  if (new URLSearchParams(location.search).get("notes") === "0") return;

  // type: "update" = 今回良くした点 / "point" = 共有しておきたい情報
  // at / place は PC、mat / mplace はスマホ（無ければ PC と同じ）。
  // place: below / above / right / below-end / above-end（end = 右端そろえ）
  var NOTES = [
    { type: "update", at: ".hero__cta", place: "below", mplace: "above",
      title: "ページ上部に電話・LINE",
      body: "問い合わせをしやすくするため、最初の画面に電話・LINE のボタンを置き、スクロール中も画面下に表示するようにしました。" },
    { type: "update", at: ".hero .status", place: "right", clearOf: ".hero__cta .btn--line", mat: "#access .status", mplace: "above-end",
      title: "今日の営業状況を自動表示",
      body: "来店前に営業しているか分かるよう、タイ時間で「営業中／定休日」を自動で表示するようにしました（第 2・第 4 木曜の休みにも対応）。" },
    { type: "update", at: ".hero__art", place: "below-end", mat: ".vows li:first-child", mplace: "above-end",
      title: "広告なし・スマホに合わせた表示",
      body: "お店の印象を損なわないよう広告を出さず、スマホでも画面が横にはみ出さないレイアウトにしました。" },
    { type: "point", at: ".manager", place: "below",
      title: "店長の写真・お名前は仮です",
      body: "掲載イメージとして、仮の写真とお名前を入れています。" },
    { type: "point", at: ".signature", place: "above-end",
      title: "メニュー・料金の出典",
      body: "今の公式サイトに掲載されているメニューと料金をもとにしています。" },
    { type: "update", at: "#menu-title", place: "below", mat: ".prices li:nth-child(4)", mplace: "below-end",
      title: "料金が一目でわかる価格表",
      body: "料金を比べやすいよう、メニュー名と料金を 1 行ずつ並べ、料金を右端にそろえました。" },
    { type: "point", at: "#works-title", place: "right",
      title: "仕上がり写真の出典",
      body: "今の公式サイトのブログ（2019 年）に掲載されている BELL の写真を使っています。" },
    { type: "point", at: "#access-title", place: "right",
      title: "連絡先・住所の出典",
      body: "住所・電話番号・LINE ID は、今の公式サイトに掲載されている情報をもとにしています。" },
    { type: "update", at: ".info .map", place: "below-end", mplace: "below",
      title: "店舗情報を 1 か所に",
      body: "来店に必要な情報をすぐ確認できるよう、住所・営業時間・定休日・電話・LINE を 1 つの表にまとめ、地図を並べました。" },
    { type: "update", at: ".other-lang", place: "above", mplace: "below",
      title: "英語・タイ語の案内",
      body: "日本人以外のお客様にも案内できるよう、英語ページとタイ語の案内を用意しました。" }
  ];

  // サイト（白・黒・ローズ、細い明朝）と混ざらないよう付箋・ステッカー調にする
  var css = [
    "#bn-layer{position:absolute;left:0;top:0;width:0;height:0;z-index:25}",
    ".bn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".bn{position:absolute;width:max-content;max-width:min(300px,calc(100vw - 32px));text-align:left;",
    " font:600 13px/1.6 'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',system-ui,sans-serif;letter-spacing:0;",
    " padding:10px 32px 12px 12px;border-radius:10px;cursor:pointer;border:2px solid #111;box-shadow:4px 4px 0 #111;",
    " opacity:0;transition:opacity .35s ease}",
    ".bn.is-in{opacity:1}",
    ".bn b{display:block;font-size:15px;font-weight:800;margin-bottom:2px;line-height:1.45}",
    ".bn .bn-tag{display:inline-flex;align-items:center;gap:4px;font:800 11px/1.4 'Helvetica Neue',Arial,sans-serif;letter-spacing:.04em;padding:2px 9px 2px 4px;border-radius:999px;margin-bottom:6px;border:1.5px solid #111}",
    ".bn .bn-tag i{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;font-style:normal;font-size:11px;line-height:1}",
    ".bn .bn-x{position:absolute;top:6px;right:8px;width:20px;height:20px;display:grid;place-items:center;border-radius:50%;font-size:14px;line-height:1;font-weight:700}",
    ".bn--update{background:#1d4ed8;color:#fff;rotate:-1deg}",
    ".bn--update .bn-tag{background:#fff;color:#1d4ed8}",
    ".bn--update .bn-tag i{background:#1d4ed8;color:#fff}",
    ".bn--update .bn-x{background:rgba(255,255,255,.18)}",
    ".bn--point{background:#ffe14d;color:#111;rotate:1deg}",
    ".bn--point .bn-tag{background:#111;color:#ffe14d}",
    ".bn--point .bn-tag i{background:#ffe14d;color:#111}",
    ".bn--point .bn-x{background:rgba(0,0,0,.08)}",
    // しっぽ（data-tail の向きに、--tx / --ty の位置で出す）
    ".bn::after{content:'';position:absolute;width:14px;height:14px;background:inherit;border:2px solid #111;transform:rotate(45deg)}",
    ".bn[data-tail=up]::after{top:-9px;left:var(--tx,20px);clip-path:polygon(0 0,100% 0,0 100%)}",
    ".bn[data-tail=down]::after{bottom:-9px;left:var(--tx,20px);clip-path:polygon(100% 0,100% 100%,0 100%)}",
    ".bn[data-tail=left]::after{left:-9px;top:var(--ty,20px);clip-path:polygon(0 0,0 100%,100% 100%)}",
    ".bn[data-tail=none]::after{display:none}",
    ".bn:focus-visible{outline:3px solid #1d4ed8;outline-offset:3px}",
    ".bn.is-out{opacity:0}",
    "@media (prefers-reduced-motion:no-preference){.bn.is-in{animation:bn-float 3.4s ease-in-out infinite}}",
    "@keyframes bn-float{0%,100%{translate:0 0}50%{translate:0 -6px}}",
    ".bn-toggle{position:fixed;z-index:35;right:16px;bottom:calc(var(--bar-h,64px) + 14px + env(safe-area-inset-bottom));",
    " min-height:44px;padding:0 16px;border-radius:999px;border:2px solid #111;background:#ffe14d;color:#111;cursor:pointer;",
    " font:800 13px/1 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;box-shadow:3px 3px 0 #111}",
    "@media (min-width:900px){.bn-toggle{bottom:20px;right:20px}}"
  ].join("");
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var layer = document.createElement("div");
  layer.id = "bn-layer";
  document.body.appendChild(layer);

  var GAP = 14, EDGE = 12;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wideMq = window.matchMedia("(min-width: 900px)");

  var items = NOTES.map(function (n, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "bn bn--" + n.type;
    b.innerHTML = '<span class="bn-tag"><i aria-hidden="true">' + (n.type === "update" ? "✓" : "i") + "</i>" +
      (n.type === "update" ? "Update" : "Point") + "</span><b>" + n.title + "</b>" + n.body +
      '<span class="bn-x" aria-hidden="true">×</span><span class="bn-sr">（クリックで閉じる）</span>';
    b.style.animationDelay = (-(i * 0.7) % 3.4) + "s";
    var item = { n: n, el: b, closed: false };
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      item.closed = true;
      b.classList.add("is-out");
      setTimeout(function () { b.hidden = true; b.classList.remove("is-out"); update(); }, reduce ? 0 : 300);
    });
    layer.appendChild(b);
    setTimeout(function () { b.classList.add("is-in"); }, 300 + i * 60);
    return item;
  });

  // 要素の「中身が実際にある範囲」（文字の行の範囲など）を返す
  function contentRect(el) {
    var r = el.getBoundingClientRect();
    if (/^(IMG|IFRAME|PICTURE)$/.test(el.tagName) || el.querySelector("iframe")) return r;
    var range = document.createRange();
    range.selectNodeContents(el);
    var c = range.getBoundingClientRect();
    if (!c.width || !c.height) return r;
    var l = Math.max(c.left, r.left), rt = Math.min(c.right, r.right);
    return { left: l, right: rt, top: c.top, bottom: c.bottom, width: rt - l, height: c.height };
  }

  function layout() {
    var wide = wideMq.matches;
    var vw = document.documentElement.clientWidth;
    var sx = window.scrollX, sy = window.scrollY;
    items.forEach(function (it) {
      var n = it.n, b = it.el;
      var host = document.querySelector((!wide && n.mat) ? n.mat : n.at);
      if (it.closed || !host || !host.getClientRects().length) { b.hidden = true; return; }
      b.hidden = false;
      var place = (!wide && n.mplace) ? n.mplace : n.place;
      var c = contentRect(host);
      var w = b.offsetWidth, h = b.offsetHeight;
      var left, top, tail;
      if (place === "right") {
        var from = c.right;
        if (n.clearOf && wide) {
          var cl = document.querySelector(n.clearOf);
          if (cl) from = Math.max(from, cl.getBoundingClientRect().right);
        }
        left = from + GAP + 4;
        top = c.top + c.height / 2 - 26;
        tail = "left";
        if (left + w > vw - EDGE) place = "below"; // 右に入らなければ下へ
      }
      var end = /-end$/.test(place);
      if (place !== "right") {
        left = end ? c.right - w : c.left;
        if (/^above/.test(place)) { top = c.top - h - GAP; tail = "down"; }
        else { top = c.bottom + GAP; tail = "up"; }
      }
      left = Math.max(EDGE, Math.min(left, vw - EDGE - w));
      b.dataset.tail = tail;
      if (tail === "left") {
        b.style.setProperty("--ty", Math.max(12, Math.min(h - 30, c.top + c.height / 2 - top - 7)) + "px");
      } else {
        // しっぽの先は、中身の左端から少し入ったところ（end のときは右端寄り）
        var target = end ? Math.max(c.left + 24, c.right - 40) : Math.min(c.left + 28, c.right - 12);
        b.style.setProperty("--tx", Math.max(14, Math.min(w - 30, target - left - 7)) + "px");
      }
      b.style.left = (left + sx) + "px";
      b.style.top = (top + sy) + "px";
    });
    // 吹き出し同士が重なったら、下にある方をさらに下へずらす
    var placed = [];
    items.filter(function (it) { return !it.el.hidden; })
      .sort(function (a, b) { return parseFloat(a.el.style.top) - parseFloat(b.el.style.top); })
      .forEach(function (it) {
        var el = it.el, l = parseFloat(el.style.left), t = parseFloat(el.style.top), w = el.offsetWidth, h = el.offsetHeight;
        placed.forEach(function (p) {
          if (l < p.l + p.w + 8 && p.l < l + w + 8 && t < p.t + p.h + 8 && p.t < t + h + 8) {
            t = p.t + p.h + 12;
            el.dataset.tail = "none";
          }
        });
        el.style.top = t + "px";
        placed.push({ l: l, t: t, w: w, h: h });
      });
  }

  var queued = false;
  function relayout() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; layout(); });
  }
  layout();
  window.addEventListener("resize", relayout);
  window.addEventListener("load", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(document.querySelector("main") || document.body);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "bn-toggle";
  document.body.appendChild(toggle);
  function shown() { return items.filter(function (it) { return !it.el.hidden; }).length; }
  function update() { toggle.textContent = shown() ? "説明をすべて隠す" : "説明をもう一度表示"; }
  toggle.addEventListener("click", function () {
    var show = !shown();
    items.forEach(function (it) {
      if (show) { it.closed = false; it.el.classList.add("is-in"); }
      else if (!it.el.hidden) it.el.click();
    });
    if (show) { layout(); update(); }
  });
  update();
})();
