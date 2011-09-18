var camera, scene, renderer,
geometry, material, mesh;

$(function() {
  init();
  animate();
});

function init() {

  camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  scene = new THREE.Scene();

  geometry = new THREE.CubeGeometry( 200, 200, 200 );
  material = new THREE.MeshBasicMaterial( {
    color: 0xffffff, 
    wireframe: true
  } );

  mesh = new THREE.Mesh( geometry, material );
  scene.addObject( mesh );

  renderer = new THREE.CanvasRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  $('body').append( renderer.domElement );

}

function animate() {

  // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
  requestAnimationFrame( animate );
  render();

}

function render() {

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render( scene, camera );

}