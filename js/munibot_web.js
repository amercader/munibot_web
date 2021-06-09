export function initMap(code) {

    let mapConf = {
        "es": {
            "idField": "codine",
            "nameField": "nameunit",
            "higherNameField": "nameprov",
            "minzoom": 3,
            "maxzoom": 11,
            "defaultBounds": [-11.73, 35.14, 4.59, 44.04]
        },
        "fr": {
            "idField": "insee",
            "nameField": "nom",
            "higherNameField": "dep",
            "minzoom": 3,
            "maxzoom": 11,
            "defaultBounds": [-5.45, 41.26, 9.87, 51.27]
        },
        "cat": {
            "idField": "codine",
            "nameField": "nameunit",
            "higherNameField": "nameprov",
            "minzoom": 5,
            "maxzoom": 11,
            "defaultBounds": [0.16, 40.52, 3.32, 42.86]

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
                    ['boolean', ['feature-state', 'tweet'], false], '#ca562c', '#edeac2'
                ],
                'fill-outline-color': ['case',
                    ['boolean', ['feature-state', 'tweet'], false], '#4A4A4A', '#636363'
                ],
            }
        }]
    }

    let map = new maplibregl.Map({
        container: 'map',
        style: style,
        bounds: mapConf["defaultBounds"]
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
        Object.keys(window.MunibotTweets.tweets).forEach(function(key, index) {
            map.setFeatureState({
                'source': code,
                'sourceLayer': code,
                'id': key
            }, {
                'tweet': true,
                'tweet_status': window.MunibotTweets.tweets[key]
            });
        });
    });

    map.addControl(new maplibregl.NavigationControl());

    initCounts()

    initExtentMap(code, map)
}

function initCounts() {
    let tweeted = window.MunibotTweets.tweeted
    let total = window.MunibotTweets.total
    let content = `| ${tweeted} tweets / ${total} total (${parseInt(tweeted/total*100)}%)`
    document.getElementsByClassName("counts")[0].append(
        document.createElement('li').appendChild(
            document.createTextNode(content)))
}


function initExtentMap(code, map) {
    if (code == 'es') {
        document.querySelectorAll('#extent-map > div').forEach(function(element) {
            element.addEventListener(
                'click',
                function(e) {
                    let extent = JSON.parse(e.target.dataset.extent)
                    map.fitBounds(extent)
                }
            )
        })
    }
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