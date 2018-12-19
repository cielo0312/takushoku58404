//Map.js
var start_pos;
var holeLayer1 = []; //穴の緯度経度の配列
var map; //googleマップの情報を入れる
var holePoly = []; //穴の配列
var points = []; //地図に表示するポリゴンの配列
var bounds = []; //境界線の配列
var JSTSpoly = []; //取得したポリゴンの配列
var x; //ポリゴンのオプション
var c = 1;
var iconNo = 0;
var picture;
var i = 0;
var icon = [];
var lat25 = 0.00022457872; //緯度２５m
var lng25 = 0.00027415956; //経度２５m
var angle = 3.6;//100角形の内角
var gmap;
var test;
var test2;
var comment_save = [];
var comment_pos = [];
var iconArray = [];
var latlngArray = [];
var subIconArray = [];
var sublatlngArray = [];
var newlatlng;
var iconlatlng;
var lat_lng2;
var iconPosition;
var iconCounter = 0;
var iconhokan = [];
var flag = [];
var user;
var set_img;
var set_x;
var set_y;
var set_w;
var set_h;
var id = 1;
var result_img;
var poly = [];
var polypath = [];
var flag = 0;
var frameimg = new Image;
var mapColor = "#00f900";
var polypath1 = [];
var mode;
var db = new Dexie("地図データ");
db.version(1).stores({
  mapdata: "++id"
});
db.open();
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

var frameimg = new Image;

