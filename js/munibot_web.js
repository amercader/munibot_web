export function initMap(code) {

    let mapConf = {
        "es": {
            "idField": "codine",
            "nameField": "nameunit",
            "higherNameField": "nameprov",
            "defaultZoom": 6,
            "minzoom": 5,
            "maxzoom": 11,
            "defaultCenter": [-3.4190, 40.2057]
        },
        "fr": {
            "idField": "insee",
            "nameField": "nom",
            "higherNameField": "dep",
            "defaultZoom": 6,
            "minzoom": 5,
            "maxzoom": 11,
            "defaultCenter": [2.2167, 46.9916]

        },
        "cat": {
            "idField": "codine",
            "nameField": "nameunit",
            "higherNameField": "nameprov",
            "defaultZoom": 8,
            "minzoom": 7,
            "maxzoom": 11,
            "defaultCenter": [1.6850, 41.6880]

        }
    } [code]

    let style = {
        "version": 8,
        "name": "Empty",
        "metadata": {
            "mapbox:autocomposite": true
        },
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
            [code]: {
                'type': 'vector',
                // 'tiles': ['http://localhost:9090/maps/' + code + '/{z}/{x}/{y}.pbf?'],
                'tiles': [
                    'https://tiles.amercader.net/maps/vector/' + code + '/{z}/{x}/{y}.pbf?',
                    'https://1.tiles.amercader.net/maps/vector/' + code + '/{z}/{x}/{y}.pbf?',
                    'https://2.tiles.amercader.net/maps/vector/' + code + '/{z}/{x}/{y}.pbf?',
                ],

                'minzoom': mapConf["minzoom"],
                'maxzoom': mapConf["maxzoom"],
                'promoteId': mapConf["idField"]
            }
        },
        "layers": [{
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "rgba(0,0,0,0)"
            }
        }, {
            'id': code,
            'type': 'fill',
            'source': code,
            'source-layer': code,
            'layout': {},
            'paint': {
                'fill-color': ['case',
                    ['boolean', ['feature-state', 'tweet'], false], '#FF0000', '#000000'
                ],
                'fill-opacity': 0.25
            }
        }]
    }

    let map = new maplibregl.Map({
        container: 'map',
        style: style,
        zoom: mapConf["defaultZoom"],
        center: mapConf["defaultCenter"]
    });
    map.on('click', code, function(e) {
        let coordinates = e.lngLat;
        let properties = e.features[0].properties;
        let state = e.features[0].state;
        let content = "";
        if (!state.tweet_status) {
            content += properties[mapConf["nameField"]] + ' (' + properties[mapConf["higherNameField"]] + ')';
            content += "<div>No tweet yet</div>"
        }
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        let popup = new maplibregl.Popup().setLngLat(coordinates).setHTML(content).addTo(map);
        if (state.tweet_status) {
            twttr.widgets.createTweet(state.tweet_status, popup._content)
        }
    });

    map.on('sourcedata', function(e) {
        Object.keys(window.MunibotTweets).forEach(function(key, index) {
            map.setFeatureState({
                    'source': code,
                    'sourceLayer': code,
                    'id': key
                },
                {
                    'tweet': true,
                    'tweet_status': window.MunibotTweets[key]
                });
        });
    });
    map.addControl(new maplibregl.NavigationControl());
}


window.twttr = (function(d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"))
