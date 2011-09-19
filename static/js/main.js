
var camera, scene, renderer, ship;

$(init);

function init() {

  // scene and camera

  scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

  camera = new THREE.RollCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.movementSpeed = 100;
  camera.lookSpeed = 3;
  camera.constrainVertical = [ -0.2, 0.2 ];
  camera.position.z = 30;
  camera.position.y = 1.5;
  camera.mouseLook = false;

  // world

  var cube = new THREE.CubeGeometry( 1, 1, 1 );

  var material =  new THREE.MeshLambertMaterial( { color:0x999999 } );

  for( var i = 0; i < 5000; i++) {

    var mesh = new THREE.Mesh( cube, material );
    mesh.position.set(( Math.random() - 0.5 ) * 2000,
    ( Math.random() - 0.5 ) * 2000,
    ( Math.random() - 0.5 ) * 2000 );

    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.addChild( mesh );

  }

  scene.addChild( camera );


  // lights
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.addChild( light );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( -1, -1, -1 );
  scene.addChild( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.addChild( light );

  // ship
  var binLoader = new THREE.BinaryLoader();
  binLoader.load( { model: '/models/ship.js', callback: function( geometry ) { addModel( geometry ) } } );

  function addModel ( geometry ) {
    
    ship = new THREE.Ship( geometry, new THREE.MeshFaceMaterial() );
    ship.scale.set( 2, 2, 2 );
    ship.lookSpeed = 4;
    ship.movementSpeed = 100;
    ship.constrainVertical = [ -0.7, 0.7 ];
    scene.addChild( ship );

  }

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColorHex( 0x000000, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  $('body').append( renderer.domElement );

  animate();
}


function animate() {
  requestAnimationFrame(animate);
  renderer.render( scene, camera );
}

