// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const apiOptions = {
  "apiKey": "AIzaSyAc9KG8jOS7WSSHWcR9b3GlwNMZIW75nuU",
  "version": "beta"
};

const mapOptions = {
  "zoom": 17,
  "center": { lat: 22.2722, lng: 70.7719 },
  "mapId": "a8187f5978aa2480",
  "tilt":15, 
  "heading":0,
  "mapTypeId": "satellite",
  "draggable": true,
}

/*
const mapOptions = {
  "zoom": 18,
  "center": { lat: 22.3039, lng: 70.8022 },
  "mapId": "a8187f5978aa2480",
  "tilt":15,
  "heading":1,
  "mapTypeId": "satellite",

}*/

async function initMap() {
	const mapDiv = document.getElementById("map");
	const apiLoader = new Loader(apiOptions);
	await apiLoader.load()      
	return new google.maps.Map(mapDiv, mapOptions);
}

async function initWebGLOverlayView (map) 
{
  let scene, renderer, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();    
	webGLOverlayView.onAdd = () => {
		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera();
		const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
		scene.add( ambientLight );
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
		directionalLight.position.set(0.5, -1, 0.5);
		scene.add(directionalLight);
		
		loader = new GLTFLoader();
		const source = 'pin.gltf';
		loader.load(
			source,
			gltf => {
				gltf.scene.scale.set(15,15,15);
				gltf.scene.rotation.x = 180 * Math.PI/180;
				scene.add(gltf.scene);
			}
		);
	}
	webGLOverlayView.onContextRestored = ({gl}) => {
		renderer = new THREE.WebGLRenderer({
			canvas: gl.canvas,
			context: gl,
			...gl.getContextAttributes(),
		});
		renderer.autoClear = false;			
		loader.manager.onLoad = () => {
			renderer.setAnimationLoop(() => {
				map.moveCamera({
					"tilt": mapOptions.tilt,
					"heading": mapOptions.heading,
					"zoom": mapOptions.zoom
				});
			
				if (mapOptions.tilt < 67.5) {
					mapOptions.tilt += 0.5
				} else if (mapOptions.heading <= 360) {
					mapOptions.heading += 0.2;
				} else {
					renderer.setAnimationLoop(null)
				}
			});
		}
	}
	webGLOverlayView.onDraw = ({gl, transformer}) => {
		const latLngAltitudeLiteral = {
			lat: mapOptions.center.lat,
			lng: mapOptions.center.lng,
			altitude: 50
		}		
		const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
		camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);			
		webGLOverlayView.requestRedraw();
		renderer.render(scene, camera);		
		renderer.resetState();		
	
	}
		webGLOverlayView.setMap(map);
	    var locations = [
      ['Madhav Darshan 6', 22.2891853, 70.7719639, 4],
      ['Haridwar Habitat', 22.2578828, 70.7626461, 8],
	  ['Sumukh Flats', 22.2616021, 70.7649086, 7],
	  ['Silver Avenue 2/3/3+ BHK FLATS', 22.2519927, 70.7594297, 5],
	  ['Vraj Group', 22.2616648, 70.7681353, 5],
	  ['SIDDHI HERITAGE ', 22.261526, 70.7659192, 8],
	  ['Suvarna Bhoomi - 3 & 4 BHK Luxurious Flats ', 22.2648898, 70.7634101, 2],
	  ['AQUA ELEGANCE', 22.2548931, 70.7604283, 5],
	  ['BALAJI SPAACES', 22.3310107, 70.8239646, 5],
	  ['SHUBHAM GREEN', 22.2928733, 70.7688713, 5],
      ['Shubham Gold', 22.292757, 70.774395, 3]
     
    ];
    var infowindow = new google.maps.InfoWindow();
    var marker, i;    
    for (i = 0; i < locations.length; i++) {  
      marker = new google.maps.Marker({
		position: new google.maps.LatLng(locations[i][1], locations[i][2]),
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		icon:"299061_house_icon.png"
      });
       marker.addListener("click", toggleBounce);
	   
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i][0]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
	
	function toggleBounce() {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	}

}
	
	
    (async () => {
		const map = await initMap();	  
		initWebGLOverlayView(map);
    })();
 




