export function initMap(code) {
    let empty = {
        "version": 8,
        "name": "Empty",
        "metadata": {
            "mapbox:autocomposite": true
        },
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
            "munis_es": {
                'type': 'vector',
                'tiles': ['http://localhost:9090/maps/munis_es/{z}/{x}/{y}.pbf?'],
                'minzoom': 5,
                'maxzoom': 11,
                'promoteId': 'codine'
            }
        },
        "layers": [{
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "rgba(0,0,0,0)"
            }
        }, {
            'id': 'munis_es',
            'type': 'fill',
            'source': 'munis_es',
            'source-layer': 'munis_esp',
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
        style: empty,
        zoom: 6,
        center: [-3.4190, 40.2057]
    });
    map.on('click', 'munis_es', function(e) {
        console.log(e.features)
        let coordinates = e.lngLat;
        let properties = e.features[0].properties;
        let state = e.features[0].state;
        let content = "";
        if (!state.tweet_status) {
            content += properties.nameunit + ' (' + properties.nameprov + ')';
            content += "<div>No tweet yet</div>"
        }
        console.log(properties)
        console.log(e.features[0].state)
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
        //TODO: https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setfeaturestate
        Object.keys(window.tweets_es).forEach(function(key, index) {
            map.setFeatureState({
                'source': 'munis_es',
                'sourceLayer': 'munis_esp',
                'id': key
            }, {
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



initMap("es");
