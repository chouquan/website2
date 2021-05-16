const TYPES = [
    {
        id: 0,
        key: 'k0',
        color: '#C088B7',
        name: 'Low-medium risk and more traffic calming',
    },
    {
        id: 1,
        key: 'k1',
        color: '#8DD3C8',
        name: 'Low risk but cycling inactive',
    },
    {
        id: 2,
        key: 'k2',
        color: '#FA7E74',
        name: 'High risk and cycling active',
    },
    {
        id: 3,
        key: 'k3',
        color: '#FFED71',
        name: 'Medium risk and cycling dependent',
    },
    {
        id: 4,
        key: 'k4',
        color: '#B3DE6A',
        name: 'Low-medium risk and more crossings',
    },
]

$(function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGlhb3lvdWxlIiwiYSI6ImNrb25ubzh1NTAycGIyb3MxcmphNGdjOTUifQ.mpDrgUUVzIpB8QfmTD0o8g'

    let map
    let hoveredStateId
    let hoveredStateKey

    // Add map.
    let groupData

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-0.096785830515833, 51.523249599563187],
        zoom: 10
    })
    //Render data by key.
    const signs = {}
    const renderDataByKey = (key) => {
        const {color, id} = TYPES.find(x => x.key === key)

        const features = groupData[id]

        const data = {
            type: 'geojson',
            data: {
                'type': 'FeatureCollection',
                features
            }
        }

        if (!map.getSource(key)) {
            map.addSource(key, data)
            signs[key] = true

        }

        const layerId = key + '_'
       // Add polygon layer by key.
        map.addLayer({
            id: layerId,
            'type': 'fill',
            'source': key,
            'paint': {
                'fill-color': color,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.7
                ]
            }
        })
        // Add outline layer around the polygon by key.
        map.addLayer({
            'id': `${layerId}outline`,
            'type': 'line',
            'source': key,
            'layout': {},
            'paint': {
                'line-color': "#666666",
                'line-width': 0.3,

            }
        });
        // Get properties of MSOAS and display in page container.
        if (signs[key]) {
            map.on('click', layerId, function (e) {
                const {properties, id} = e.features[0]
                console.info('properties', properties)
                const {MSOA11NM, accidents_num,casualties_num, infra_num,origin_ratio} = properties
                $('#borough').text(MSOA11NM)
                $('#accidents_num').text(accidents_num)
                $('#casualties_num').text(casualties_num)
                $('#infra_num').text(infra_num)
                $('#origin_ratio').text(origin_ratio*100+"%")
                //Get properties from types config
                const {name} = TYPES.find(x => x.key === key)

                $('#cluster').text(name || '')

                if (hoveredStateId) {
                    map.setFeatureState(
                        {source: hoveredStateKey, id: hoveredStateId},
                        {hover: false}
                    )
                }
                hoveredStateId = id
                hoveredStateKey = key
                map.setFeatureState(
                    {source: key, id},
                    {hover: true}
                )

            })

        }
        delete signs[key]
    }
    //Remove existing data.
    const removeDataByKey = (key) => {
        const layerId = key + '_'
        if (map.getLayer(layerId)) map.removeLayer(layerId)
    }
    //Get data by clusering results.
    const loadData = (typeKeys = TYPES.map(({key}) => key)) => {
        $.get('./static/data/msoa_gdf_4326_NEW.geojson', (data) => {
            const {features} = data
            let id = 0
            groupData = features.reduce((acc, now) => {
                const {properties: {kmeans_results}} = now
                const gData = acc[kmeans_results] || []
                gData.push({...now, id})
                acc[kmeans_results] = gData
                id++
                return acc
            }, {})
            for (const key of typeKeys) {
                renderDataByKey(key)
            }
        })
    }
    //Control switch buttons to display layers.
    const renderPanel = () => {
        let html = ''
        for (const t of TYPES) {
            const {key, name} = t
            html += `
               <div>
                    <div class="testswitch">
                        <input class="testswitch-checkbox" id="${key}" data-id="${key}" type="checkbox" checked>
                        <label class="testswitch-label" for="${key}">
                            <span class="testswitch-inner ${key}" data-on="ON" data-off="OFF"></span>
                            <span class="testswitch-switch"></span>
                        </label>
                    </div>
                    <span class="switch_name">${name || key}</span>

               </div>
            `
        }
        $('#switchs').html(html)
        $(document).on('click', 'input[type=checkbox]', (event) => {
            const $this = $(event.target)
            const key = $this.attr('data-id')
            if ($this.is(':checked')) {
                renderDataByKey(key)
            } else {
                removeDataByKey(key)
            }
        })


    }

    renderPanel()
    map.on('load', () => {
        loadData()
    })
})
