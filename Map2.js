//Map.js
var holeLayer1 = []; //穴の緯度経度の配列
var map; //googleマップの情報を入れる
var poly2; //holeLayer2の情報を入れる
var JSTSpoly = [];
var holePoly = [];
var points = [];
var bounds = [];
var outputPath;
var extraPath = [];
var count = 0;
var x; //ポリゴンのオプション
var c = 1;
// 影の緯度経度
var kageLayer = [
  //時計回り
  {lat: 46.33, lng: 148.4508},
  {lat: 24.26, lng: 148.4508},
  {lat: 24.26, lng: 125.5911},
  {lat: 46.33, lng: 125.5911},
  {lat: 46.33, lng: 148.4508},
];
var lat25 = 0.00022457872; //緯度２５m
var lng25 = 0.00027415956; //経度２５m
var angle = 3.6;//100
//0.072;500
//0.036;10000
//var angle = 0.00549316406; //角度 65537
//var ido = 35.625993799999996;
//var keido = 139.27856060000002;
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
/*
function getPosition() {
  // 現在地を取得
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position) {
      ido = position.coords.latitude;
      keido = position.coords.longitude;
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
*/

function initialize() {
  //getPosition();
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position) {
      var ido = position.coords.latitude; //取得した緯度
      var keido = position.coords.longitude; //取得した経度
      var gosa = position.coords.accuracy; //取得した精度
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
        holePoly[0] = JSTSpoly1;//holeLayer1を和集合ポリゴンに代入
        outputPath = jsts2googleMaps(holePoly[0]);
        points = [kageLayer, outputPath];//pathを結合する
        x = new google.maps.Polygon({
          paths: points,
          strokeColor: '#808080',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.95
        });
        x.setMap(map);//mapにポリゴンを表示
        setInterval(loop,5000);
      }else{
      //精度が３１m以上のときもう一度取得し直し
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
    function(position) {
      var ido2 = position.coords.latitude; //取得した緯度
      var keido2 = position.coords.longitude; //取得した経度
      var gosa2 = position.coords.accuracy; //取得した精度
      if (gosa2 <= 25){
      //精度が５０m以下のときポリゴンを追加
        for (var i = 1; i < 101; i++) {
          holeLayer2.push(
            {lat: ido2 + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: keido2 + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
          );
        }
        holeLayer2.push(holeLayer2[0]);
        bounds[1] = new google.maps.LatLngBounds();
        poly2 = new google.maps.Polygon({
        // map: map,
          paths: [holeLayer2]
        });
        for (var i = 0; i < holeLayer2.length; i++) {
          bounds[1].extend(new google.maps.LatLng(holeLayer2[i].lat, holeLayer2[i].lng));
        }
        var geometryFactory = new jsts.geom.GeometryFactory();
        JSTSpoly[c] = geometryFactory.createPolygon(
          geometryFactory.createLinearRing(googleMaps2JSTS(poly2.getPath())));
        JSTSpoly[c].normalize();
        for(var i = 0; i < bounds.length - 1; i++){
          var response = bounds[i].intersects(bounds[c]) ;
          if (response){
            holePoly[i] = holePoly[i].union(JSTSpoly[c]);//和集合を取る
            points[1] = jsts2googleMaps(JSTSpolyUnion);
            bounds[i] = bounds[i].union(bounds[c]);
          }else{
            e++;
          /*
          extraPath[count] = jsts2googleMaps(JSTSpoly2);
          points.push(extraPath[count]);
          count++;
          */
          }
        }
        if (e == c){
          holePoly[c] = jsts2googleMaps(JSTSpoly[c]);
          points.push(holePoly[c]);
          c++;
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
        //map.fitBounds(bounds);
        //setTimeout(loop, 5000);//5000ミリ秒後に実行
      }else {
        loop();
        //精度が５１m以上のときもう一度取得し直し
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
