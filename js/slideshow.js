$(window).load(function() {
	var img = $("#slideshow").children("img"), // 画像を取得
		num = img.length, // 画像の数を数える
		count = 0, // 現在何枚目を表示しているかのカウンター
		interval = 5000; // 次の画像に切り替わるまでの時間(1/1000秒)
	
	img.eq(0).addClass("show"); // 最初の画像にshowクラス付与
	
	setTimeout(slide, interval); // slide関数をタイマーセット
	
	function slide() {
		img.eq(count).removeClass("show"); // 現在表示している画像からshowクラスを取り除く
		count++; // カウンターを一個進める
		if(count >= num) {
			count = 0; // カウンターが画像の数より大きければリセット
		}
		img.eq(count).addClass("show"); // 次の画像にshowクラス付与
		setTimeout(slide, interval); // 再びタイマーセット
	}
});