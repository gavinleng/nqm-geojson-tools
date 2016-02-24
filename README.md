# nqm-geojson-tools.js

Nqm-GeoJSON-Tools is a JavaScript module for working with geojson data of NquiringMinds Ltd.


## Installation

Install [node.js](http://nodejs.org/), then:

```
npm install nqm-geojson-tools
```


## usage
 
```javascript
var geoDataInOut = require('nqm-geojson-bbox');

...........................................

// get the geojson points in a geojson polygon/multipolygon, also return the points out of this polygon
var pointsInOut = geoDataInOut.getPointsInPolygon(geoPolygonData, geoPointsDataArray);
var pointsIn = pointsInOut[0];
var pointsOut = pointsInOut[1];

...........................................

// get the geojson points in a circle, also return the points out of this circle
var pointsInOut = geoDataInOut.getPointsInCircle(geoCentrePoint, radius, geoPointsDataArray); // radius--km
var pointsIn = pointsInOut[0];
var pointsOut = pointsInOut[1];

...........................................

// get the distance between two geojson points
var distance = geoDataInOut.getDistance(geoPoint1, geoPoint2); // km

...........................................

// get boundary box of a geojson object or an array with geojson objects
var bbox = geoDataInOut.getBBox(geoData);
...........................................

// get the centre of a geojson object or an array with geojson objects, based on the boundary box
var centre = geoDataInOut.getCentre(geoData);

...........................................

// save json data to outPath
geoDataInOut.jsonSave(jsonData, outPath);
```