function initialize1() {
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

            if(gosa <= 2000){
              //精度が６０m以下の時にポリゴンを表示
                mode = 1;
                start_pos = new google.maps.LatLng(ido,keido);
                newlatlng = new google.maps.LatLng(ido,keido);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 19,
                    center: new google.maps.LatLng(ido,keido),
                    minZoom : 8.5,//３０km
                    styles: [{
                        "stylers": [{
                            "visibility": "off"
                        }]
                    },{
                          "featureType": "water",
                          "stylers": [{
                              "visibility": "on"
                          },{
                              "color": "#000000"
                            }]
                      },{
                            "featureType": "landscape",
                            "stylers": [{
                                "visibility": "on"
                            },{
                                "color": "#000000"
                              }]
                        },{
                            "featureType": "administrative",
                            "elementType": "geometry.stroke",
                            "stylers": [{
                                "visibility": "on"
                            },{
                                "color": "#000000"
                              },{
                                  "weight": 1
                                }]
                          },{
                                "featureType": "road",
                                "stylers": [{
                                    "visibility": "on"
                                },{
                                    "color": "#000000"
                                  }]
                            },{
                                "elementType": "labels",
                                "stylers": [{
                                    "visibility": "off"
                                }]
                              }]
                });

                var pos = map.getCenter(); //中心座標の取得
                var lat = pos.lat(); //緯度
                var lng = pos.lng(); //経度
                gmap = map;
                // 穴の緯度経度
                for (var i = 1; i < 101; i++) {
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
                    console.log(bounds);
                    x = new google.maps.Polygon({
                        paths: points,
                        strokeColor: '#000000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                        fillColor: '#000000',
                        fillOpacity: 1.0
                    });

                    x.setMap(map);//mapにポリゴンを表示
                    user = new google.maps.Marker({
                        position: newlatlng,
                        map: map,
                        icon: {
                            url: "sakuseichu.png",
                            scaledSize: new google.maps.Size(300, 300)
                        }
                    });

                    map.addListener('click', function(e) {//クリックした時の処理
                        getClickLatLng(e.latLng, map);
                    });

                    setTimeout(loop1,1000);//５秒後に実行
            }else{
                initialize1();
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

function initialize2() {
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

            if(gosa <= 2000){
  　             //精度が2000以下の時にポリゴンを表示
                mode = 2;
                newlatlng = new google.maps.LatLng(ido,keido);
                start_pos = new google.maps.LatLng(ido,keido);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 18,
                    center: new google.maps.LatLng(ido,keido),
                    minZoom : 8.5,//３０km
                    mapTypeControl: false,/*マップタイプ・コントローラの制御*/
                    scaleControl: false,/*地図のスケールコントローラの表示*/
                    streetViewControl: false,/*ストリートビューの表示*/
                    scrollwheel: false,/*ホイール操作でのズーム値の変更*/
                    zoomControl: false,
                    fullscreenControl: false,
                    styles: [{
                        "stylers": [{
                            "visibility": "off"
                        }]
                    },{
                          "featureType": "water", //水
                          "stylers": [{
                              "visibility": "on"
                          },{
                              "color": "#9CA7E2"
                            }]
                      },{
                            "featureType": "landscape", //風景
                            "stylers": [{
                                "visibility": "on"
                            },{
                                "color": mapColor
                              }]
                        },{
                            "featureType": "administrative", //行政区画
                            "elementType": "geometry.stroke",
                            "stylers": [{
                                "visibility": "on"
                            },{
                                "color": "#2f343b"
                              },{
                                  "weight": 1
                                }]
                          },{
                                "featureType": "road", //道の表示形式
                                "stylers": [{
                                    "visibility": "on"
                                },{
                                    "color": "#DDDED3"
                                  }]
                            },{
                                "elementType": "labels", //地名などの表示
                                "stylers": [{
                                    "visibility": "off"
                                }]
                              }]
                });

                var pos = map.getCenter(); //中心座標の取得
                var lat = pos.lat(); //緯度
                var lng = pos.lng(); //経度
                /*
                polypath.push(new google.maps.LatLng(lat, lng));
                var polyline = new google.maps.Polyline({
	                   map: map,
	                   path: polypath,
                });
                */
                for (var i = 1; i < 101; i++) {
                    polypath1.push(
                        {lat: lat + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: lng + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
                    );
                }
                polypath1.push(polypath1[0]);
                bounds[0] = new google.maps.LatLngBounds();
                var poly1 = new google.maps.Polygon({
                    paths: [polypath1]
                });
                for (var i = 0; i < polypath1.length; i++) {
                    bounds[0].extend(new google.maps.LatLng(polypath1[i].lat, polypath1[i].lng));
                }
                var geometryFactory = new jsts.geom.GeometryFactory();
                var JSTSpoly1 = geometryFactory.createPolygon(
                    geometryFactory.createLinearRing(googleMaps2JSTS(poly1.getPath())));
                    JSTSpoly1.normalize();
                    JSTSpoly[0] = JSTSpoly1
                    poly[0] = jsts2googleMaps(JSTSpoly[0]);//holeLayer1を和集合ポリゴンに代入
                    points.push(poly[0]);//pathを結合する
                    x = new google.maps.Polygon({
                        paths: points,
                        strokeColor: '#0000ff',
                        strokeOpacity: 0.0,
                        strokeWeight: 2,
                        fillColor: '#0000ff',
                        fillOpacity: 0.5
                    });

                    x.setMap(map);//mapにポリゴンを表示
                    user = new google.maps.Marker({
                        position: newlatlng,
                        map: map,
                        icon: {
                            url: "aruku.png",
                            scaledSize: new google.maps.Size(50, 50)
                        }
                    });

                map.addListener('click', function(e) {//クリックした時の処理
                    getClickLatLng(e.latLng, map);
                });
                    setTimeout(loop2(/*polyline*/),1000);//1秒後に実行
            }else{
                initialize2();
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
        setTimeout("on()",1000);
        lat_lng2 = lat_lng;
    }

    if(a == "コメント"){
        //コメント
        var comment = window.prompt("何かひとこと", "");
        if(comment != "" && comment != null){
            comment_save.push(comment);
            comment_pos.push(lat_lng);
            var iw = new google.maps.InfoWindow({
                position: lat_lng,
                content: comment
            });
            iw.open(map);//コメントの表示
        }
    }
}

