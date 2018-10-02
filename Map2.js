//Map.js
var holeLayer1 = []; //穴の緯度経度の配列
var map; //googleマップの情報を入れる
var holePoly = []; //穴の配列
var points = []; //地図に表示するポリゴンの配列
var bounds = []; //境界線の配列
var JSTSpoly = []; //取得したポリゴンの配列
var x; //ポリゴンのオプション
var c = 1;
var iconNo = 0;
var i = 0;
var icon = [];
var lat25 = 0.00022457872; //緯度２５m
var lng25 = 0.00027415956; //経度２５m
var angle = 3.6;//100角形の内角
var image;
var gmap;
var newlatlng;
var flag = 0;
var kageLayer = [ // 影の緯度経度
  //時計回り
  {lat: 46.33, lng: 148.4508},
  {lat: 24.26, lng: 148.4508},
  {lat: 24.26, lng: 125.5911},
  {lat: 46.33, lng: 125.5911},
  {lat: 46.33, lng: 148.4508},
];
var googleMaps2JSTS = function(boundaries) {
  var coordinates = [];
  for (var i = 0; i < boundaries.getLength(); i++) {
    coordinates.push(new jsts.geom.Coordinate(
      boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
  }
  return coordinates;
};

var jsts2googleMaps = function(geometry) {
  var coordArray = geometry.getCoordinates();
  GMcoords = [];
  for (var i = 0; i < coordArray.length; i++) {
      GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
  }
  return GMcoords;
}

function initialize() {
  //getPosition();
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position) {
      var ido = position.coords.latitude; //取得した緯度
      var keido = position.coords.longitude; //取得した経度
      var gosa = position.coords.accuracy; //取得した精度
      console.log("最初の緯度:"+ ido);
      console.log("最初の経度:"+ keido);
      console.log("最初の精度:"+ gosa);

      if(gosa <= 25){
  　     //精度が５０m以下の時にポリゴンを表示
        newlatlng = new google.maps.LatLng(ido,keido);
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: new google.maps.LatLng(ido,keido),
          minZoom : 8.5,//３０km
          styles: [{
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {
                "visibility": "on"
              },{
                "color": "#9CA7E2"
              }
            ]
          },
          {
            "featureType": "landscape",
            "stylers": [
              {
                "visibility": "on"
              },{
                "color": "#00FF41"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "on"
              },{
                "color": "#2f343b"
              },{
                "weight": 1
              }
            ]
          },
          {
            "featureType": "road",
            "stylers": [
              {
                "visibility": "on"
              },{
                "color": "#DDDED3"
              }
            ]
          },
          {
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }
        ]
        });

        var pos = map.getCenter(); //中心座標の取得
        var lat = pos.lat(); //緯度
        var lng = pos.lng(); //経度
        gmap = map;
        // 穴の緯度経度
        for (var i = 1; i < 101; i++) {//65538
          holeLayer1.push(
            {lat: lat + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: lng + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
          );
        }
        holeLayer1.push(holeLayer1[0]);
        bounds[0] = new google.maps.LatLngBounds();
        var poly1 = new google.maps.Polygon({
          paths: [holeLayer1]
        });
        for (var i = 0; i < holeLayer1.length; i++) {
          bounds[0].extend(new google.maps.LatLng(holeLayer1[i].lat, holeLayer1[i].lng));
        }
        var geometryFactory = new jsts.geom.GeometryFactory();
        var JSTSpoly1 = geometryFactory.createPolygon(
          geometryFactory.createLinearRing(googleMaps2JSTS(poly1.getPath())));
        JSTSpoly1.normalize();
        JSTSpoly[0] = JSTSpoly1
        holePoly[0] = jsts2googleMaps(JSTSpoly[0]);//holeLayer1を和集合ポリゴンに代入
        points = [kageLayer, holePoly[0]];//pathを結合する
        x = new google.maps.Polygon({
          paths: points,
          strokeColor: '#FFFFFF',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          fillColor: '#FFFFFF',
          fillOpacity: 1.0
        });

      x.setMap(map);//mapにポリゴンを表示

      var canvas = document.createElement('canvas');
      window.onload = function(){
        if ( checkFileApi() && checkCanvas(canvas) ){
          //ファイル選択
          var file_image = document.getElementById('file-image');
          file_image.addEventListener('change', selectReadfile, false);
        }
      }

      map.addListener('click', function(e) {//クリックした時の処理
        getClickLatLng(e.latLng, map);
      });

        setTimeout(loop,5000);//５秒後に実行
      }else{
        initialize();
      }
    },
    // 取得失敗した場合
    function(error) {
      switch(error.code) {
        case 1: //PERMISSION_DENIED
          alert("位置情報の利用が許可されていません");
          break;
        case 2: //POSITION_UNAVAILABLE
          alert("現在位置が取得できませんでした");
          break;
        case 3: //TIMEOUT
          alert("タイムアウトになりました");
          break;
        default:
          alert("その他のエラー(エラーコード:"+error.code+")");
          break;
      }
    },
    {
      enableHighAccuracy: true,
    }
  );
}

