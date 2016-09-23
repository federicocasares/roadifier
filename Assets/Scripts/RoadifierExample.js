#pragma strict

import System.Collections.Generic;
import UnityEngine.UI;

public var smoothingSlider : Slider;
public var smoothingIterationsSlider : Slider;
public var widthSlider : Slider;
public var flagPrefab : GameObject;
private var flags : List.<GameObject> = List.<GameObject>();
private var points : List.<Vector3> = List.<Vector3>();

function Start() {
	// hardcoded data to illustrate usage
	for (var x : float = -5.0f; x <= 5.0f; x += 0.5f) {
		// just a silly function to demonstrate capabilities of the road
		// renderer... ignore it, please. :)
		var z : float = Mathf.Sin(x * 2.0f) + x * 0.8f + x * x * 0.035f;
		points.Add(Vector3(x, 0.0f, z));

		var flag : GameObject = Instantiate(flagPrefab);
		flag.transform.position = Vector3(x, Terrain.activeTerrain.SampleHeight(Vector3(x, 0, z)), z);
		flags.Add(flag);
	}
}

function Update() {
	if (Input.GetMouseButtonDown(1)) {
		PlacePoint();
	}
}

function ClearAll() {
	ClearOldRoad();
	points.Clear();

	for (var f : GameObject in flags) {
		Destroy(f);
	}
	flags.Clear();
}

function ClearOldRoad() {
	var previousRoad : GameObject = GameObject.Find("Roadifier Road");
	if (previousRoad) {
		Destroy(previousRoad);
	}
}

function PlacePoint() {
	var pos : Vector3;
	var hit : RaycastHit;
	var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	if (Terrain.activeTerrain.GetComponent(Collider).Raycast(ray, hit, Mathf.Infinity)) {
		pos = hit.point;
	}

	if (pos != Vector3.zero) {
		points.Add(pos);
		var flag : GameObject = Instantiate(flagPrefab);
		flag.transform.position = pos;
		flags.Add(flag);
	}
}

function RunExample() {
	ClearOldRoad();

 	// make a copy of the list so we don't modify the user generated one
 	// during smoothing processes and whatnot
	var pointsToSend : List.<Vector3> = List.<Vector3>(points);

	GetComponent(Roadifier).smoothingFactor = smoothingSlider.value;
	GetComponent(Roadifier).smoothingIterations = smoothingIterationsSlider.value;
	GetComponent(Roadifier).roadWidth = widthSlider.value;
	GetComponent(Roadifier).GenerateRoad(pointsToSend, Terrain.activeTerrain);
}