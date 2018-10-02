$(function() {
  var ctx = $('#Result')[0].getContext('2d'),
      ctx2 = null,
      info = $('#Info'),
      width = ctx.canvas.width,
      height = ctx.canvas.height;

  if($('#Resize').length === 1) {
    ctx2 = $('#Resize')[0].getContext('2d');
  }

  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, width, height);
  info.css('font-size', 20);
  info.css('margin-left', 10);

  if(!window.Worker) {
    alert('Web Workersをサポートしていないブラウザです。');
  }

  PixelCluster.load($('#Src')[0].src, function(data, time) {
    info.text('load image ok.');
    ctx.fillRect(0, 0, width, height);
    $('#ClusterButton').off('click');
    $('#ClusterButton').on('click', onClick);
  });

  $('#Image').change(function(e){
    $('#Src')[0].src = e.target.value;
    PixelCluster.load(e.target.value, function(data, time) {
      info.text('load image ok.');
      ctx.fillRect(0, 0, width, height);
      $('#ClusterButton').off('click');
      $('#ClusterButton').on('click', onClick);
    });
  });

  function onClick() {
    try {
      var division = parseInt($('#Division').val());
      var color = parseInt($('#Color').val());
      var start = new Date().getTime();
      var viewType = parseInt($('input[name=view]:checked').val());
      var initType = parseInt($('input[name=init]:checked').val());
      if(ctx2) ctx2.clearRect(0, 0, width, height);
      if(viewType === 0 || isNaN(viewType)) {
        info.text('now computing ...');
        var method;
        if(initType === 0 || isNaN(initType)) {
          method = PixelCluster.KMEANS_PP;
        } else {
          method = PixelCluster.KMEANS_RANDOM;
        }
        /*
        var result = PixelCluster.perform(division, color, method);
        PixelCluster.render(ctx, division, result);
        if(ctx2) ctx2.drawImage(ctx.canvas, 0, 0, division, division);
        var time = (new Date().getTime() - start).toString();
        info.text('process time: ' + time + ' ms');
        */

        PixelCluster.perform(division, color, method, function(result) {
          PixelCluster.render(ctx, division, result);
          if(ctx2) ctx2.drawImage(ctx.canvas, 0, 0, division, division);
          var time = (new Date().getTime() - start).toString();
          info.text('process time: ' + time + ' ms');
        });

      } else {
        var result = PixelCluster.mosaic(division);
        PixelCluster.render(ctx, division, result);
        if(ctx2) ctx2.drawImage(ctx.canvas, 0, 0, division, division);
        var time = (new Date().getTime() - start).toString();
        info.text('process time: ' + time + ' ms');
      }
    } catch(e) {
      info.text(e);
    }
  }
});
