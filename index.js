
import * as THREE from 'three'; // Importa la biblioteca Three.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Importa los controles de órbita
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // Importa el cargador de archivos OBJ
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'; // Importa el cargador de archivos MTL
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Importa el cargador de archivos GLTF


function main() {

 // Obtiene el elemento canvas del HTML donde se renderizará la escena
	const canvas = document.querySelector( '#c' );
	// Crea un renderer WebGL con antialiasing y lo asocia al canvas
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

// Parámetros de la cámara
	const fov = 45; // Ángulo de visión de la cámara
	const aspect = 5; // Relación de aspecto
	const near = 0.5; // Distancia del plano de corte cercano
	const far = 10; // Distancia del plano de corte lejano

	// Crea una cámara de perspectiva con los parámetros definidos
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 1, 1, 1 ); // Establece la posición inicial de la cámara

	// Crea los controles de órbita y los asocia a la cámara y al canvas
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 ); // Establece el punto de enfoque de los controles
	controls.update();


	// Crea una escena
	const scene = new THREE.Scene();
	// Establece el color de fondo de la escena
	scene.background = new THREE.Color( 'black' );

	// Crear la esfera con textura
    const sphereGeometry = new THREE.SphereGeometry(3, 15, 15);
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(sphereGeometry, material);
		sphere.position.set(20, 23, 30); // Establece la posición de la esfera en la escena
    scene.add(sphere);

	 // Agregar sonido
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('https://threejs.org/examples/sounds/ping_pong.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

	{

		// Configuración de la iluminación
		const skyColor = 0xB1E1FF; 
		const groundColor = 0xB97A20; 
		const intensity = 3;
		// Crea una luz de hemisferio
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{
		// Configuración de la luz direccional
		const color = 0xFFFFFF;
		const intensity = 3;
		// Crea una luz direccional
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

	// Configuración del plano texturizado
	{

		const planeSize = 3; // Tamaño del plano

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats ); 

	// Crea la geometría del plano
		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5; // Rota el plano para que esté horizontal
		scene.add( mesh ); // Añade el plano a la escena

	}

	// Carga y añade un modelo 3D de un molino de viento

	{

		const mtlLoader = new MTLLoader(); // Cargador de archivos MTL
		mtlLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill/windmill.mtl', ( mtl ) => {

			mtl.preload();

			// Carga el archivo OBJ del modelo junto con los materiales cargados
			const objLoader = new OBJLoader(); // Cargador de archivos OBJ
			objLoader.setMaterials( mtl );
			objLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', ( root ) => {

				scene.add( root ); // Añade el modelo a la escena
				root.position.set(25, 20,); // Establece la posición del modelo en la escena

			} );

		} );

	}

  // Función para ajustar el área de visualización de la cámara
	function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {

		// Calcula la dirección desde la cámara hacia el centro de la caja
		const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
		const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
		const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );

		const direction = ( new THREE.Vector3() )
			.subVectors( camera.position, boxCenter )
			.multiply( new THREE.Vector3( 1, 0, 1 ) )
			.normalize();
		// Mueve la cámara a una posición para enmarcar la caja
		camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );
		// Establece los planos de corte cercano y lejano de la cámara
		camera.near = boxSize / 100;
		camera.far = boxSize * 100;
		// Actualiza la matriz de proyección de la cámara
		camera.updateProjectionMatrix();

		// Orienta la cámara hacia el centro de la caja
		camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

	}

{
		// Carga y añade un modelo GLTF de una ciudad
		const gltfLoader = new GLTFLoader();
		gltfLoader.load( 'https://threejs.org/manual/examples/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', ( gltf ) => {

			const root = gltf.scene; // Obtiene el nodo raíz del modelo
			scene.add( root ); // Añade el modelo a la escena
			root.position.set(20, 20, 20); // Establece la posición del modelo en la escena

            const scaleFactor = 0.009;// Factor de escala para ajustar el tamaño del modelo
            root.scale.set(scaleFactor, scaleFactor, scaleFactor);


			const box = new THREE.Box3().setFromObject( root ); // Obtiene la caja delimitadora del modelo

			const boxSize = box.getSize( new THREE.Vector3() ).length();
			const boxCenter = box.getCenter( new THREE.Vector3() );

			// Ajusta el área de visualización de la cámara para enmarcar el modelo
			frameArea( boxSize * 0.5, boxSize, boxCenter, camera );
			
			// Actualiza los controles de órbita para que el modelo esté centrado y visible
			controls.maxDistance = boxSize * 10;
			controls.target.copy( boxCenter );
			controls.update();

		} );

	}
		// Función para redimensionar el renderer para que coincida con el tamaño de la pantalla
	function resizeRendererToDisplaySize( renderer ) {
		// Obtiene el tamaño actual del canvas
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		// Verifica si el tamaño del canvas ha cambiado
		const needResize = canvas.width !== width || canvas.height !== height;
		// Si el tamaño ha cambiado, ajusta el tamaño del renderer
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}
	// Función para renderizar la escena
	function render() {
		// Verifica si se necesita redimensionar el renderer
		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix(); // Actualiza la matriz de proyección de la cámara

		}
		// Renderiza la escena con la cámara actual
		renderer.render( scene, camera );

				// Solicita al navegador que ejecute la función render en el próximo fotograma
		requestAnimationFrame( render );

	}
		// Inicia el ciclo de renderizado llamando a la función render por primera vez
	requestAnimationFrame( render );

}

// Llama a la función principal para iniciar la aplicación
main();
