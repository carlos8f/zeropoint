var canvas, renderer, shapes = [], my_id, my_ship;
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
      var pos = relXY(e);
      my_ship.state.x = pixelsToX(pos.x);
      my_ship.state.y = pixelsToY(pos.y);
      e.preventDefault();
      return false;
    });
    $('body').append(canvas);
    renderer = new Pre3d.Renderer(canvas);
    renderer.draw_overdraw = false;
    renderer.fill_rgba = null;
    renderer.ctx.lineWidth = 1;
    renderer.fill_rgba = null;
    renderer.stroke_rgba = new Pre3d.RGBA(0xff/255, 0xff/255, 0xff/255, 0.7);
    renderer.camera.focal_length = 3;
    scaleCanvas();
    $(window).resize(scaleCanvas);
  };
  
  setupCanvas();
  var spinner = new Spinner(opts).spin($('body').get(0));
  
  var createObject = function(object) {
    var shape = Pre3d.ShapeUtils.makeSphere(0.2, 5, 2);
    // Do an extrusion so we can some interesting non-planar quads.
    var extruder = new Pre3d.ShapeUtils.Extruder();
    extruder.selectCustom(function(shape, quad_index) {
      return (quad_index != 0);
    });
    extruder.set_count(20);
    extruder.set_distance(5);
    extruder.rotate.x = extruder.rotate.y = 1.1;
    extruder.extrude(shape);
    
    shape.state = {
      rotate_y_rad: 0,
      rotate_x_rad: 0,
      x: 0,
      y: 0
    };
    shapes.push(shape);
    return shape;
  }
  
  var draw = function() {
    for (var i in shapes) {
      var shape = shapes[i];
      renderer.transform.reset();
      renderer.transform.rotateX(shape.state.rotate_x_rad);
      renderer.transform.rotateY(shape.state.rotate_y_rad);
      renderer.transform.translate(shape.state.x, shape.state.y, -30);
      renderer.bufferShape(shape);
    }

    // Clear background.
    renderer.drawBackground();

    renderer.drawBuffer();
    renderer.emptyBuffer();
  }
  
  var spin_and_draw = function() {
    for (var i in shapes) {
      var shape = shapes[i];
      shape.state.rotate_y_rad += 0.03;
      shape.state.rotate_x_rad += 0.01;
    }
    
    draw();
    stats.update();
  };
  
  var ticker = new DemoUtils.Ticker(30, spin_and_draw);
  
  var relXY = function(e) {
    if (typeof e.offsetX == 'number')
      return {x: e.offsetX, y: e.offsetY};

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
  
  var easeInOutCubic = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t + 2) + b;
  };
  
  var pixelsToX = function(pixels) {
    return ((pixels / $(canvas).width()) * 2 - 1) * 17;
  };
  
  var pixelsToY = function(pixels) {
    return ((pixels / $(canvas).height()) * 2 - 1) * -10;
  };

  var socket = io.connect();
  socket.on('connect', function () {
    spinner.stop();
    $(canvas).css('display', 'block');
    ticker.start();
  });
  socket.on('me', function(id){
    my_id = id;
  })
  socket.on('create', function (object) {
    var shape = createObject(object);
    if (object.id == my_id) {
      my_ship = shape;
    }
  });
  socket.on('snapshot', function (snapshot) {
    
  });
  socket.on('destroy', function (object) {
    
  });
});

})(jQuery);