var loop1 = function(){//holeLayer2を時間差で表示する
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
            if (gosa2 <= 2000){
                newlatlng = new google.maps.LatLng(ido2,keido2);
                //精度が６０m以下のときポリゴンを追加
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
                strokeColor: '#000000',
                strokeOpacity: 1.00,
                strokeWeight: 2,
                fillColor: '#000000',
                fillOpacity: 1.00
            });
            //マップ上にポリゴンを表示
            x.setMap(map);
            user.setMap(null);
            user = new google.maps.Marker({
                position: newlatlng,
                map: map,
                icon: {
                    url: "sakuseichu.png",
                    scaledSize: new google.maps.Size(300, 300)
                }
            });
            setTimeout(loop1,1000);
            }else {
                loop1();
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

function loop2(/*polyline*/){//holeLayer2を時間差で表示する
              /*
                //精度が６０m以下のときポリゴンを追加
                polypath.push(new google.maps.LatLng(ido2, keido2));
                polyline.setPath(polypath);*/
                var polypath2 = [];//holeLayer2初期化
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
                        if (gosa2 <= 2000){
                            newlatlng = new google.maps.LatLng(ido2,keido2);
                            //精度が６０m以下のときポリゴンを追加
                            for (var i = 1; i < 101; i++) {
                                polypath2.push(
                                    {lat: ido2 + lat25 * Math.sin( angle * i * (Math.PI / 180) ) ,lng: keido2 + lng25 * Math.cos( angle * i * (Math.PI / 180) )}
                                );
                            }
                            polypath2.push(polypath2[0]);
                            bounds[c] = new google.maps.LatLngBounds();
                            var poly2 = new google.maps.Polygon({
                                // map: map,
                                paths: [polypath2]
                            });
                            for (var i = 0; i < polypath2.length; i++) {
                                bounds[c].extend(new google.maps.LatLng(polypath2[i].lat, polypath2[i].lng));
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
                            poly[c] = jsts2googleMaps(JSTSpoly[c]); //ポリゴンをgoogle mapに対応させる
                            points.push(poly[c]); //pointsに追加
                            c++;
                        }

                        //ポリゴンとポリゴンが繋がったときの処理
                        for (var j = 0; j < poly.length; j++){
                            for (var k = 0; k < poly.length; k++){
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
                            strokeColor: '#0000ff',
                            strokeOpacity: 0.0,
                            strokeWeight: 2,
                            fillColor: '#0000ff',
                            fillOpacity: 0.5
                        });
                        //マップ上にポリゴンを表示
                        x.setMap(map);
                        user.setMap(null);
                        user = new google.maps.Marker({
                            position: newlatlng,
                            map: map,
                            icon: {
                                url: "aruku.png",
                                scaledSize: new google.maps.Size(50, 50)
                            }
                        });

            setTimeout(loop2(/*polyline*/),1000);
            } else {
                loop2(/*polyline*/);
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
        picture = file_image;
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
    result_img = file;
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
            set_img = img;
            set_x = x;
            set_y = y;
            set_w = resize.w;
            set_h = resize.h;
            on3();
            //drawImgOnCav(canvas, img, x, y, resize.w, resize.h);
        }else{
            // モバイル以外では元サイズ
            printWidthHeight( 'dst-width-height', false, 0, 0);
            set_img = img;
            set_x = x;
            set_y = y;
            set_w = w;
            set_h = h;
            on3();
            //drawImgOnCav(canvas, img, x, y, w, h);
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
    var ctx = canvas.getContext("2d");
    var options = {width: 250, height: 250};
    SmartCrop.crop(img, options, function(result) {

        // 自動抽出されたトリミング情報を取得
        var crop = result.topCrop;
        canvas.width = frameimg.width;
        canvas.height = frameimg.height;
        //取得した座標を使って、画像を書き出し
        ctx.drawImage(frameimg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 130, 130, options.width, options.height);
        var markerimg = canvas.toDataURL();
        //iconhokan.push(markerimg);
        iconArray.push(markerimg);
        latlngArray.push(newlatlng);
        var marker = new google.maps.Marker({
            position: newlatlng,
            map: map,
            icon: {
                url: markerimg,
                scaledSize: new google.maps.Size(150, 150)
            }
        });

        marker.addListener('click', function() { // マーカーをクリックしたとき
            if (marker.icon.scaledSize.width == 150){
                var iconzoom = {
                    icon: {
                        url: markerimg,
                        scaledSize: new google.maps.Size(360, 360)
                    }
                }
                marker.setOptions(iconzoom);
                setTimeout(resize, 6000, marker, markerimg);
            }else {
                var iconzoom = {
                    icon: {
                        url: markerimg,
                        scaledSize: new google.maps.Size(150, 150)
                    }
                }
                marker.setOptions(iconzoom);
            }

        });

        marker.addListener('dblclick', function() { // マーカーをクリックしたとき
            var element2 = document.getElementById( "target" ) ;
            var radioNodeList2 = element2.hoge ;
            var b = radioNodeList2.value ;
            if (b == "アイコン削除"){
                //icon[iconNo] = void 0;//void 0 によりundefinedを代入
                marker.setMap(null);//アイコンの削除
                var num = iconArray.indexOf(markerimg);
                iconArray.splice(num, 1);
                latlngArray.splice(num, 1);
            } else {
                var irasuto_result = window.confirm("イラストを描きますか？");
                if (irasuto_result){
                    localStorage.setItem("sample", markerimg);
                    var subWin = window.open("oekaki.html","sub");

                    iconPosition = marker.getPosition();
                    //icon[iconNo] = void 0;//void 0 によりundefinedを代入
                    marker.setMap(null);
                    var num2 = iconArray.indexOf(markerimg);
                    iconArray.splice(num2, 1);
                    latlngArray.splice(num2, 1);
                }
            }
        });
        marker.setMap(null);
    });
}

function resize(marker, markerimg){
  var iconzoom = {
      icon: {
          url: markerimg,
          scaledSize: new google.maps.Size(150, 150)
      }
  }
  marker.setOptions(iconzoom);
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
    } else {
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
}

function irasutoka(imgData) {
    var canvas2 = document.createElement('canvas');
    var irasutoimg = new Image();
    irasutoimg.src = imgData;
    //var obj = document.getElementById("kimoti");
    //var kimoti = obj.value;
    var ctx = canvas2.getContext("2d");
    var options = {width: 250, height: 250};
    canvas2.width = frameimg.width;
    canvas2.height = frameimg.height;
    //取得した座標を使って、画像を書き出し
    ctx.drawImage(frameimg, 0, 0, canvas2.width, canvas2.height);
    ctx.drawImage(irasutoimg, 0, 0, irasutoimg.width, irasutoimg.height, 130, 130, options.width, options.height);
    var image = canvas2.toDataURL();
    console.log(irasutoimg);
    //console.log(test);
    iconArray.push(image);
    latlngArray.push(iconPosition);
    var marker = new google.maps.Marker({
        position: iconPosition,
        map: map,
        icon: {
            url: image,
            scaledSize: new google.maps.Size(150, 150)
        }
    });
    marker.addListener('click', function() { // マーカーをクリックしたとき
        if (marker.icon.scaledSize.width == 150){
            var iconzoom = {
                //position: newlatlng,
                //map: map,
                icon: {
                    url: image,
                    scaledSize: new google.maps.Size(360, 360)
                }
            }
            marker.setOptions(iconzoom);
            setTimeout(resize, 6000, marker, image);
        }else {
            var iconzoom = {
                //position: newlatlng,
                //map: map,
                icon: {
                    url: image,
                    scaledSize: new google.maps.Size(150, 150)
                }
            }
            marker.setOptions(iconzoom);
        }

    });

    marker.addListener('dblclick', function() { // マーカーをクリックしたとき
        var element2 = document.getElementById( "target" ) ;
        var radioNodeList2 = element2.hoge ;
        var b = radioNodeList2.value ;
        if (b == "アイコン削除"){
            //icon[iconNo] = void 0;//void 0 によりundefinedを代入
            marker.setMap(null);//アイコンの削除
            var num3 = iconArray.indexOf(image);
            iconArray.splice(num3, 1);
            latlngArray.splice(num3, 1);
        } else {
            var irasuto_result = window.confirm("イラストを描きますか？");
            if (irasuto_result){
                localStorage.setItem("sample", image);
                var subWin = window.open("oekaki.html","sub");
                iconPosition = marker.getPosition();
                //icon[iconNo] = void 0;//void 0 によりundefinedを代入
                marker.setMap(null);
                var num4 = iconArray.indexOf(image);
                iconArray.splice(num4, 1);
                latlngArray.splice(num4, 1);
            }
        }
    });
}
//フレーム画像の選択
function frame (select_kimoti){
  var kimoti = select_kimoti.id;
  console.log(kimoti);
    switch (kimoti) {
        case "bikkuri":
        frameimg.src = "star5.png";
        break;

        case "heart":
        frameimg.src = "heart.png";
        break;

        case "jaaku":
        frameimg.src = "kowai.png";
        break;

        case "hatena":
        frameimg.src = "hatena.png";
        break;

        case "hikari":
        frameimg.src = "hikari.png";
        break;
    }
    drawImgOnCav(canvas, set_img, set_x, set_y, set_w, set_h);
}

function on() {
    document.getElementById("overlay").style.display = "block";
}

function on2() {
    document.getElementById("overlay2").style.display = "block";
}

function on3() {
    document.getElementById("overlay3").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}

function off2() {
    document.getElementById("overlay2").style.display = "none";
}

function off3() {
    document.getElementById("overlay3").style.display = "none";
}

function imgClick(select_icon){
    var selectID = select_icon.id;
    console.log(selectID);
    var dficon = new Image;
    switch (selectID) {
        case "WC":
            var marker = new google.maps.Marker({
                position: lat_lng2,
                map: map,
                icon: {
                    url: "WC.png",
                    scaledSize: new google.maps.Size(70, 70)
                }
            });
            marker.addListener('click', function() { // マーカーをクリックしたとき
                var element2 = document.getElementById( "target" ) ;
                var radioNodeList2 = element2.hoge ;
                var b = radioNodeList2.value ;
                if (b == "アイコン削除"){
                    marker.setMap(null);//アイコンの削除
                    var subnum = subIconArray.indexOf(lat_lng2);
                    subIconArray.splice(subnum, 1);
                    latlngArray.splice(subnum, 1);
                }
            });
            subIconArray.push("WC.png");
            sublatlngArray.push(lat_lng2);
            break;

        case "jihannki":
            var marker = new google.maps.Marker({
                position: lat_lng2,
                map: map,
                icon: {
                    url: "jihannki.png",
                    scaledSize: new google.maps.Size(70, 70)
                }
            });
            marker.addListener('click', function() { // マーカーをクリックしたとき
                var element2 = document.getElementById( "target" ) ;
                var radioNodeList2 = element2.hoge ;
                var b = radioNodeList2.value ;
                if (b == "アイコン削除"){
                    marker.setMap(null);//アイコンの削除
                    var subnum = subIconArray.indexOf(lat_lng2);
                    subIconArray.splice(subnum, 1);
                    latlngArray.splice(subnum, 1);
                }
            });
            subIconArray.push("jihannki.png");
            sublatlngArray.push(lat_lng2);
            break;

        case "shokuji":
            var marker = new google.maps.Marker({
                position: lat_lng2,
                map: map,
                icon: {
                    url: "shokuji.png",
                    scaledSize: new google.maps.Size(70, 70)
                }
            });
            marker.addListener('click', function() { // マーカーをクリックしたとき
                var element2 = document.getElementById( "target" ) ;
                var radioNodeList2 = element2.hoge ;
                var b = radioNodeList2.value ;
                if (b == "アイコン削除"){
                    marker.setMap(null);//アイコンの削除
                    var subnum = subIconArray.indexOf(lat_lng2);
                    subIconArray.splice(subnum, 1);
                    latlngArray.splice(subnum, 1);
                }
            });
            subIconArray.push("shokuji.png");
            sublatlngArray.push(lat_lng2);
            break;

        case "bus":
            var marker = new google.maps.Marker({
                position: lat_lng2,
                map: map,
                icon: {
                    url: "bus.png",
                    scaledSize: new google.maps.Size(70, 70)
                }
            });
            marker.addListener('click', function() { // マーカーをクリックしたとき
                var element2 = document.getElementById( "target" ) ;
                var radioNodeList2 = element2.hoge ;
                var b = radioNodeList2.value ;
                if (b == "アイコン削除"){
                    marker.setMap(null);//アイコンの削除
                    var subnum = subIconArray.indexOf(lat_lng2);
                    subIconArray.splice(subnum, 1);
                    latlngArray.splice(subnum, 1);
                }
            });
            subIconArray.push("bus.png");
            sublatlngArray.push(lat_lng2);
            break;
    }
}

function attachMessage(marker, markerimg2) {
    google.maps.event.addListener(marker, 'click', function() {
      new google.maps.Geocoder().geocode({
        latLng: marker.getPosition()
      }, function(result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (marker.icon.scaledSize.width == 150){
              var iconzoom = {
                  icon: {
                      url: markerimg2,
                      scaledSize: new google.maps.Size(360, 360)
                  }
              }
              marker.setOptions(iconzoom);
              setTimeout(resize, 6000, marker, markerimg2);
          }else {
              var iconzoom = {
                  icon: {
                      url: markerimg2,
                      scaledSize: new google.maps.Size(150, 150)
                  }
              }
              marker.setOptions(iconzoom);
          }
        }
      });
    });

    marker.addListener('dblclick', function() { // マーカーをクリックしたとき
        var element2 = document.getElementById( "target" ) ;
        var radioNodeList2 = element2.hoge ;
        var b = radioNodeList2.value ;
        if (b == "アイコン削除"){
            //icon[iconNo] = void 0;//void 0 によりundefinedを代入
            marker.setMap(null);//アイコンの削除
            var num5 = iconArray.indexOf(markerimg2);
            iconArray.splice(num5, 1);
            latlngArray.splice(num5, 1);
        } else {
            var irasuto_result = window.confirm("イラストを描きますか？");
            if (irasuto_result){
                localStorage.setItem("sample", markerimg2);
                var subWin = window.open("freeHandWrite2.html","sub");
                iconPosition = marker.getPosition();
                //icon[iconNo] = void 0;//void 0 によりundefinedを代入
                marker.setMap(null);
                var num6 = iconArray.indexOf(markerimg2);
                iconArray.splice(num6, 1);
                latlngArray.splice(num6, 1);
            }
        }
    });
}

function sub_attachMessage(submarker) {
   google.maps.event.addListener(submarker, 'click', function() {
     new google.maps.Geocoder().geocode({
       latLng: submarker.getPosition()
     }, function(result, status) {
       if (status == google.maps.GeocoderStatus.OK) {
         submarker.addListener('click', function() { // マーカーをクリックしたとき
             var element2 = document.getElementById( "target" ) ;
             var radioNodeList2 = element2.hoge ;
             var b = radioNodeList2.value ;
             if (b == "アイコン削除"){
                 submarker.setMap(null);//アイコンの削除
             }
         });
       }
     });
   });
 }
/*
function hozon(){
  //
  // Manipulate and Query Database
  //
  console.log(points);
  var pointsJ = JSON.stringify(points);
  var boundsJ = JSON.stringify(bounds);
  test2 = JSON.stringify(test2);
  console.log(pointsJ);
  db.mapdata.update(id, {points: pointsJ, icon: test, latlng: test2});
}

function load(){
    db.mapdata.get(1).then(function (data){
      points = JSON.parse(data.points);
      console.log(points);
                  map = new google.maps.Map(document.getElementById('map'), {
                      zoom: 19,
                      center: new google.maps.LatLng(37.912021,139.061871),
                      minZoom : 8.5,//３０km
                      styles: [{
                          "stylers": [{
                              "visibility": "off"
                          }]
                      },{
                            "featureType": "water",
                            "stylers": [{
                                "visibility": "on"
                            },{
                                "color": "#9CA7E2"
                              }]
                        },{
                              "featureType": "landscape",
                              "stylers": [{
                                  "visibility": "on"
                              },{
                                  "color": "#00FF41"
                                }]
                          },{
                              "featureType": "administrative",
                              "elementType": "geometry.stroke",
                              "stylers": [{
                                  "visibility": "on"
                              },{
                                  "color": "#2f343b"
                                },{
                                    "weight": 1
                                  }]
                            },{
                                  "featureType": "road",
                                  "stylers": [{
                                      "visibility": "on"
                                  },{
                                      "color": "#DDDED3"
                                    }]
                              },{
                                  "elementType": "labels",
                                  "stylers": [{
                                      "visibility": "off"
                                  }]
                                }]
                  });
                  var pos = map.getCenter(); //中心座標の取得
                  var lat = pos.lat(); //緯度
                  var lng = pos.lng(); //経度
                  gmap = map;
                  x = new google.maps.Polygon({
                      paths: points,
                      strokeColor: '#FFFFFF',
                      strokeOpacity: 1.0,
                      strokeWeight: 2,
                      fillColor: '#FFFFFF',
                      fillOpacity: 1.0
                  });
                  x.setMap(map);//mapにポリゴンを表示
                  map.addListener('click', function(e) {//クリックした時の処理
                      getClickLatLng(e.latLng, map);
                  });
                  //setTimeout(loop1,1000);//1秒後に実行
                });
              }
*/
function hozon(){
  //test2 = JSON.stringify(test2);
  db.mapdata.put({id: 1, mode:mode,start: JSON.stringify(start_pos), points: JSON.stringify(points),icon: JSON.stringify(iconArray), subIcon: JSON.stringify(subIconArray),
    latlng: JSON.stringify(latlngArray), sublatlng: JSON.stringify(sublatlngArray), comment: JSON.stringify(comment_save),
    comment_pos: JSON.stringify(comment_pos)});
}


function load(){
  db.mapdata.get(1).then(function (data){
    //test = data.icon;
    //console.log(test);
    start_pos = JSON.parse(data.start);
    points = JSON.parse(data.points);
    iconArray = JSON.parse(data.icon);
    subIconArray = JSON.parse(data.subIcon);
    latlngArray = JSON.parse(data.latlng);
    sublatlngArray = JSON.parse(data.sublatlng);
    if(mode == 1){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 19,
        center: start_pos,
        minZoom : 8.5,//３０km
        styles: [{
            "stylers": [{
                "visibility": "off"
            }]
        },{
              "featureType": "water",
              "stylers": [{
                  "visibility": "on"
              },{
                  "color": "#9CA7E2"
                }]
          },{
                "featureType": "landscape",
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": "#00FF41"
                  }]
            },{
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": "#2f343b"
                  },{
                      "weight": 1
                    }]
              },{
                    "featureType": "road",
                    "stylers": [{
                        "visibility": "on"
                    },{
                        "color": "#DDDED3"
                      }]
                },{
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "off"
                    }]
                  }]
    });
    var pos = map.getCenter(); //中心座標の取得
    var lat = pos.lat(); //緯度
    var lng = pos.lng(); //経度
    gmap = map;
    x = new google.maps.Polygon({
        paths: points,
        strokeColor: '#FFFFFF',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        fillColor: '#FFFFFF',
        fillOpacity: 1.0
    });
    x.setMap(map);//mapにポリゴンを表示
    map.addListener('click', function(e) {//クリックした時の処理
        getClickLatLng(e.latLng, map);
    });

  }
  else{
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: start_pos,
        minZoom : 8.5,//３０km
        mapTypeControl: false,/*マップタイプ・コントローラの制御*/
        scaleControl: false,/*地図のスケールコントローラの表示*/
        streetViewControl: false,/*ストリートビューの表示*/
        scrollwheel: false,/*ホイール操作でのズーム値の変更*/
        zoomControl: false,
        fullscreenControl: false,
        styles: [{
            "stylers": [{
                "visibility": "off"
            }]
        },{
              "featureType": "water", //水
              "stylers": [{
                  "visibility": "on"
              },{
                  "color": "#9CA7E2"
                }]
          },{
                "featureType": "landscape", //風景
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": mapColor
                  }]
            },{
                "featureType": "administrative", //行政区画
                "elementType": "geometry.stroke",
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": "#2f343b"
                  },{
                      "weight": 1
                    }]
              },{
                    "featureType": "road", //道の表示形式
                    "stylers": [{
                        "visibility": "on"
                    },{
                        "color": "#DDDED3"
                      }]
                },{
                    "elementType": "labels", //地名などの表示
                    "stylers": [{
                        "visibility": "off"
                    }]
                  }]
    });

    var pos = map.getCenter(); //中心座標の取得
    var lat = pos.lat(); //緯度
    var lng = pos.lng(); //経度
    /*
    polypath.push(new google.maps.LatLng(lat, lng));
    var polyline = new google.maps.Polyline({
         map: map,
         path: polypath,
    });
    */
        x = new google.maps.Polygon({
            paths: points,
            strokeColor: '#0000ff',
            strokeOpacity: 0.0,
            strokeWeight: 2,
            fillColor: '#0000ff',
            fillOpacity: 0.5
        });

        x.setMap(map);//mapにポリゴンを表示

    map.addListener('click', function(e) {//クリックした時の処理
        getClickLatLng(e.latLng, map);
    });
  }

    for (var i = 0; i < iconArray.length; i++){
      var markerimg2 = iconArray[i];
      var iconlatlng2 = latlngArray[i];
      var marker = new google.maps.Marker({
          position: iconlatlng2,
          map: map,
          icon: {
            url: markerimg2,
            scaledSize: new google.maps.Size(150, 150)
          }
      });

/*
      marker.addListener('click', function() { // マーカーをクリックしたとき
          if (marker.icon.scaledSize.width == 150){
              var iconzoom = {
                  //position: newlatlng,
                  //map: map,
                  icon: {
                      url: markerimg2,
                      scaledSize: new google.maps.Size(360, 360)
                  }
              }
              marker.setOptions(iconzoom);
              setTimeout(resize, 6000, marker, markerimg2);
          }else {
              var iconzoom = {
                  //position: newlatlng,
                  //map: map,
                  icon: {
                      url: markerimg2,
                      scaledSize: new google.maps.Size(150, 150)
                  }
              }
              marker.setOptions(iconzoom);
          }

      });

      marker.addListener('dblclick', function() { // マーカーをクリックしたとき
          var element2 = document.getElementById( "target" ) ;
          var radioNodeList2 = element2.hoge ;
          var b = radioNodeList2.value ;
          if (b == "アイコン削除"){
              //icon[iconNo] = void 0;//void 0 によりundefinedを代入
              marker.setMap(null);//アイコンの削除
              var num5 = iconArray.indexOf(markerimg2);
              iconArray.splice(num5, 1);
              latlngArray.splice(num5, 1);
          } else {
              var irasuto_result = window.confirm("イラストを描きますか？");
              if (irasuto_result){
                  localStorage.setItem("sample", markerimg2);
                  var subWin = window.open("freeHandWrite2.html","sub");
                  iconPosition = marker.getPosition();
                  //icon[iconNo] = void 0;//void 0 によりundefinedを代入
                  marker.setMap(null);
                  var num6 = iconArray.indexOf(markerimg2);
                  iconArray.splice(num6, 1);
                  latlngArray.splice(num6, 1);
              }
          }
      });
      */
      attachMessage(marker, markerimg2);

    }


    for (var j = 0; j < subIconArray.length; j++){
      var subIcon = subIconArray[j];
      var submarker = new google.maps.Marker({
          position: sublatlngArray[j],
          map: map,
          icon: {
              url: subIcon,
              scaledSize: new google.maps.Size(70, 70)
          }
      });
      sub_attachMessage(submarker);
    }

  });
}


