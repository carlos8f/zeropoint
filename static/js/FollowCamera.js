/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fov: <float>,
 *  aspect: <float>,
 *  near: <float>,
 *  far: <float>,

 *  movementSpeed: <float>,
 *  lookSpeed: <float>,
 *  rollSpeed: <float>,

 *  autoForward: <bool>,
 * 	mouseLook: <bool>,

 *  domElement: <HTMLElement>,
 * }
 */

THREE.FollowCamera = function ( fov, aspect, near, far, target ) {

	THREE.Camera.call( this, fov, aspect, near, far, target );

  var tweenMatrix = new THREE.Matrix4();

	// custom update

	this.update = function( parentMatrixWorld, forceUpdate, camera ) {

		this.matrixAutoUpdate && this.updateMatrix();

    if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

      if ( parentMatrixWorld ) {

        tweenMatrix.copy ( parentMatrixWorld );


        this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

      } else {

        this.matrixWorld.copy( this.matrix );

      }

      this.matrixWorldNeedsUpdate = false;
			forceUpdate = true;

			THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );
    }

    // update children

    for ( var i = 0; i < this.children.length; i ++ ) {

      this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

    }

	};
};


THREE.FollowCamera.prototype = new THREE.Camera();
THREE.FollowCamera.prototype.constructor = THREE.FollowCamera;
THREE.FollowCamera.prototype.supr = THREE.Camera.prototype;


