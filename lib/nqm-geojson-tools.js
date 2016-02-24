/*
 * Created by G on 18/02/2016.
 */


"use strict";

var fs = require('fs');
var inside = require('robust-point-in-polygon');
var bbox = require('geojson-bbox');
var geotools = require('geojson-tools');

module.exports = {
    getPointsInPolygon: function(polygonGeoData, pointsGeoData, pointId) {
        var len = pointsGeoData.length;
        var i, point, pointCode;
        var pointsIn = [];
        var pointsOut = [];

        for (i = 0; i < len; i++) {
            point = pointsGeoData[i].geometry.coordinates;

            pointCode = this._identifyPIP(point, polygonGeoData);

            if (pointCode < 1) {
                if (pointId === undefined) {
                    pointsIn.push(pointsGeoData[i]);
                } else {
                    pointsIn.push(pointsGeoData[i].properties[pointId]);
                }
            } else {
                pointsOut.push(pointsGeoData[i]);
            }
        }

        return [pointsIn, pointsOut];
    },

    _identifyPIP: function(point, polygonGeoData) {
        var polygon, polygonType, flag;

        polygon = polygonGeoData.geometry.coordinates;
        polygonType = polygonGeoData.geometry.type;

        flag = this._geoPIP(polygon, point, polygonType);

        if (flag == 100) {
            console.log("This " + polygonType + " data is not right. Please check it.");

            process.exit(1);
        }

        return flag;
    },

    _geoPIP: function(polygon, point, polygonType) {
        "use strict";

        var i, flag, ppolygon;
        var len = polygon.length;

        if (polygonType == "Polygon") {
            flag = this._geoInside(polygon, point);

            if (flag < 1) {
                return flag;
            }

            if (flag == 100) {
                console.log("Polygon data is not right. Please check it.");

                return flag;
            }
        } else if (polygonType == "MultiPolygon") {
            for (i = 0; i < len; i++) {
                ppolygon = polygon[i];

                flag = this._geoInside(ppolygon, point);

                if (flag < 1) {
                    return flag;
                }

                if (flag == 100) {
                    console.log("MultiPolygon data is not right. Please check it.");

                    return flag;
                }
            }
        } else {
            console.log("The data is not Polygon or MultiPolygon. Please check it.");

            process.exit(1);
        }

        return 1;
    },

    _geoInside: function(polygon, point) {
        var flag;
        var len = polygon.length;

        if (len > 1) {
            if (len > 2) {
                console.log("Polygon data is not right. Please check it.");

                return 100;
            }

            var ppolygon = polygon[0];

            flag = inside(ppolygon, point);

            if (flag < 1) {
                //check this point
                ppolygon = polygon[1];

                var flagIn = inside(ppolygon, point);

                if (flagIn > 0) {
                    return flag;
                }
            }
        } else {
            ppolygon = polygon[0];

            flag = inside(ppolygon, point);

            if (flag < 1) {
                return flag;
            }
        }

        return 1;
    },

    getBBox: function(GeoData) {
        var i, data, len, swne, swnebbox;

        if (GeoData instanceof Array) {
            len = GeoData.length;

            swne = bbox(GeoData[0]);

            for (i = 1; i < len; i++) {
                data = GeoData[i];

                swnebbox = bbox(data);

                swne[0] = (swne[0] < swnebbox[0]) ? swne[0] : swnebbox[0];
                swne[1] = (swne[1] < swnebbox[1]) ? swne[1] : swnebbox[1];
                swne[2] = (swne[2] > swnebbox[2]) ? swne[2] : swnebbox[2];
                swne[3] = (swne[3] > swnebbox[3]) ? swne[3] : swnebbox[3];
            }
        } else {
            swne = bbox(GeoData);
        }

        return { "southWest": { "lat": swne[1], "lng": swne[0] }, "northEast": { "lat": swne[3], "lng": swne[2] } };
    },

    getCentre: function(GeoData) {
        var swne = bbox(GeoData);

        return { "centre": { "lat": (swne[1] + swne[3]) / 2, "lng": (swne[0] + swne[2]) / 2 } };
    },

    getDistance: function(geoPoint1, geoPoint2, decNum) {
        var pointsArray = [
            [geoPoint1.geometry.coordinates[1], geoPoint1.geometry.coordinates[0]],
            [geoPoint2.geometry.coordinates[1], geoPoint2.geometry.coordinates[0]]
        ];

        return geotools.getDistance(pointsArray, decNum); //Kilometre (km)
    },

    _identifyPIC: function(geoCentrePoint, radius, geoPoint, decNum) {
        var distance, flag;

        distance = this.getDistance(geoCentrePoint, geoPoint, decNum); // km

        if (distance < radius) {
            flag = -1;
        } else if (distance == radius) {
            flag = 0;
        } else {
            flag = 1;
        }

        return flag;
    },

    //radius--km; decNum--the decimal points to round answer to, defaults to 3 decimal points; pId--the id of points
    getPointsInCircle: function(geoCentrePoint, radius, pointsGeoData, pId, decNum) {
        var len = pointsGeoData.length;
        var i, geoPoint, pointCode, pointId;
        var pointsIn = [];
        var pointsOut = [];

        if (typeof pId === "string") pointId = pId;
        if (typeof pId === "number") decNum = pId;

        for (i = 0; i < len; i++) {
            geoPoint = pointsGeoData[i];

            pointCode = this._identifyPIC(geoCentrePoint, radius, geoPoint, decNum);

            if (pointCode < 1) {
                if (pointId === undefined) {
                    pointsIn.push(geoPoint);
                } else {
                    pointsIn.push(geoPoint.properties[pointId]);
                }
            } else {
                pointsOut.push(geoPoint);
            }
        }

        return [pointsIn, pointsOut];
    },

    jsonSave: function(jsonData, outPath) {
        //write the json data
        fs.writeFile(outPath, JSON.stringify(jsonData, null, 4), function(err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("The json file was saved!");
            }
        });
    }
};
