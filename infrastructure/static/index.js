const DATA_TYPE = Object.freeze({
    POINT: 'point',
    LINE: 'line'
})

const POINT_TYPES = [
    {
        key: 'p1',
        color: '#cc0033',
        name: 'Bicycle Accidents',
        type: DATA_TYPE.POINT,
        fileName: 'gdf_accident_4326.geojson'
    },
    {
        key: 'p2',
        color: '#1D62AD',
        name: 'Bicycle Parking',
        type: DATA_TYPE.POINT,
        fileName: 'gdf_par_4326.geojson'
    },
    {
        key: 'p3',
        color: '#F6AE1C',
        name: 'Traffic Signal',
        type: DATA_TYPE.POINT,
        fileName: 'gdf_sig_4326.geojson'
    },
    {
        key: 'p4',
        color: '#74AA6E',
        name: 'Traffic Calming',
        type: DATA_TYPE.POINT,
        fileName: 'gdf_tra_4326 .geojson'
    }
]

const LINE_TYPES = [
    {
        key: 'line1',
        color: '#E5550e',
        name: 'Crossing Line',
        type: DATA_TYPE.LINE,
        fileName: 'gdf_cross_4326.geojson'
    },
    {
        key: 'line2',
        color: '#87CEEB',
        name: 'Cycling Lane',
        type: DATA_TYPE.LINE,
        fileName: 'gdf_lane_4326.geojson'
    },
    {
        key: 'line3',
        color: '#756BB0',
        name: 'Stop Line',
        type: DATA_TYPE.LINE,
        fileName: 'gdf_stop_4326.geojson'
    }
]


const TYPES = [...POINT_TYPES, ...LINE_TYPES]
//Define the properties that each type of data needs to display in popup.
const POPUP_CONFIGS = [
    [['gdf_accident_4326.geojson'], ['date', 'borough', 'severity']],
    [['gdf_par_4326.geojson', 'gdf_sig_4326.geojson', 'gdf_tra_4326 .geojson'],
        ['FEATURE_ID', 'BOROUGH', 'PHOTO1_URL']],
    [['gdf_cross_4326.geojson', 'gdf_lane_4326.geojson', 'gdf_stop_4326.geojson'],
        ['FEATURE_ID', 'BOROUGH', 'PHOTO1_URL']],
]

$(function () {


    mapboxgl.accessToken = 'pk.eyJ1IjoibGlhb3lvdWxlIiwiYSI6ImNrb25ubzh1NTAycGIyb3MxcmphNGdjOTUifQ.mpDrgUUVzIpB8QfmTD0o8g'

    let map

    let groupData = {}

    let popup
    //Add map.
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [ -0.09418634710679682,51.5158711216155],
        zoom: 12.5
    })

    //Add layers of point infrastructure and line infrastructure.
    const getLayoutTmpByType = (type, color) => {
        return type === DATA_TYPE.POINT ?
            {
                'type': 'circle',
                'paint': {
                    'circle-radius': 3,
                    'circle-color': color
                },
                'filter': ['==', '$type', 'Point']
            } : {
                'type': 'line',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': color,
                    'line-width': 3
                },
                'filter': ['==', '$type', 'LineString']
            }
    }
    //Render properties displayed in popup.
    const renderPopupHtml = (properties, fileName) => {

        for (const config of POPUP_CONFIGS) {
            const [conditions, fields] = config
            if (conditions.includes(fileName)) {
                let html = '<div>'
                for (const f of fields) {
                    const v = properties[f]
                    if (v.startsWith('http')) {
                        html += `<img class="img" src="${v}"/>`

                    } else {

                        html += `<div class="popup_row">${properties[f]}</div>`
                    }
                }
                html += '</div>'
                return html
            }
        }
        console.warn('not found :', fileName)
    }

    //Render data and properties by key.
    const signs = {}
    const renderDataByKey = (key) => {
        const data = groupData[key]
        const dataSource = {
            type: 'geojson',
            data
        }
        if (!map.getSource(key)) {
            map.addSource(key, dataSource)
            signs[key] = true
        }

        const {color, type, fileName} = TYPES.find(x => x.key === key)
        const layerId = key + '_'

        console.info('dataSource', dataSource)
        //Add layers by key.
        const tmp = getLayoutTmpByType(type, color)
        const layerConfig = {
            'id': layerId,
            'source': key,
            ...tmp
        }
        map.addLayer(layerConfig)
        //Output properties to popup.
        if (signs[key]) {
            map.off('click').on('click', layerId, function (e) {
                console.info('on click')
                const {lngLat} = e
                console.info('e', e)
                const {properties} = e.features[0]
                const popupHtml = renderPopupHtml(properties, fileName)
                new mapboxgl.Popup().addTo(map).setLngLat(lngLat)
                    .setHTML(
                        popupHtml
                    )
            })
        }


        delete signs[key]
    }
    //Remove existing data by key.
    const removeDataByKey = (key) => {
        const layerId = key + '_'
        if (map.getLayer(layerId)) map.removeLayer(layerId)
    }
    //Load datafile by key.
    const loadData = (typeKeys = TYPES.map(({key}) => key)) => {


        typeKeys.forEach(k => {
            const {type, fileName, key} = TYPES.find(x => x.key === k)
            $.get(`./static/${type}/${fileName}`, (data) => {
                groupData[key] = data
                renderDataByKey(key)
            })
        })
    }
    //Control switch buttons to display layers.
    const renderPanel = () => {

        const pointPanel = POINT_TYPES.reduce((acc, x) => {
                const {key, name} = x
                acc += `
               <div>
                    <div class="testswitch">
                        <input class="testswitch-checkbox" id="${key}" data-id="${key}" type="checkbox" checked>
                        <label class="testswitch-label" for="${key}">
                            <span class="testswitch-inner ${key}" data-on="ON" data-off="OFF"></span>
                            <span class="testswitch-switch"></span>
                        </label>
                    </div>
                    <span class="switch_name">${name}</span>
               </div>
            `
                return acc
            }, ''
        )
        $('#switchs_p').html(pointPanel)

        const linePanel = LINE_TYPES.reduce((acc, x) => {
                const {key, name} = x
                acc += `
               <div>
                    <div class="testswitch">
                        <input class="testswitch-checkbox" id="${key}" data-id="${key}" type="checkbox" checked>
                        <label class="testswitch-label" for="${key}">
                            <span class="testswitch-inner ${key}" data-on="ON" data-off="OFF"></span>
                            <span class="testswitch-switch"></span>
                        </label>
                    </div>
                       <span class="switch_name">${name}</span>
               </div>
            `
                return acc
            }, ''
        )
        $('#switchs_l').html(linePanel)

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
        map.addControl(new mapboxgl.NavigationControl({
            showCompass: false
        }), 'top-left');

        loadData()
    })
})