function getClickLatLng(lat_lng, map) {
  var element = document.getElementById( "target" ) ;
  var radioNodeList = element.hoge ;
  var a = radioNodeList.value ;
  if(a == "アイコン"){

      // マーカーを設置
      var marker = new google.maps.Marker({
        position: lat_lng,
        map: map,
        icon: {
          url: image,
          scaledSize: new google.maps.Size(100, 100)
        }
      });
        marker.addListener('click', function() { // マーカーをクリックしたとき
          var element2 = document.getElementById( "target" ) ;
          var radioNodeList2 = element.hoge ;
          var b = radioNodeList.value ;
          if (b == "アイコン削除"){
            marker.setMap(null);//アイコンの削除
          }
        });
      icon[iconNo] = marker;
      iconNo += 1;
      icon.setMap(map);//アイコン表示
  }else if(a == "コメント"){
    //コメント
    var comment = window.prompt("何かひとこと", "");
    if(comment != "" && comment != null){
    var iw = new google.maps.InfoWindow({
      position: lat_lng,
      content: comment
  　　 });
    iw.open(map);//コメントの表示
    }
  }
}

var loop = function(){//holeLayer2を時間差で表示する
  var holeLayer2 = [];//holeLayer2初期化
  var e = 0;
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position){
      var ido2 = position.coords.latitude; //取得した緯度
      var keido2 = position.coords.longitude; //取得した経度
      var gosa2 = position.coords.accuracy; //取得した精度
      console.log("緯度:"+ ido2);
      console.log("経度:"+ keido2);
      console.log("精度:"+ gosa2);
      if (gosa2 <= 25){
      //精度が５０m以下のときポリゴンを追加
        for (var i = 1; i < 101; i++) {
          holeLayer2.push(
            {lat: ido2 + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: keido2 + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
          );
        }
        holeLayer2.push(holeLayer2[0]);
        bounds[c] = new google.maps.LatLngBounds();
        var poly2 = new google.maps.Polygon({
        // map: map,
          paths: [holeLayer2]
        });
        for (var i = 0; i < holeLayer2.length; i++) {
          bounds[c].extend(new google.maps.LatLng(holeLayer2[i].lat, holeLayer2[i].lng));
        }
        var geometryFactory = new jsts.geom.GeometryFactory();
        var JSTSpoly2 = geometryFactory.createPolygon(
          geometryFactory.createLinearRing(googleMaps2JSTS(poly2.getPath())));
        JSTSpoly2.normalize();
        for (var i = 0; i < bounds.length - 1; i++){
          var response = bounds[i].intersects(bounds[c]); //ポリゴンが重なっているか判別
          if (response){ //重なって入れば
            JSTSpoly[i] = JSTSpoly[i].union(JSTSpoly2);//和集合を取る
            points[i + 1] = jsts2googleMaps(JSTSpoly[i]); //ポリゴンをgoogle mapに対応させる
            bounds[i] = bounds[i].union(bounds[c]); //境界線を結合
          }else{ //重なっていないとき
            e++;
          }
        }
        if (e == c){ //全てのポリゴンと重ならないとき
          JSTSpoly[c] = JSTSpoly2;
          holePoly[c] = jsts2googleMaps(JSTSpoly[c]); //ポリゴンをgoogle mapに対応させる
          points.push(holePoly[c]); //pointsに追加
          c++;
        }

        //ポリゴンとポリゴンが繋がったときの処理
        for (var j = 0; j < holePoly.length; j++){
          for (var k = 0; k < holePoly.length; k++){
            if (j != k){
              var response = bounds[j].intersects(bounds[k]);
              if (response){
                JSTSpoly[j] = JSTSpoly[j].union(JSTSpoly[k]);//和集合を取る
                points[j + 1] = jsts2googleMaps(JSTSpoly[j]); //ポリゴンをgoogle mapに対応させる
                points.splice(k + 1, 1); //ポリゴンを削除
                bounds[j] = bounds[j].union(bounds[k]); //境界線を結合
              }
            }
          }
        }

        x.setMap(null);//古いポリゴンを除去
        x = new google.maps.Polygon({
          paths: points,
          strokeColor: '#FFFFFF',
          strokeOpacity: 1.00,
          strokeWeight: 2,
          fillColor: '#FFFFFF',
          fillOpacity: 1.00
        });
        //マップ上にポリゴンを表示
        x.setMap(map);
        console.log(points);
        setTimeout(loop,5000);
      }else {
        loop();
      }
    },
    // 取得失敗した場合
    function(error) {
      switch(error.code) {
        case 1: //PERMISSION_DENIED
          alert("位置情報の利用が許可されていません");
          break;
        case 2: //POSITION_UNAVAILABLE
          alert("現在位置が取得できませんでした");
          break;
        case 3: //TIMEOUT
          alert("タイムアウトになりました");
          break;
        default:
          alert("その他のエラー(エラーコード:"+error.code+")");
          break;
        }
    },
    {
      enableHighAccuracy: true,
    }
  );
}

