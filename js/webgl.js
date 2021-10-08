// canvas とクォータニオンをグローバルに扱う
var c;
var q = new qtnIV();
var qt = q.identity(q.create());

//マテリアルポイントクラス
class point{
    constructor(x, y, z, id ,tex_number) {
        // 3. インスタンス(`this`)の`x`と`y`プロパティにそれぞれ値を設定する
        this.x = x;
        this.y = y;
        this.z = z;
        this.id = id;
        this.tex_number = tex_number;
    }
}



// マウスムーブイベントに登録する処理
function mouseMove(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}

onload = function(){
	// canvasエレメントを取得
	c = document.getElementById('canvas');
	c.width = 700;
	c.height = 470;
    
    var count = 0;
    var rad_valocity = 1.0;
    var rotation_w = 4.0;

	// イベント処理
	c.addEventListener('mousemove', mouseMove, true);
	
	// エレメントへの参照を取得
	var eCheck = document.getElementById('check');
	
	// webglコンテキストを取得
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	// 頂点シェーダとフラグメントシェーダの生成
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	
	// プログラムオブジェクトの生成とリンク
	var prg = create_program(v_shader, f_shader);
	
	// attributeLocationを配列に取得
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');
	
	// attributeの要素数を配列に格納
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;
	
	// 頂点の位置
	var position = [
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	var color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	var textureCoord = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];
	var index = [
		0, 1, 2,
		3, 2, 1
	];
	
	// VBOとIBOの生成
	var vPosition     = create_vbo(position);
	var vColor        = create_vbo(color);
	var vTextureCoord = create_vbo(textureCoord);
	var VBOList       = [vPosition, vColor, vTextureCoord];
	var iIndex        = create_ibo(index);
	
	// VBOとIBOの登録
	set_attribute(VBOList, attLocation, attStride);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);
	
	// uniformLocationを配列に取得
	var uniLocation = new Array();
	uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1]  = gl.getUniformLocation(prg, 'texture');
	
	// 各種行列の生成と初期化
	var m = new matIV();
	var mMatrix   = m.identity(m.create());
	var vMatrix   = m.identity(m.create());
	var pMatrix   = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var qMatrix   = m.identity(m.create());
	var invMatrix = m.identity(m.create());
	
	// 各種フラグを有効化する
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.BLEND);
	
	// ブレンドファクター
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
	
	// テクスチャ用変数の宣言
	var texture0 = null;
	var texture1 = null;
	var texture2 = null;
	var texture3 = null;
	var texture4 = null;
	var texture5 = null;
	
	// テクスチャを生成
	create_texture('tex0.png', 0);
	create_texture('tex1.png', 1);
    create_texture('tex2v2.png', 2);
    create_texture('texcc0.png', 3);
	create_texture('texcc1.png', 4);
	create_texture('texcc2.png', 5);

    
    //板ポリゴンの座標まとめたリスト
    var Positions = [];
    Positions.push(new point(0.0 ,0.0 ,0.0,0,0));
    Positions.push(new point(0.0 ,0.0 ,0.0,1,1));
    Positions.push(new point(0.0 ,0.0 ,0.0,2,2));
    Positions.push(new point(0.0 ,0.0 ,0.0,3,3));
    Positions.push(new point(0.0 ,0.0 ,0.0,4,4));
    Positions.push(new point(0.0 ,0.0 ,0.0,5,5));

    //ZList
    ZList = [0,1,2];
    var rad = 0;
    var _rad = 0;
    var rad_count = 0;
    var phase_diff = 0.0;
    var phase_diff2 = -1.0;
    var trans_x2 = 0.3;
    var trans_z2 = 0.3;



	// 恒常ループ
	(function(){

        count ++;
        _rad = ((rad_valocity*count % 360) * Math.PI / 180);
        if(_rad < 2.0*Math.PI/3.0){
            rad_count = 0;
        }
        if(2.0*Math.PI/3.0 <=_rad  && _rad < 4.0*Math.PI/3.0){
            rad_count = 1;
        }
        if(4.0*Math.PI/3.0 <=_rad && _rad < 6.0*Math.PI/3.0){
            rad_count = 2;
        }
        console.log(rad_count);
        rad = _rad%(2.0* Math.PI / 3.0);
        rad = (2.0* Math.PI / 3.0)*Math.pow((-1*Math.cos(Math.PI*rad/(4.0* Math.PI / 3.0)) + 1.0),10.0);


        rad = rad + rad_count*2.0* Math.PI / 3.0;


		// canvasを初期化
		gl.clearColor(244.0/256, 246.0/256, 255.0/256, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// クォータニオンを行列に適用
		var qMatrix = m.identity(m.create());
//		q.toMatIV(qt, qMatrix);
		
		// カメラの座標位置
		var camPosition = [0.0, 1.8, 6.9];
		
		// ビュー座標変換行列
		m.lookAt(camPosition, [0, 0, 0], [0, 1, 0], vMatrix);
		
		// ビルボード用のビュー座標変換行列
		m.lookAt([0, 0, 0], camPosition, [0, 1, 0], invMatrix);
		
		// ビュー座標変換行列にクォータニオンの回転を適用
//		m.multiply(vMatrix, qMatrix, vMatrix);
//		m.multiply(invMatrix, qMatrix, invMatrix);
		
		// ビルボード用ビュー行列の逆行列を取得
		m.inverse(invMatrix, invMatrix);
		
		// ビュー×プロジェクション座標変換行列
		m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
		m.multiply(pMatrix, vMatrix, tmpMatrix);
		
        
        //座標の更新
        Positions[0].x = 0.3*rotation_w *Math.cos(rad + phase_diff);
        Positions[0].y = 1.0;
        Positions[0].z = rotation_w *Math.sin(rad + phase_diff);

        Positions[1].x = 0.3*rotation_w *Math.cos(rad + 2.0*Math.PI/3.0 + phase_diff);
        Positions[1].y = 1.0;
        Positions[1].z = rotation_w *Math.sin(rad + 2.0*Math.PI/3.0 + phase_diff);

        Positions[2].x = 0.3*rotation_w *Math.cos(rad + 4.0*Math.PI/3.0 + phase_diff);
        Positions[2].y = 1.0;
        Positions[2].z = rotation_w *Math.sin(rad + 4.0*Math.PI/3.0 + phase_diff );

        Positions[3].x = 0.3*rotation_w *Math.cos(rad + phase_diff2)+ trans_x2;
        Positions[3].y = 0.7;
        Positions[3].z = rotation_w *Math.sin(rad + phase_diff2) + trans_z2;

        Positions[4].x = 0.3*rotation_w *Math.cos(rad + 2.0*Math.PI/3.0 + phase_diff2)+ trans_x2;
        Positions[4].y = 0.7;
        Positions[4].z = rotation_w *Math.sin(rad + 2.0*Math.PI/3.0 + phase_diff2)+ trans_z2;

        Positions[5].x = 0.3*rotation_w *Math.cos(rad + 4.0*Math.PI/3.0 + phase_diff2)+ trans_x2;
        Positions[5].y = 0.7;
        Positions[5].z = rotation_w *Math.sin(rad + 4.0*Math.PI/3.0 + phase_diff2 )+ trans_z2;


        var Positions_c = [];
        for(i = 0;i < Positions.length ;i ++){
            Positions_c.push(Positions[i]);
        }
        var List_Z = ZSort(Positions_c);


        for(var i of List_Z){

            switch( Positions[i].tex_number ) {
                case 0:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, texture0);
                    gl.uniform1i(uniLocation[1], 0);    
                    break;
                case 1:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, texture1);
                    gl.uniform1i(uniLocation[1], 1);            
                    break;
                case 2:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, texture2);
                    gl.uniform1i(uniLocation[1], 2);            
                    break;
                case 3:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE3);
                    gl.bindTexture(gl.TEXTURE_2D, texture3);
                    gl.uniform1i(uniLocation[1], 3);    
                    break;
                case 4:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE4);
                    gl.bindTexture(gl.TEXTURE_2D, texture4);
                    gl.uniform1i(uniLocation[1], 4);            
                    break;
                case 5:
                    // フロア用テクスチャをバインド
                    gl.activeTexture(gl.TEXTURE5);
                    gl.bindTexture(gl.TEXTURE_2D, texture5);
                    gl.uniform1i(uniLocation[1], 5);            
                    break;
                    
            }
            if(count > 2){
            // ビルボードのレンダリング
            m.identity(mMatrix);            
            m.translate(mMatrix, [Positions[i].x, Positions[i].y, Positions[i].z], mMatrix);          
            m.multiply(mMatrix, invMatrix, mMatrix);
            m.scale(mMatrix, [-1.0, 1.0, 0.0], mMatrix);  
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);            
            }

        }

        
 
		
		// コンテキストの再描画
		gl.flush();
		
		// ループのために再帰呼び出し
		setTimeout(arguments.callee, 1000 / 30);
    })();

    //ZSort    
    function ZSort(pos) {
        var a = pos;
        var i = 0, j = 0;
        for (; i < a.length; i++) {
            for (j = a.length - 1; j > i; j--) {
                if (a[j].z < a[j - 1].z) {
                    var b = a[j];
                    a[j] = a[j-1];
                    a[j-1] = b;
                }
            }
        }
        var z = [];
        for(i=0;i<a.length;i++){
            z.push(a[i].id);
        }
        return z;
    }

	// シェーダを生成する関数
	function create_shader(id){
		// シェーダを格納する変数
		var shader;
		
		// HTMLからscriptタグへの参照を取得
		var scriptElement = document.getElementById(id);
		
		// scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}
		
		// scriptタグのtype属性をチェック
		switch(scriptElement.type){
			
			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
				
			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		
		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);
		
		// シェーダをコンパイルする
		gl.compileShader(shader);
		
		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			// 成功していたらシェーダを返して終了
			return shader;
		}else{
			
			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}
	
	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs){
		// プログラムオブジェクトの生成
		var program = gl.createProgram();
		
		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		
		// シェーダをリンク
		gl.linkProgram(program);
		
		// シェーダのリンクが正しく行なわれたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		
			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);
			
			// プログラムオブジェクトを返して終了
			return program;
		}else{
			
			// 失敗していたらエラーログをアラートする
			alert(gl.getProgramInfoLog(program));
		}
	}
	
	// VBOを生成する関数
	function create_vbo(data){
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();
		
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		
		// バッファにデータをセット
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		
		// バッファのバインドを無効化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		// 生成した VBO を返して終了
		return vbo;
	}
	
	// VBOをバインドし登録する関数
	function set_attribute(vbo, attL, attS){
		// 引数として受け取った配列を処理する
		for(var i in vbo){
			// バッファをバインドする
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			
			// attributeLocationを有効にする
			gl.enableVertexAttribArray(attL[i]);
			
			// attributeLocationを通知し登録する
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}
	
	// IBOを生成する関数
	function create_ibo(data){
		// バッファオブジェクトの生成
		var ibo = gl.createBuffer();
		
		// バッファをバインドする
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		
		// バッファにデータをセット
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		
		// バッファのバインドを無効化
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		
		// 生成したIBOを返して終了
		return ibo;
	}
	
	// テクスチャを生成する関数
	function create_texture(source, index){
		// イメージオブジェクトの生成
		var img = new Image();
		
		// データのオンロードをトリガーにする
		img.onload = function(){
			// テクスチャオブジェクトの生成
			var tex = gl.createTexture();
			
			// テクスチャをバインドする
			gl.bindTexture(gl.TEXTURE_2D, tex);
			
			// テクスチャへイメージを適用
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			
			// ミップマップを生成
			gl.generateMipmap(gl.TEXTURE_2D);
			
			// テクスチャのバインドを無効化
			gl.bindTexture(gl.TEXTURE_2D, null);
			
			// 生成したテクスチャを変数に代入
			switch(index){
				case 0:
					texture0 = tex;
					break;
				case 1:
					texture1 = tex;
                    break;
                case 2:
					texture2 = tex;
                    break;
                case 3:
					texture3 = tex;
					break;
				case 4:
					texture4 = tex;
                    break;
                case 5:
					texture5 = tex;
					break;
				default:
					break;
			}
		};
		
		// イメージオブジェクトのソースを指定
		img.src = source;
	}
	
};