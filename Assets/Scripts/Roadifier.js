#pragma strict

import System.Collections.Generic;

public var roadWidth : float = 5.0f;
public var smoothingFactor : float = 0.2f;
public var smoothingIterations : int = 3;
public var material : Material;
public var terrainClearance : float = 0.05f;
private var mesh : Mesh;

public function GenerateRoad(points : List.<Vector3>) {
	GenerateRoad(points, null);
}

public function GenerateRoad(points : List.<Vector3>, terrain : Terrain) {
	// parameters validation
	CheckParams(points, smoothingFactor);

	if (smoothingFactor > 0.0f) {
		for (var smoothingPass : int = 0; smoothingPass < smoothingIterations; smoothingPass++) {
			AddSmoothingPoints(points);
		}
	}

	// if a terrain parameter was specified, replace the y-coordinate
	// of every point with the height of the terrain (+ an offset)
	if (terrain) {
		AdaptPointsToTerrainHeight(points, terrain);
	}

	var perpendicularDirection : Vector3;
	var nextPoint : Vector3;
	var nextNextPoint : Vector3;
	var point1 : Vector3;
	var point2 : Vector3;
	var cornerPoint1 : Vector3;
	var cornerPoint2 : Vector3;
	var tangent : Vector3;
	var cornerNormal : Vector3;

	mesh = new Mesh();
	mesh.name = "Roadifier Road Mesh";

	var vertices = List.<Vector3>();
	var triangles = List.<int>();

	var idx = 0;
	for (var currentPoint : Vector3 in points) {
		if (idx == points.Count - 1) {
			// no need to do anything in the last point, all triangles
			// have been created in previous iterations
			break;
		} else if (idx == points.Count - 2) {
			// second to last point, we need to make up a "next next point"
			nextPoint = points[idx + 1];
			// assuming the 'next next' imaginary segment has the same
			// direction as the real last one
			nextNextPoint = nextPoint + (nextPoint - currentPoint);
		} else {
			nextPoint = points[idx + 1];
			nextNextPoint = points[idx + 2];
		}

		var terrainNormal1 : Vector3 = Vector3.up; // default normal: straight up
		var terrainNormal2 : Vector3 = Vector3.up; // default normal: straight up
		if (terrain) {
			// if there's a terrain, calculate the actual normals
			var hit : RaycastHit;
			var ray : Ray;

			ray = new Ray(currentPoint + Vector3.up, Vector3.down);
			terrain.GetComponent(Collider).Raycast(ray, hit, 100.0f);
			terrainNormal1 = hit.normal;

			ray = new Ray(nextPoint + Vector3.up, Vector3.down);
			terrain.GetComponent(Collider).Raycast(ray, hit, 100.0f);
			terrainNormal2 = hit.normal;
		}

		// calculate the normal to the segment, so we can displace 'left' and 'right' of
		// the point by half the road width and create our first vertices there
		perpendicularDirection = (Vector3.Cross(terrainNormal1, nextPoint - currentPoint)).normalized;
		point1 = currentPoint + perpendicularDirection * roadWidth * 0.5f;
		point2 = currentPoint - perpendicularDirection * roadWidth * 0.5f;

		// here comes the tricky part...
		// we calculate the tangent to the corner between the current segment and the next
		tangent = ((nextNextPoint - nextPoint).normalized + (nextPoint - currentPoint).normalized).normalized;
		cornerNormal = (Vector3.Cross(terrainNormal2, tangent)).normalized;
		// project the normal line to the corner to obtain the correct length
		var cornerWidth = (roadWidth * 0.5f) / Vector3.Dot(cornerNormal, perpendicularDirection);
		cornerPoint1 = nextPoint + cornerWidth * cornerNormal;
		cornerPoint2 = nextPoint - cornerWidth * cornerNormal;

		// first point has no previous vertices set by past iterations
		if (idx == 0) {
			vertices.Add(point1);
			vertices.Add(point2);
		}
		vertices.Add(cornerPoint1);
		vertices.Add(cornerPoint2);

		var doubleIdx : int = idx * 2;

		// add first triangle
		triangles.Add(doubleIdx);
		triangles.Add(doubleIdx + 1);
		triangles.Add(doubleIdx + 2);

		// add second triangle
		triangles.Add(doubleIdx + 3);
		triangles.Add(doubleIdx + 2);
		triangles.Add(doubleIdx + 1);

		idx++;
	}

	mesh.SetVertices(vertices);
	mesh.SetUVs(0, GenerateUVs(vertices));
	mesh.triangles = triangles.ToArray();
	mesh.RecalculateNormals();

	CreateGameObject(mesh);
}

private function AddSmoothingPoints(points : List.<Vector3>) {
	for (var i : int = 0; i < points.Count - 2; i++) {
		var currentPoint : Vector3 = points[i];
		var nextPoint : Vector3 = points[i + 1];
		var nextNextPoint : Vector3 = points[i + 2];

		var distance1 : float = Vector3.Distance(currentPoint, nextPoint);
		var distance2 : float = Vector3.Distance(nextPoint, nextNextPoint);

		var dir1 : Vector3 = (nextPoint - currentPoint).normalized;
		var dir2 : Vector3 = (nextNextPoint - nextPoint).normalized;

		points.RemoveAt(i + 1);
		points.Insert(i + 1, currentPoint + dir1 * distance1 * (1.0f - smoothingFactor));
		points.Insert(i + 2, nextPoint + dir2 * distance2 * (smoothingFactor));
		i++;
	}
}

private function AdaptPointsToTerrainHeight(points : List.<Vector3>, terrain : Terrain) {
	for (var i : int = 0; i < points.Count; i++) {
		var point : Vector3 = points[i];
		points[i] = Vector3(point.x, terrain.transform.position.y + terrainClearance + terrain.SampleHeight(Vector3(point.x, 0, point.z)), point.z);
	}
}

private function CreateGameObject(mesh : Mesh) {
	var obj : GameObject = new GameObject("Roadifier Road", MeshRenderer, MeshFilter, MeshCollider);
	obj.GetComponent(MeshFilter).mesh = mesh;
	obj.transform.SetParent(transform);

	var renderer : MeshRenderer = obj.GetComponent(MeshRenderer);
	var materials = renderer.materials;
	for (var i : int = 0; i < materials.Length; i++) {
		materials[i] = material;
	}
	renderer.materials = materials;
}

private function GenerateUVs(vertices : List.<Vector3>) : List.<Vector2> {
	var uvs : List.<Vector2> = List.<Vector2>();

	for (var vertIdx : int = 0; vertIdx < vertices.Count; vertIdx++) {
		if (vertIdx % 4 == 0) {
			uvs.Add(Vector2(0, 0));
		} else if (vertIdx % 4 == 1) {
			uvs.Add(Vector2(0, 1));
		} else if (vertIdx % 4 == 2) {
			uvs.Add(Vector2(1, 0));
		} else {
			uvs.Add(Vector2(1, 1));
		}
	}
	return uvs;
}

private function CheckParams(points : List.<Vector3>, smoothingFactor : float) {
	if (points.Count < 2) {
		throw "At least two points are required to make a road";
	}

	if (smoothingFactor < 0.0f || smoothingFactor > 0.5f) {
		throw "Smoothing factor should be between 0 and 0.5";
	}
}