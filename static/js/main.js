
var statsEnabled = true;

var container, stats;

var camera, scene, renderer;

var cross;

$(init);

function init() {

  // scene and camera

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

  camera = new THREE.RollCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.movementSpeed = 100;
  camera.lookSpeed = 3;
  camera.constrainVertical = [ -0.5, 0.5 ];
  //camera.autoForward = true;

  // world

  var cube = new THREE.CubeGeometry( 20, 60, 20 );

  cube.vertices[ 0 ].position.multiplyScalar( 0.01 );
  cube.vertices[ 1 ].position.multiplyScalar( 0.01 );
  cube.vertices[ 4 ].position.multiplyScalar( 0.01 );
  cube.vertices[ 5 ].position.multiplyScalar( 0.01 );

  var material =  new THREE.MeshLambertMaterial( { color:0xffffff } );

  for( var i = 0; i < 500; i++ ) {

    var mesh = new THREE.Mesh( cube, material );
    mesh.position.set(( Math.random() - 0.5 ) * 1000,
    ( Math.random() - 0.5 ) * 1000,
    ( Math.random() - 0.5 ) * 1000 );

    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.addChild( mesh );

  }

  scene.addChild( camera );


  // lights

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.addChild( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.addChild( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.addChild( light );


  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColorHex( 0xffffff, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  $('body').append( renderer.domElement );

  if ( statsEnabled ) {

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    $('body').append( stats.domElement );

  }

  animate();
}


function animate() {
  requestAnimationFrame(animate);
  renderer.render( scene, camera );
  if ( statsEnabled) stats.update();
}

