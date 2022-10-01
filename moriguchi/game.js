// キーボードの入力状態を記録する配列の定義
// request-merge　のテスト
var input_key_buffer = new Array();

// キーボードの入力イベントをトリガーに配列のフラグ値を更新させる
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
  e.preventDefault();
  if (isGameOver !== true){
  input_key_buffer[e.keyCode] = true;
  }
  else{
  input_key_buffer[e.keyCode] = false;
  }
}

window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
  e.preventDefault();
  input_key_buffer[e.keyCode] = false;
}

// canvas要素の取得
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 画像を表示するの座標の定義 & 初期化
var x = 5;
var y = -80;

// 上下方向の速度
var vy = 0;
var updatedX = 0;
var updatedY = 0;
 
// ジャンプしたか否かのフラグ値
var isJump = false;

// ゲームオーバーか否かのフラグ値
var isGameOver = false;

// 移動中の場合にカウントする
var walkingCount = 0;
// カウントに対して画像を切り替える単位
const walkRange = 3;
// 右向きか否か
var toRight = true;

// ブロック要素の定義
var element = ["森口　椋太 / Ryota Moriguchi",
              "連絡先",
               "所属：  東京大学　大学院理学系研究科　物理学専攻　岡田研究室　修士課程",
               "所在地：  〒277-8561 千葉県柏市柏の葉5-1-5 東京大学 新領域基盤棟",
              "居室： 基盤棟7A8",
              "Email： moriguchi@mns.k.u-tokyo.ac.jp",
              "経歴",
              "2017年3月　都立青山高等学校　卒業",
              "2017年4月　慶應義塾大学　理工学部　物理学科　入学",
              "2021年4月　東京大学大学院理学系研究科　物理学専攻　修士課程　入学",
              "英字論文",
              "Ryota Moriguchi, Satoshi Tsutsui, Shun Katakami, Kenji Nagata, Masaichiro Mizumaki, and Masato Okada",
              "\"Bayesian Inference on Hamiltonian Selections for Mössbauer Spectroscopy\", arXiv:2205.09188, April, 2022.",
              "国内学会",
              "2021年11月　第24回情報論的学習理論ワークショップ　一般発表",
              "2022年3月　日本物理学会第77回年次大会　一般発表"]
var posi = [  { x: 5, y: -20},{ x: 5, y: 50},{ x: 5, y: 125},{ x: 5, y: 150},{ x: 5, y: 175},{ x: 5, y: 200},{ x: 5, y: 270},{ x: 5, y: 350},{ x: 5, y: 400},{ x: 5, y: 450},
              { x: 5, y: 500},{ x: 5, y: 550},{ x: 5, y: 575},
              { x: 5, y: 650},{ x: 5, y: 700},{ x: 5, y: 750}]
var css_info = ["34px'ＭＳ ゴシック'","24px'ＭＳ ゴシック'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'","24px'ＭＳ ゴシック'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'",
               "24px'ＭＳ ゴシック'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'", 
               "24px'ＭＳ ゴシック'","14px'ＭＳ 明朝'","14px'ＭＳ 明朝'"]

element.push("00000000000000000000")
posi.push({ x: 0, y: -30})
css_info.push("20px'ＭＳ ゴシック'")

let blocks = [];
for (let i=0; i<element.length;i++){
  let position = {};
  ctx.font = css_info[i]
  text_info = ctx.measureText(element[i])
  position.x = posi[i].x;
  position.y = posi[i].y+text_info.actualBoundingBoxAscent+text_info.actualBoundingBoxDescent;
  position.w = text_info.width;
  position.h = text_info.actualBoundingBoxAscent+text_info.actualBoundingBoxDescent;
  blocks.push(position)
}


// ロード時に画面描画の処理が実行されるようにする
window.addEventListener("load", update);

// キャンバスの情報取得
var canv = document.getElementById( "canvas" ) ;

