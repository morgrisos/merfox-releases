// MerFox 紹介ページの動き（最小限）
// - 動きを減らす設定の人には、動画を自動再生しない（poster を表示し、押したときだけ再生する）
// - 実際の画面の画像を、左右のボタンで1枚ずつ送れるようにする（自動では動かさない）
// JavaScript が無くても、見出し・説明・画像・よくある質問はすべて読める。

(function () {
  'use strict';

  // ---- ヒーロー動画 ----
  var video = document.getElementById('hero-video');
  var playBtn = document.getElementById('play-reduced');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMotionPreference() {
    if (!video) return;
    if (reduce && reduce.matches) {
      // 自動再生をやめて、最初のコマ（poster）のまま止める
      video.removeAttribute('autoplay');
      video.autoplay = false;
      video.pause();
      video.dataset.motion = 'reduced';
      if (playBtn) playBtn.hidden = false;
    } else {
      video.dataset.motion = 'full';
      if (playBtn) playBtn.hidden = true;
    }
  }

  if (playBtn && video) {
    playBtn.addEventListener('click', function () {
      // 動きを減らす設定のときは、押した人にだけ再生する。操作ボタンも出す
      var source = video.querySelector('source');
      if (source && source.hasAttribute('media')) {
        source.removeAttribute('media');
        video.load();
      }
      video.controls = true;
      playBtn.hidden = true;
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* 再生できない環境では poster のまま */ });
    });
  }

  applyMotionPreference();
  if (reduce && reduce.addEventListener) reduce.addEventListener('change', applyMotionPreference);

  // ---- 実際の画面（カルーセル） ----
  var list = document.getElementById('slides');
  var prev = document.getElementById('slide-prev');
  var next = document.getElementById('slide-next');
  var status = document.getElementById('slide-status');
  if (!list || !prev || !next || !status) return;
  var slides = list.querySelectorAll('.slide');

  function currentIndex() {
    var center = list.scrollLeft + list.clientWidth / 2;
    var best = 0, bestDist = Infinity;
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      var mid = s.offsetLeft - list.offsetLeft + s.offsetWidth / 2;
      var d = Math.abs(mid - center);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function update() {
    var i = currentIndex();
    status.textContent = (i + 1) + ' / ' + slides.length;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  }

  function go(delta) {
    var i = Math.max(0, Math.min(slides.length - 1, currentIndex() + delta));
    var s = slides[i];
    var left = s.offsetLeft - list.offsetLeft - (list.clientWidth - s.offsetWidth) / 2;
    var smooth = !(reduce && reduce.matches);
    list.scrollTo({ left: left, behavior: smooth ? 'smooth' : 'auto' });
  }

  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  list.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  var timer = null;
  list.addEventListener('scroll', function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(update, 60);
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
