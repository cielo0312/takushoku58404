//Map.js
//35.625993799999996;//初期緯度
//139.27856060000002;//初期経度

var googleMaps2JSTS = function(boundaries) {
  //境界線の処理
  var coordinates = [];
  for (var i = 0; i < boundaries.getLength(); i++) {
    coordinates.push(new jsts.geom.Coordinate(
      boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
  }
  return coordinates;
};

var jsts2googleMaps = function(geometry) {
  //ジオメトリの処理
  var coordArray = geometry.getCoordinates();
  GMcoords = [];
  for (var i = 0; i < coordArray.length; i++) {
    GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
  }
  return GMcoords;
}

function getPosition() {
  // 現在地を取得
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position) {
    posLat = position.coords.latitude;
    posLng = position.coords.longitude;
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

function initialize() {
  //地図の表示
  navigator.geolocation.getCurrentPosition(
    // 取得成功した場合
    function(position) {
      var pos_lat = position.coords.latitude;
      var pos_lng = position.coords.longitude;
      var mapOptions = {
        zoom: 20,//地図の大きさ
        center: new google.maps.LatLng(pos_lat, pos_lng),//中心の位置情報
      };
      var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var holeLayer1 = []; //穴の緯度経度の配列
      var pos = map.getCenter(); //中心座標の取得
      var lat = pos.lat(); //緯度
      var lng = pos.lng(); //経度
      var lat25 = 0.00022457872; //緯度２５m
      var lng25 = 0.00027415956; //経度２５m
      var angle = 0.00549316406; //角度
      // 影の緯度経度
      var kageLayer = [
        //時計回り
        {lat: 46.33, lng: 148.4508},
        {lat: 24.26, lng: 148.4508},
        {lat: 24.26, lng: 125.5911},
        {lat: 46.33, lng: 125.5911},
        {lat: 46.33, lng: 148.4508},
      ];
      // 穴の緯度経度
      for (var i = 1; i < 65538; i++) {
        holeLayer1.push(
          //三角関数
          {lat: lat + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,
            lng: lng + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
          );
        }
        //円の終点
        holeLayer1.push(holeLayer1[0]);
      var bounds = new google.maps.LatLngBounds();
      //境界線取得
      var poly1 = new google.maps.Polygon({
        //ポリゴンの作成
        paths: [holeLayer1]
      });

      for (var i = 0; i < holeLayer1.length; i++) {
        //位置情報から境界線を割り振る
        bounds.extend(new google.maps.LatLng(holeLayer1[i].lat, holeLayer1[i].lng));
      }
      var geometryFactory = new jsts.geom.GeometryFactory();
      var JSTSpoly1 = geometryFactory.createPolygon(
        geometryFactory.createLinearRing(googleMaps2JSTS(poly1.getPath())));
      JSTSpoly1.normalize();//標準化処理
      var JSTSpolyUnion = JSTSpoly1;//holeLayer1を和集合ポリゴンに代入
      var outputPath = jsts2googleMaps(JSTSpolyUnion);
      var points = [kageLayer, outputPath];//pathを結合する
      var x = new google.maps.Polygon({
        paths: points,
        strokeColor: '#808080',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#808080',
        fillOpacity: 0.9
      });
      x.setMap(map);//mapにポリゴンを表示

      var loop = function(){//holeLayer2を時間差で表示する
        var holeLayer2 = [];//holeLayer2初期化
        x.setMap(null);//古いポリゴンを除去
        navigator.geolocation.getCurrentPosition(
          // 取得成功した場合
          function(position) {
          var posLat = position.coords.latitude;
          var posLng = position.coords.longitude;

        for (var i = 1; i < 65538; i++) {
          holeLayer2.push(
            //三角関数
            {lat: posLat + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,
              lng: posLng + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
            );
          }
          //円の終点
          holeLayer2.push(holeLayer2[0]);
        var poly2 = new google.maps.Polygon({
          //ポリゴンの作成
          paths: [holeLayer2]
        });
        for (var i = 0; i < holeLayer2.length; i++) {
          //位置情報から境界線を割り振る
          bounds.extend(new google.maps.LatLng(holeLayer2[i].lat, holeLayer2[i].lng));
        }
        var JSTSpoly2 = geometryFactory.createPolygon(
          geometryFactory.createLinearRing(googleMaps2JSTS(poly2.getPath())));
        JSTSpoly2.normalize();//標準化処理
        JSTSpolyUnion = JSTSpolyUnion.union(JSTSpoly2);//和集合を取る
        outputPath = jsts2googleMaps(JSTSpolyUnion);
        points = [kageLayer, outputPath];//pathの結合
        x = new google.maps.Polygon({
          paths: points,
          strokeColor: '#808080',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.9
        });
        //マップ上にポリゴンを表示
        x.setMap(map);
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
      setInterval(loop, 1000);//300ミリ秒後に実行
    },
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