function comment_load(){
    db.mapdata.get(1).then(function (data){
        comment_save = JSON.parse(data.comment);
        comment_pos = JSON.parse(data.comment_pos);
        for(var k = 0; k < comment_save.length; k++){
            if(comment_save[k] != "" && comment_save[k] != null){
                var iw = new google.maps.InfoWindow({
                    position: comment_pos[k],
                    content: comment_save[k]
                });
                iw.open(map);//コメントの表示
            }
        }
    });
}

function dataClear(){
  db.delete().then(() => {
    console.log("Database successfully deleted");
}).catch((err) => {
    console.error("Could not delete database");
}).finally(() => {
    // Do what should be done next...
});
}

function colorChange(color){
    //var colorID = color.id;
    switch (color.id) {
      case "red":
          mapColor = "#CC0000";
        break;
      case "blue":
          mapColor = "#0C00CC";
        break;
      case "green":
          mapColor = "#00FF41";
        break;
      case "black":
          mapColor = "#262626";
        break;
    }
    var mapOPT = {

        styles: [{
            "stylers": [{
                "visibility": "off"
            }]
        },{
              "featureType": "water",
              "stylers": [{
                  "visibility": "on"
              },{
                  "color": "#9CA7E2"
                }]
          },{
                "featureType": "landscape",
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": mapColor
                  }]
            },{
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "visibility": "on"
                },{
                    "color": "#2f343b"
                  },{
                      "weight": 1
                    }]
              },{
                    "featureType": "road",
                    "stylers": [{
                        "visibility": "on"
                    },{
                        "color": "#DDDED3"
                      }]
                },{
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "off"
                    }]
                  }]
    };
    map.setOptions(mapOPT);
}


function option(){
    setTimeout(on2(), 1000);
}
