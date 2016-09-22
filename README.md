# Roadifier
(an open-source road mesh generator for Unity)

## What is it?
Basically Roadifier takes a list of points and a terrain object and automatically generates a mesh representing a road of the specified width that follow the terrain's height and normals. It's great to make roads in strategy games using the standard Unity terrain, and with a couple of changes it could be adapted to make train tracks, rivers and much more!

## Important Information
This repository contains an example project that includes a few Unity Standard Assets. These are distributed here only as part of the example scene to demonstrate the capabilities of Roadifier. If you are not interested in that and only want the component itself to test it out in your own project, feel free to proceed to copy the .js scripts in the Scripts directory and nothing else.

## Installation
Getting Roadifier running is really easy. It's as simple as getting a copy of the .js files in the Scripts directory, creating a new empty game object and adding the Roadifier script to it. After that you're good to go.

## Where can I see a demo?
[You can find a demo of the latest version of Roadifier here.](http://www.windsoftrade.net/roadifier)

## What do the options mean?
Almost all of the settings are pretty much self explanatory, but here are the details:

* Road Width: The width of the road mesh, specified in world units. Thinner roads usually adapt better to the terrain shape.
* Smoothing factor: A float between 0.0 and 0.5 specifying how much smoothing should be applied to corners. Values close to 0.2 and 0.3 usually work well. Setting it to 0.0 disables smoothing altogether.
* Smoothing iterations: How many times, between 0 and 5, the smoothing algorithm should be applied. More iterations provide smoother results but also ends up creating a lot of extra vertices and faces. It's recommended to set this to 1 or 2. Also, applying too many smoothing iterations might cause the final mesh to have artifacts.

## How does it work?
Basically, doing a lot of math. If you like algebra, this is definitely the place for you. I'll publish a short video explaining the inner workings of Roadifier soon.

## Public Methods

### GenerateRoad(points : List.<Vector3>, terrain : Terrain)
Generates a new game object containing the generated mesh for the road. It will iterate the points in the order specified in the list, making a road mesh of the specified width that connects them. The terrain parameter is optional, and will be used for making sure the road follows the height and normals of the terrain properly in each point. In case you omit it, the road will use the y-coordinate specified in each point and will use Vector3.up as the normal vector.