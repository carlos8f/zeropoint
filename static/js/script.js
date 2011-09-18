var canvas, renderer, shapes = {}, my_ship, tick_id;
(function($) {

$(function() {
  // Stats.
  var stats = new Stats();
  $('body').append($(stats.domElement).addClass('stats').get(0));
  
  var opts = {
    lines: 12, // The number of lines to draw
    length: 0, // The length of each line
    width: 2, // The line thickness
    radius: 30, // The radius of the inner circle
    color: '#fff', // #rgb or #rrggbb
    speed: 1.2, // Rounds per second
    trail: 88, // Afterglow percentage
    shadow: false // Whether to render a shadow
  };
  
  var scaleCanvas = function() {
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    renderer.calculateScale();
  };
  
  var setupCanvas = function() {
    canvas = document.createElement('canvas');
    $(canvas).css('display', 'none').mousedown(function(e) {
      if (typeof my_ship != 'undefined') {
        var pos = relXY(e);
        my_ship.state.x = pixelsToX(pos.x);
        my_ship.state.y = pixelsToY(pos.y);
        socket.emit('move', my_ship.state);
      }
      e.preventDefault();
      return false;
    });
    $('body').append(canvas);
    renderer = new Pre3d.Renderer(canvas);
    renderer.draw_overdraw = false;
    renderer.fill_rgba = null;
    renderer.ctx.lineWidth = 1;
    renderer.stroke_rgba = new Pre3d.RGBA(0xff/255, 0xff/255, 0xff/255, 0.7);
    renderer.camera.focal_length = 3;
    renderer.camera.transform.translate(0, 0, -30);
    scaleCanvas();
    $(window).resize(scaleCanvas);
  };
  
  setupCanvas();
  var spinner = new Spinner(opts).spin($('body').get(0));
  
  var createObject = function(snapshot) {
    var shape = Pre3d.ShapeUtils.makeOctahedron();
    Pre3d.ShapeUtils.linearSubdivideTri(shape);
    Pre3d.ShapeUtils.forEachVertex(shape, function(v, i, s) {
      s.vertices[i] = Pre3d.Math.unitVector3d(v);  // TODO(deanm): inplace.
    });
    // We need to rebuild the normals after extruding the vertices.
    Pre3d.ShapeUtils.rebuildMeta(shape);
    shape.state = snapshot.state;
    return shape;
  };

  var draw = function() {
    for (var i in shapes) {
      var shape = shapes[i];
      renderer.transform.reset();
      renderer.transform.rotateX(shape.state.rx);
      renderer.transform.rotateY(shape.state.ry);
      renderer.transform.translate(shape.state.x, shape.state.y, shape.state.z);
      renderer.bufferShape(shape);
    }

    // Clear background.
    renderer.drawBackground();

    renderer.drawBuffer();
    renderer.emptyBuffer();
  };

  // Draw 30 times/sec.
  var tick = function() {
    return setInterval(function() {
      for (var i in shapes) {
        var shape = shapes[i];
        shape.state.rx += 0.01;
        shape.state.ry += 0.03;
      }
      draw();
      stats.update();
    }, 1000 / 30);
  };
  
  var relXY = function(e) {
    if (typeof e.offsetX == 'number') {
      return {x: e.offsetX, y: e.offsetY};
    }

    // TODO this is my offsetX/Y emulation for Firefox.  I'm not sure it is
    // exactly right, but it seems to work ok, including scroll, etc.
    var off = {x: 0, y: 0};
    var node = e.target;
    var pops = node.offsetParent;
    if (pops) {
      off.x += node.offsetLeft - pops.offsetLeft;
      off.y += node.offsetTop - pops.offsetTop;
    }

    return {x: e.layerX - off.x, y: e.layerY - off.y};
  }
  
  var pixelsToX = function(pixels) {
    return ((pixels / $(canvas).width()) * 2 - 1) * 18;
  };
  
  var pixelsToY = function(pixels) {
    return ((pixels / $(canvas).height()) * 2 - 1) * -10;
  };

  var socket = io.connect();
  socket.on('join', function (id) {
    spinner.stop();
    $(canvas).css('display', 'block');
    my_id = id;
    tick_id = tick();
  });
  socket.on('snapshot', function (snapshot) {
    for (var i in snapshot) {
      var id = snapshot[i].id;
      if (typeof shapes[id] == 'undefined' && !snapshot[i].state.destroyed) {
        shapes[id] = createObject(snapshot[i]);
        if (id == my_id) {
          my_ship = shapes[id];
        }
      }
      else if (snapshot[i].state.destroyed) {
        delete shapes[id];
      }
      else {
        shapes[id].state.x = snapshot[i].state.x;
        shapes[id].state.y = snapshot[i].state.y;
      }
    }
  });
});

})(jQuery);