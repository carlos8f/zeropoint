(function($) {

var canvas, renderer, shape;

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
  var spinner = new Spinner(opts).spin($('body').get(0));
  
  var setupCanvas = function() {
    canvas = $('#canvas').get(0);
    renderer = new Pre3d.Renderer(canvas);
    renderer.draw_overdraw = false;
    renderer.fill_rgba = null;
    renderer.ctx.lineWidth = 0.9;
    renderer.fill_rgba = null;
    renderer.stroke_rgba = new Pre3d.RGBA(0x00/255, 0xff/255, 0x00/255, 0.5);
    renderer.camera.focal_length = 2.5;
  }
  
  var createObject = function(object) {
    shape = Pre3d.ShapeUtils.makeOctahedron();
    Pre3d.ShapeUtils.linearSubdivideTri(shape);
    Pre3d.ShapeUtils.forEachVertex(shape, function(v, i, s) {
      s.vertices[i] = Pre3d.Math.unitVector3d(v);  // TODO(deanm): inplace.
    });
    // We need to rebuild the normals after extruding the vertices.
    Pre3d.ShapeUtils.rebuildMeta(shape);
  }
  
  var state = {
    shape_rotate_y_rad: 0,
    shape_rotate_x_rad: 0,
    shape_x: 2,
    shape_y: 0
  };
  
  var draw = function() {
    renderer.transform.reset();
    renderer.transform.rotateX(state.shape_rotate_x_rad);
    renderer.transform.rotateY(state.shape_rotate_y_rad);
    renderer.transform.translate(state.shape_x, state.shape_y, -12);
    renderer.bufferShape(shape);

    // Clear background.
    renderer.drawBackground();

    renderer.drawBuffer();
    renderer.emptyBuffer();
  }
  
  var spin_and_draw = function() {
    state.shape_rotate_y_rad += 0.02;
    state.shape_rotate_x_rad += 0.01;
    state.shape_x = Math.sin(state.shape_rotate_y_rad / 2) * 0.5;
    state.shape_y = Math.sin(state.shape_rotate_x_rad * 4) * 0.5;
    draw();
    stats.update();
  };
  
  var ticker = new DemoUtils.Ticker(30, spin_and_draw);

  var socket = io.connect();
  socket.on('connect', function () {
    spinner.stop();
    setupCanvas();
    ticker.start();
  });
  
  socket.on('create', function (object) {
    createObject(object);
  });
  socket.on('snapshot', function (snapshot) {
    
  });
  socket.on('destroy', function (object) {
    
  });
});

})(jQuery);