// 画面を更新する関数を定義 (繰り返しここの処理が実行される)
function update() {
  // 画面全体をクリア
  var h = canv.clientHeight;
  var w = canv.clientWidth;
  ctx.clearRect(0, 0, h, w);
 
  // 位置(30, 100)に"BLACK"の文字を表示する
  for (let i=0; i<element.length;i++){
  ctx.font = css_info[i]
	ctx.fillText(element[i], blocks[i].x, blocks[i].y+blocks[i].h-3);
  }

  // 更新後の座標
  var updatedX = x;
  var updatedY = y;

  if (isGameOver) {
    // 上下方向は速度分をたす
    updatedY = y + vy;

    // 落下速度はだんだん大きくなる
    vy = vy + 0.5;

    if (y > 700) {
      // ゲームオーバーのキャラが更に下に落ちてきた時にダイアログを表示し、各種変数を初期化する
      if(!alert("GAME OVER")){
      isGameOver = false;
      isJump = false;
      updatedX = 0;
      updatedY = -10;
      vy = 0;
      }
    }
  } else {
    // 入力値の確認と反映
    if (input_key_buffer[37] || input_key_buffer[39]) {
      walkingCount = (walkingCount + 1) % (walkRange * 10);
    } else {
      walkingCount = 0;
    }
    if (input_key_buffer[37]) {
      updatedX = x - 2;
    }
    if (input_key_buffer[38] && !isJump) {
      vy = -11;
      isJump = true;
    }
    if (input_key_buffer[39]) {
      updatedX = x + 2;
    }

    if (input_key_buffer[37]) {
      toRight = false;
      updatedX = x - 2;
    }
    if (input_key_buffer[38] && !isJump) {
      vy = -10;
      isJump = true;
    }
    if (input_key_buffer[39]) {
      toRight = true;
      updatedX = x + 2;
    }

    // ジャンプ中である場合のみ落下するように調整する
    if (isJump) {
      // 上下方向は速度分をたす
      updatedY = y + vy;

      // 落下速度はだんだん大きくなる
      vy = vy + 0.5;

      // 主人公が乗っているブロックを取得する
      const blockTargetIsOn = getBlockTargrtIsOn(x, y, updatedX, updatedY);

      // ブロックが取得できた場合には、そのブロックの上に立っているよう見えるように着地させる
      if (blockTargetIsOn !== null) {
        updatedY = blockTargetIsOn.y-32;
        isJump = false;
      }
    } else {
      // ブロックの上にいなければジャンプ中の扱いとして初期速度0で落下するようにする
      if (getBlockTargrtIsOn(x, y, updatedX, updatedY) === null) {
        isJump = true;
        vy = 0;
      }
    }

    if (y > 700) {
      // 下まで落ちてきたらゲームオーバーとし、上方向の初速度を与える
      isGameOver = true;
      updatedY = 500;
      vy = -15;
    }
  }

  x = updatedX;
  y = updatedY;

  // 主人公の画像を表示
  var image = new Image();
  if (isGameOver) {
    // ゲームオーバーの場合にはゲームオーバーの画像が表示する
    image.src = "./character-01/game-over.png";
  } else if (isJump) {
    image.src = `./character-01/jump-${
      toRight ? "right" : "left"
    }-000.png`;
  } else {
    image.src = `./character-01/walk-${toRight ? "right" : "left"}-${
      "00" + Math.floor(walkingCount / walkRange)
    }.png`;
  }
  ctx.drawImage(image, x, y, 32, 32);


  // 地面の画像を表示
  // var groundImage = new Image();
  // groundImage.src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QC6RXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAiAAAAZodpAAQAAAABAAAAiAAAAAAAAABIAAAAAQAAAEgAAAABQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAgoAMABAAAAAEAAAAgAAAAAP/AABEIACAAIAMBEQACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgICAgIDAgICAwQDAgIDBAUEBAQEBAUGBQUFBQUFBgYHBwgHBwYJCQoKCQkMDAwMDAwMDAwMDAwMDAz/2wBDAQMDAwUEBQkGBgkNCwkLDQ8ODg4ODw8MDAwMDA8PDAwMDAwMDwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/3QAEAAT/2gAMAwEAAhEDEQA/APtxnJB4+lfmh9mV3Y+tUhXI1chqYXJvNJ4NQ0M//9D7abgHPWvzQ+zK0hxzmrSJZCGG7/P+FAh4PzVLKR//0ftg5+bPevzQ+zK8n0qyCv0Y0APU5apkUj//0vts/wAX1r83Psyq/XkUIlkWMtQIVVA/z71Mikf/2Q==";
  // for (const block of blocks) {
  //   ctx.drawImage(groundImage, block.x, block.y, block.w, block.h);
  // }

  // 再描画
  window.requestAnimationFrame(update);
}

// 変更前後のxy座標を受け取って、ブロック上に存在していればそのブロックの情報を、存在していなければnullを返す
function getBlockTargrtIsOn(x, y, updatedX, updatedY) {
  // 全てのブロックに対して繰り返し処理をする
  for (const block of blocks) {
    if (y  + 32 <= block.y&& updatedY + 32>= block.y) {
      if (
        (x + 32 <= block.x || x >= block.x + block.w) &&
        (updatedX + 32 <= block.x || updatedX >= block.x + block.w)
      ) {
        // ブロックの上にいない場合には何もしない
        continue;
      }
      // ブロックの上にいる場合には、そのブロック要素を返す
      return block;
    }
  }
  // 最後までブロック要素を返さなかった場合はブロック要素の上にいないということなのでnullを返却する
  return null;
}
