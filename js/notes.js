// 提案用の説明レイヤー（Ponさんへの説明用）。サイト本体とは独立していて、
// index.html の <script src="js/notes.js"> を 1 行消せば完全に外れる。
// 吹き出しはクリックで消える。左下のボタンで「すべて隠す／もう一度表示」。
(function () {
  // ?notes=0 で説明なしの素の状態を表示する（納品前の確認用）
  if (new URLSearchParams(location.search).get("notes") === "0") return;
  var NOTES = [
    // type: "good" = 今のサイトから良くなった点 / "check" = 出典・確認してほしい点
    { at: ".hero__cta", type: "good", place: "below", mplace: "above",
      title: "最初の画面で電話・LINE",
      body: "スクロール中も画面の下に電話・LINE が出ています。今のサイトは、ページの一番下まで行かないと連絡先がありません。" },
    { at: ".hero [data-status]", type: "good", place: "aside", desktopOnly: true,
      title: "今日の営業状況を自動表示",
      body: "タイ時間で「営業中／定休日」を表示します。第 2・第 4 木曜の休みにも対応しています。" },
    { at: "#access .status", type: "good", place: "above-right", mobileOnly: true,
      title: "今日の営業状況を自動表示",
      body: "タイ時間で「営業中／定休日」を表示します。第 2・第 4 木曜の休みにも対応しています。" },
    { at: ".hero__text", type: "check", place: "aside", mplace: "above",
      title: "文章は AI が書いた仮の案です",
      body: "キャッチコピーや説明文はお店の言葉に差し替えられます。" },
    { at: ".hero > .wrap", mat: ".vows li:first-child", type: "good", place: "below-right", mplace: "above-right",
      title: "広告なし・スマホで横にずれない",
      body: "今のサイトは先頭に Wix の広告が出て、スマホでは画面が横にはみ出します。" },
    { at: ".letter__sign", type: "check", place: "above-right",
      title: "店長のお名前・写真をください",
      body: "いまは名前を出していません。いただければ署名と写真を入れます。手紙の文章も AI の仮文です。" },
    { at: ".letter__cta", type: "good", place: "above",
      title: "店長に直接相談できる入口",
      body: "今のサイトには担当者の情報も、予約前に相談する方法もありません。" },
    { at: ".signature", type: "check", place: "above",
      title: "料金は今のサイトの掲載値です",
      body: "2019 年頃の料金をそのまま載せています。最新の料金をいただければ差し替えます。" },
    { at: "#menu .split", mat: ".prices li:nth-child(4)", type: "good", place: "inset", mplace: "below-right",
      title: "料金が一目でわかる価格表",
      body: "今のサイトはメニュー名と料金の列がずれていて読みにくくなっていました。" },
    { at: ".works .work", type: "check", place: "above",
      title: "写真の出典：BELL の公式ブログ",
      body: "今のサイトのブログ（2019 年）に載っている BELL の写真です。新しい写真があれば差し替えます。" },
    { at: ".info > div", type: "check", place: "above",
      title: "電話・LINE・住所は今のサイトの掲載値",
      body: "今も使えるか、LINE が店長直通かを確認させてください。" },
    { at: ".info .map", type: "good", place: "above", mplace: "below",
      title: "必要な情報を 1 か所に",
      body: "住所・時間・定休日・電話・LINE を 1 つの表にまとめ、地図を並べました。" },
    { at: ".other-lang", type: "good", place: "above", mplace: "below",
      title: "英語ページとタイ語の案内を追加",
      body: "タイ人や日本人以外のお客様にも案内できます（翻訳は AI。公開前にネイティブ確認）。" }
  ];

  var css = [
    ".bn-host{position:relative}",
    ".bn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".bn{position:absolute;z-index:25;width:max-content;max-width:min(300px,calc(100vw - 32px));text-align:left;",
    " font:500 13px/1.6 'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP',system-ui,sans-serif;letter-spacing:0;",
    " padding:10px 30px 11px 12px;border-radius:12px;cursor:pointer;border:0;box-shadow:0 6px 18px rgba(0,0,0,.16);",
    " opacity:0;transition:opacity .35s ease,transform .35s ease}",
    ".bn.is-in{opacity:1}",
    ".bn b{display:block;font-size:14px;font-weight:700;margin-bottom:2px}",
    ".bn .bn-tag{display:inline-block;font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;margin-bottom:4px}",
    ".bn .bn-x{position:absolute;top:6px;right:8px;font-size:16px;line-height:1;opacity:.7}",
    ".bn--good{background:#8e5b5f;color:#fff}",
    ".bn--good .bn-tag{background:#fff;color:#8e5b5f}",
    ".bn--check{background:#fff8dc;color:#2b2b2b;outline:1px solid #e3cf86}",
    ".bn--check .bn-tag{background:#2b2b2b;color:#fff8dc}",
    ".bn::after{content:'';position:absolute;width:12px;height:12px;background:inherit;transform:rotate(45deg)}",
    ".bn--check::after{outline:1px solid #e3cf86;clip-path:polygon(100% 0,100% 100%,0 100%)}",
    ".bn[data-place^=below]{top:calc(100% + 12px)}",
    ".bn[data-place^=below]::after{top:-6px;left:22px;clip-path:polygon(0 0,100% 0,0 100%)}",
    ".bn[data-place^=above]{bottom:calc(100% + 12px)}",
    ".bn[data-place^=above]::after{bottom:-6px;left:22px}",
    ".bn[data-place$=right]{right:0}",
    ".bn[data-place$=right]::after{left:auto;right:22px}",
    ".bn:not([data-place$=right]):not([data-place=side]):not([data-place=aside]):not([data-place=inset]){left:0}",
    ".bn[data-place=inset]{top:120px;left:var(--gutter,16px)}",
    ".bn[data-place=inset]::after{right:-6px;top:26px;clip-path:polygon(0 0,100% 0,100% 100%)}",
    ".bn[data-place=side]{right:0;top:50%;margin-top:-34px}",
    ".bn[data-place=aside]{left:calc(100% + 24px);top:-8px}",
    ".bn[data-place=side]::after,.bn[data-place=aside]::after{left:-6px;top:26px;clip-path:polygon(0 0,0 100%,100% 100%)}",
    ".bn--check[data-place=aside]::after{clip-path:polygon(0 0,0 100%,100% 100%)}",
    ".bn:focus-visible{outline:3px solid #000;outline-offset:2px}",
    ".bn.is-out{opacity:0;transform:scale(.92)}",
    "@media (prefers-reduced-motion:no-preference){.bn.is-in{animation:bn-float 3.4s ease-in-out infinite}}",
    "@keyframes bn-float{0%,100%{translate:0 0}50%{translate:0 -6px}}",
    ".bn-intro{position:fixed;z-index:40;left:50%;top:56px;transform:translateX(-50%);width:min(560px,calc(100vw - 32px));",
    " background:#000;color:#fff;border-radius:14px;padding:16px 40px 16px 18px;box-shadow:0 12px 32px rgba(0,0,0,.25);",
    " font:400 14px/1.7 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;cursor:pointer;border:0;text-align:left}",
    ".bn-intro b{display:block;font-size:16px;margin-bottom:4px}",
    ".bn-intro .bn-x{position:absolute;top:10px;right:14px;font-size:18px;opacity:.7}",
    ".bn-intro.is-out{opacity:0;transition:opacity .3s}",
    ".bn-toggle{position:fixed;z-index:35;right:16px;bottom:calc(var(--bar-h,64px) + 14px + env(safe-area-inset-bottom));",
    " min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #000;background:#fff;color:#000;cursor:pointer;",
    " font:700 13px/1 'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.12)}",
    "@media (min-width:900px){.bn-toggle{bottom:20px;right:auto;left:50%;transform:translateX(-50%)}}",
    "@media (max-width:899px){.bn[data-desktop]{display:none}}",
    "@media (min-width:900px){.bn[data-mobile]{display:none}}"
  ].join("");
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bubbles = [];
  var wide = window.matchMedia("(min-width: 900px)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function close(el) {
    el.classList.add("is-out");
    setTimeout(function () { el.hidden = true; el.classList.remove("is-out"); update(); }, reduce ? 0 : 300);
  }

  NOTES.forEach(function (n, i) {
    var host = document.querySelector((n.mat && !wide) ? n.mat : n.at);
    if (!host) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "bn bn--" + n.type;
    b.dataset.place = (n.mplace && !wide) ? n.mplace : n.place;
    if (n.desktopOnly) b.dataset.desktop = "";
    if (n.mobileOnly) b.dataset.mobile = "";
    b.innerHTML = '<span class="bn-tag">' + (n.type === "good" ? "改善ポイント" : "確認ポイント") + "</span>" +
      "<b>" + n.title + "</b>" + n.body + '<span class="bn-x" aria-hidden="true">×</span><span class="bn-sr">（クリックで閉じる）</span>';
    b.style.animationDelay = (-(i * 0.7) % 3.4) + "s";
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); close(b); });
    host.classList.add("bn-host");
    host.appendChild(b);
    bubbles.push(b);
    setTimeout(function () { b.classList.add("is-in"); }, 400 + i * 60);
  });

  // 画面の外にはみ出す吹き出しを内側に寄せる（横スクロールを出さない）
  function clamp() {
    var vw = document.documentElement.clientWidth;
    bubbles.forEach(function (b) {
      if (b.hidden) return;
      b.style.marginLeft = "";
      var r = b.getBoundingClientRect();
      var over = r.right - (vw - 12);
      if (over > 0) b.style.marginLeft = -Math.ceil(over) + "px";
    });
  }
  clamp();
  window.addEventListener("resize", clamp);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "bn-toggle";
  document.body.appendChild(toggle);
  function visible() { return bubbles.filter(function (b) { return b.getClientRects().length > 0; }).length; }
  function update() { toggle.textContent = visible() ? "説明をすべて隠す" : "説明をもう一度表示"; }
  toggle.addEventListener("click", function () {
    var show = !visible();
    bubbles.forEach(function (b) { if (show) { b.hidden = false; requestAnimationFrame(function () { b.classList.add("is-in"); }); } else close(b); });
    if (show) setTimeout(function () { clamp(); update(); }, 0);
  });
  update();

  var intro = document.createElement("button");
  intro.type = "button";
  intro.className = "bn-intro";
  intro.innerHTML = "<b>このホームページは、AI だけで作りました。</b>" +
    "要件の整理・デザイン・文章・公開まで AI が行っています。ほかの店舗も同じ手順で、営業の前にサンプルを用意できます。" +
    "<br>吹き出しは「改善ポイント」（今のサイトから良くなった点）と「確認ポイント」（写真の出典・料金など）です。クリックで消えます。" +
    '<span class="bn-x" aria-hidden="true">×</span>';
  intro.addEventListener("click", function () { intro.classList.add("is-out"); setTimeout(function () { intro.remove(); }, 300); });
  document.body.appendChild(intro);
})();
