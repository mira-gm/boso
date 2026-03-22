// =====================================
// 画面切り替え
// =====================================
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
  document.getElementById(name).style.display = "block";

  syncCastleLayerSize();

  if (name === "select-screen") {
    resetSelectMap();
  }
}

// タイトル → 城主選択
document.getElementById("title-screen").addEventListener("click", () => {
  showScreen("select-screen");
});

// =====================================
// 元画像サイズ
// =====================================
const MAP_WIDTH = 1024;
const MAP_HEIGHT = 1536;

// =====================================
// CSV マスター読み込み
// =====================================
let castleMaster = {};

fetch("data/mst_siro.csv")
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split("\n");
    lines.shift(); // ヘッダー削除

    lines.forEach(line => {
      const [kanji, key, general, img] = line.split(",");

      castleMaster[key] = {
        kanji,
        general,
        img
      };
    });
  });

// =====================================
// 実測した城の px 座標
// =====================================
const castlePositionsPx = {
  sekijuku:  { x: 90, y: 120 },
  yahagi:    { x: 736, y: 360 },
  omigawa:   { x: 828, y: 370 },
  amido:     { x: 892, y: 480 },
  usui:      { x: 468, y: 480 },
  iwafune:   { x: 517, y: 560 },
  tako:      { x: 715, y: 470 },
  ojyu:      { x: 400, y: 660 },
  naruto:    { x: 664, y: 650 },
  mobara:    { x: 557, y: 773 },
  otaki:     { x: 520, y: 924 },
  kururi:    { x: 391, y: 922 },
  katsuura:  { x: 583, y: 1050 },
  sanuki:    { x: 223, y: 945 },
  tateyama:  { x: 187, y: 1242 }
};

// =====================================
// px → % 変換
// =====================================
function pxToPercent(x, y) {
  return {
    left: (x / MAP_WIDTH) * 100,
    top:  (y / MAP_HEIGHT) * 100
  };
}

// =====================================
// map-img の表示サイズに castle-layer を合わせる
// =====================================
function syncCastleLayerSize() {
  const maps = [
    { img: "select-map", layer: "select-layer" },
    { img: "main-map", layer: "main-layer" },
    { img: "diplomacy-map", layer: "diplomacy-layer" }
  ];

  maps.forEach(m => {
    const img = document.getElementById(m.img);
    const layer = document.getElementById(m.layer);

    if (!img || !layer) return;

    const w = img.clientWidth;
    const h = img.clientHeight;

    if (w === 0 || h === 0) return;

    layer.style.width = w + "px";
    layer.style.height = h + "px";
  });
}

// =====================================
// 選択画面の地図ズーム解除
// =====================================
function resetSelectMap() {
  const map = document.getElementById("select-map");
  map.style.transform = "none";
  map.style.objectPosition = "center center";
}

// =====================================
// 城主選択画面に城アイコンを配置
// =====================================
function placeCastlesForSelect() {
  const layer = document.getElementById("select-layer");

  for (const key in castlePositionsPx) {
    const pos = pxToPercent(castlePositionsPx[key].x, castlePositionsPx[key].y);

    const icon = document.createElement("img");
    icon.src = "data/castle1.png";
    icon.className = "castle-icon";
    icon.style.left = pos.left + "%";
    icon.style.top  = pos.top + "%";

    icon.addEventListener("click", () => {
      selectedCastle = key;
      showConfirmPopup(key);
    });

    layer.appendChild(icon);
  }
}

let selectedCastle = null;

// =====================================
// ポップアップ表示
// =====================================
function showConfirmPopup(key) {
  const data = castleMaster[key];

  document.getElementById("popup-castle-name").textContent = data.kanji;
  document.getElementById("popup-general-img").src = "data/" + data.img;
  document.getElementById("popup-general-name").textContent = data.general;

  document.getElementById("popup-message").textContent =
    `${data.general} でよろしいですか？`;

  document.getElementById("confirm-popup").style.display = "flex";
}

// =====================================
// ポップアップの「はい」「いいえ」
// =====================================
document.getElementById("popup-yes").addEventListener("click", () => {
  document.getElementById("confirm-popup").style.display = "none";
  setupMainMapZoom(selectedCastle);
  showScreen("main-screen");
});

document.getElementById("popup-no").addEventListener("click", () => {
  document.getElementById("confirm-popup").style.display = "none";
});

// =====================================
// メイン画面：選んだ城を中心に2倍ズーム
// =====================================
function setupMainMapZoom(castleKey) {
  const map = document.getElementById("main-map");
  const pos = castlePositionsPx[castleKey];

  const centerX = pos.x - MAP_WIDTH / 4;
  const centerY = pos.y - MAP_HEIGHT / 4;

  map.style.objectPosition = `-${centerX}px -${centerY}px`;
  map.style.transform = "scale(2)";
}

// =====================================
// 交流画面：全城を表示
// =====================================
function placeCastlesForDiplomacy() {
  const layer = document.getElementById("diplomacy-layer");

  for (const key in castlePositionsPx) {
    const pos = pxToPercent(castlePositionsPx[key].x, castlePositionsPx[key].y);

    const icon = document.createElement("img");
    icon.src = "data/castle1.png";
    icon.className = "castle-icon";
    icon.style.left = pos.left + "%";
    icon.style.top  = pos.top + "%";

    icon.addEventListener("click", () => {
      alert(key + " と交流します");
      showScreen("main-screen");
    });

    layer.appendChild(icon);
  }
}

// =====================================
// 初期化
// =====================================
window.addEventListener("load", () => {
  placeCastlesForSelect();
  placeCastlesForDiplomacy();

  const imgs = document.querySelectorAll(".map-img");
  imgs.forEach(img => {
    img.addEventListener("load", syncCastleLayerSize);
  });

  syncCastleLayerSize();
});

// リサイズ時も同期
window.addEventListener("resize", syncCastleLayerSize);