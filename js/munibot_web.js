export function initMap(code) {

    let mapConf = {
      "idField": {
        "es": "codine",
        "fr": "insee",
        "cat": "codine"
      },
      "nameField": {
        "es": "nameunit",
        "fr": "nom",
        "cat": "nameunit"
      },
      "higherNameField": {
        "es": "nameprov",
        "fr": "nom", // TODO
        "cat": "nameprov"
      },
      "defaultZoom": {
        "es": 6,
        "fr": 6,
        "cat": 9
      },
      "defaultCenter": {
        "es": [-3.4190, 40.2057],
        "fr": [2.2167, 46.9916],
        "cat": [1.6850, 41.6880]
      }
    }

    let style = {
        "version": 8,
        "name": "Empty",
        "metadata": {
            "mapbox:autocomposite": true
        },
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
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

    style["sources"][code] = {
        'type': 'vector',
        'tiles': ['http://localhost:9090/maps/' + code + '/{z}/{x}/{y}.pbf?'],
        'minzoom': 5,
        'maxzoom': 11,
        'promoteId': mapConf["idField"][code]
    }

    let map = new maplibregl.Map({
        container: 'map',
        style: style,
        zoom: mapConf["defaultZoom"][code],
        center: mapConf["defaultCenter"][code]
    });
    map.on('click', code, function(e) {
        console.log(e.features)
        let coordinates = e.lngLat;
        let properties = e.features[0].properties;
        let state = e.features[0].state;
        let content = "";
        if (!state.tweet_status) {
            content += properties[mapConf["nameField"][code]] + ' (' + properties[mapConf["higherNameField"][code]] + ')';
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
    // The sourcedata event is an example of MapDataEvent.
    // Set up an event listener on the map.
    map.on('sourcedata', function(e) {
        Object.keys(window.tweets_es).forEach(function(key, index) {
            map.setFeatureState({
                'source': code,
                'sourceLayer': code,
                'id': key
            },
            // TODO
              {
                'tweet': !(window.tweets_es[key] === null),
                'tweet_status': window.tweets_es[key]
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
