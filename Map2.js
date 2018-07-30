//Map.js
var holeLayer1 = []; //穴の緯度経度の配列
var map; //googleマップの情報を入れる
var holePoly = []; //穴の配列
var points = []; //地図に表示するポリゴンの配列
var bounds = []; //境界線の配列
var JSTSpoly = []; //取得したポリゴンの配列
var x; //ポリゴンのオプション
var c = 1;
var lat25 = 0.00022457872; //緯度２５m
var lng25 = 0.00027415956; //経度２５m
var angle = 3.6;//100角形の内角
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
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: new google.maps.LatLng(ido,keido),
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
                "color": "#9F945F"
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

        // 穴の緯度経度
        for (var i = 1; i < 101; i++) {//65538
          holeLayer1.push(
            {lat: lat + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: lng + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
          );
        }
        holeLayer1.push(holeLayer1[0]);
        bounds[0] = new google.maps.LatLngBounds();
        var poly1 = new google.maps.Polygon({
        // map: map,
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
          strokeColor: '#808080',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.95
        });
        x.setMap(map);//mapにポリゴンを表示
        setTimeout(loop,5000);
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
          strokeColor: '#808080',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.95
        });
        //マップ上にポリゴンを表示
        x.setMap(map);
        console.log(bounds);
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
