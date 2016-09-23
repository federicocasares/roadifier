#pragma strict

public var distance : float = 20.0f;
public var degreesPerSecond : float = 2.0f;

function Update () {
	// quick and dirty way to keep the camera rotating around the center point
	// by the way, if you are looking at this and want a cool camera script,
	// feel free to check Stratecam at Github. :)
	transform.position = Vector3.zero;
	transform.localEulerAngles.y = transform.localEulerAngles.y + Time.deltaTime * degreesPerSecond;
	transform.Translate(Vector3.back * distance);
}