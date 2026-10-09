// BELL v3: タイ時間で今日の受付状況を表示する（data-status の要素に書き込む）。
(function () {
  var STORE = {
    timeZone: "Asia/Bangkok",
    // 受付時間（最終受付まで）。0=日 … 6=土。null は定休日。公式サイトのフッター記載に合わせる。
    hours: { 0: ["09:00", "18:30"], 1: ["09:00", "18:30"], 2: ["09:00", "14:00"], 3: null,
             4: ["09:00", "18:30"], 5: ["09:00", "18:30"], 6: ["09:00", "18:30"] },
    closedThursdays: [2, 4]
  };
  var lang = document.documentElement.lang === "en" ? "en" : "ja";
  var T = {
    ja: { open: "ただいま受付中", before: "本日は {o} から受付", after: "本日の受付は終了しました", closed: "本日は定休日です",
          hours: "（最終受付 {c}・タイ時間）", closedSub: "（LINE のご連絡は受け付けています）" },
    en: { open: "Open now", before: "Opens today at {o}", after: "Closed for today", closed: "Closed today",
          hours: " (last booking {c}, Bangkok time)", closedSub: " (LINE messages welcome)" }
  }[lang];

  function bangkokNow(date) {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: STORE.timeZone, weekday: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
    var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
    return { dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
             day: Number(get("day")), min: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
  }
  function toMin(s) { return Number(s.slice(0, 2)) * 60 + Number(s.slice(3)); }

  // 検証用: ?now=2026-10-08T10:00:00%2B07:00 で時刻を差し替えられる
  var q = new URLSearchParams(location.search).get("now");
  var now = bangkokNow(q ? new Date(q) : new Date());
  var hours = STORE.hours[now.dow];
  if (now.dow === 4 && STORE.closedThursdays.indexOf(Math.ceil(now.day / 7)) !== -1) hours = null;

  var text, sub = "", state;
  if (!hours) { text = T.closed; sub = T.closedSub; state = "is-closed"; }
  else if (now.min < toMin(hours[0])) { text = T.before.replace("{o}", hours[0]); state = "is-closed"; }
  else if (now.min > toMin(hours[1])) { text = T.after; state = "is-closed"; }
  else { text = T.open; sub = T.hours.replace("{c}", hours[1]); state = "is-open"; }

  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.classList.add(state);
    el.querySelector("b").textContent = text;
    el.querySelector("span").textContent = sub;
  });
})();