var canvas = document.createElement('canvas');
window.onload = function(){
  if ( checkFileApi() && checkCanvas(canvas) ){
    //ファイル選択
    var file_image = document.getElementById('file-image');
    file_image.addEventListener('change', selectReadfile, false);
  }
}
//canvas に対応しているか
function checkCanvas(canvas){
  if (canvas && canvas.getContext){
    return true;
  }
  alert('Not Supported Canvas.');
  return false;
}
// FileAPIに対応しているか
function checkFileApi() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    return true;
  }
  alert('The File APIs are not fully  in this browser.');
  return false;
}
//端末がモバイルか
var _ua = (function(u){
  var mobile = {
            0: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
            || u.indexOf("iphone") != -1
            || u.indexOf("ipod") != -1
            || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
            || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
            || u.indexOf("blackberry") != -1,
            iPhone: (u.indexOf("iphone") != -1),
            Android: (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
  };
  var tablet = (u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
            || u.indexOf("ipad") != -1
            || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
            || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
            || u.indexOf("kindle") != -1
            || u.indexOf("silk") != -1
            || u.indexOf("playbook") != -1;
  var pc = !mobile[0] && !tablet;
  return {
    Mobile: mobile,
    Tablet: tablet,
    PC: pc
  };
})(window.navigator.userAgent.toLowerCase());
//ファイルが選択されたら読み込む
function selectReadfile(e) {
  var file = e.target.files;
  var reader = new FileReader();
  //dataURL形式でファイルを読み込む
  reader.readAsDataURL(file[0]);
  //ファイルの読込が終了した時の処理
  reader.onload = function(){
    readDrawImg(reader, canvas, 0, 0);
  }
}
function readDrawImg(reader, canvas, x, y){
  var img = readImg(reader);
  img.onload = function(){
    var w = img.width;
    var h = img.height;
    printWidthHeight( 'src-width-height', true, w, h);
    // モバイルであればリサイズ
    if(_ua.Mobile[0]){
      var resize = resizeWidthHeight(1024, w, h);
      printWidthHeight( 'dst-width-height', resize.flag, resize.w, resize.h);
      drawImgOnCav(canvas, img, x, y, resize.w, resize.h);
    }else{
      // モバイル以外では元サイズ
      printWidthHeight( 'dst-width-height', false, 0, 0);
      drawImgOnCav(canvas, img, x, y, w, h);
    }
  }
}
//ファイルの読込が終了した時の処理
function readImg(reader){
  //ファイル読み取り後の処理
  var result_dataURL = reader.result;
  var img = new Image();
  img.src = result_dataURL;
  return img;
}
//キャンバスにImageを表示
function drawImgOnCav(canvas, img, x, y, w, h) {
  var img2 = new Image();
  img2.src = "star5.png";
  var ctx = canvas.getContext("2d");
  var options = {width: 250, height: 250};
  //img = median(img);
  //var ctx2 = document.createElement('canvas2').getContext('2d');
  // 画像ファイル名、画像読み込み完了後のコールバック関数を指定
  /*
  PixelCluster.load(img.src, function(data) {
  // 解像度
  var division = 100;
  console.log("zzzz");
  // 色数
  var color =6;
  // アルゴリズム指定
  var method = PixelCluster.KMEANS_PP;
  PixelCluster.perform(division, color, method, function(result) {
  PixelCluster.render(ctx, division, result);
  });
  });
  */
  SmartCrop.crop(img, options, function(result) {


  // 自動抽出されたトリミング情報を取得
  var crop = result.topCrop;
  canvas.width = img2.width;
  canvas.height = img2.height;

  //取得した座標を使って、画像を書き出し
  ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 130, 130, options.width, options.height);
  image = canvas.toDataURL();
  var marker = new google.maps.Marker({
    position: newlatlng,
    map: map,
    icon: {
      url: image,
      scaledSize: new google.maps.Size(100, 100)
    }
  });
    marker.addListener('click', function() { // マーカーをクリックしたとき
      var element2 = document.getElementById( "target" ) ;
      var radioNodeList2 = element.hoge ;
      var b = radioNodeList.value ;
      if (b == "アイコン削除"){
        marker.setMap(null);//アイコンの削除
      }
    });
  icon[iconNo] = marker;
  iconNo += 1;
  icon.setMap(map);//アイコン表示
  });
}
// リサイズ後のwidth, heightを求める
function resizeWidthHeight(target_length_px, w0, h0){
  //リサイズの必要がなければ元のwidth, heightを返す
  var length = Math.max(w0, h0);
  if(length <= target_length_px){
    return{
      flag: false,
      w: w0,
      h: h0
    };
  }
  //リサイズの計算
  var w1;
  var h1;
  if(w0 >= h0){
    w1 = target_length_px;
    h1 = h0 * target_length_px / w0;
  }else{
    w1 = w0 * target_length_px / h0;
    h1 = target_length_px;
  }
  return {
    flag: true,
    w: parseInt(w1),
    h: parseInt(h1)
  };
}
function printWidthHeight( width_height_id, flag, w, h) {
  var wh = document.getElementById(width_height_id);
  /*if(!flag){
    wh.innerHTML = "なし";
    return;
  }*/
  //wh.innerHTML = 'width:' + w + ' height:' + h;
}
