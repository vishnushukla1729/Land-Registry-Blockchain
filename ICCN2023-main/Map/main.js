var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?',
{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | GIS Simplified'
});




const lat = 28.4744;
const lng = 77.5040;
const zoom = 8;


var map = L.map('map', {
center: [22.735656, 79.892578],
zoom: 5,
zoomControl: false,
layers: [baseLayer],
preferCanvas: true,
fullscreenControl: true,
updateWhenZooming:false,
});

L.control.zoom({ position: "bottomleft" }).addTo(map);

var info = L.control();

// HOVER INFO

info.onAdd = function (map) {
this._div = L.DomUtil.create('div', 'info');
this.update();
return this._div;
};

info.update = function (props) {
this._div.innerHTML = '<h1 style: "center">LAND REGISTRY SYSTEM</h1>';
};

info.addTo(map);




  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
  
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Legend</h4>";
  div.innerHTML += '<i style="background: #477AC2"></i><span>L1</span><br>';
  div.innerHTML += '<i style="background: #448D40"></i><span>L2</span><br>';
  div.innerHTML += '<i style="background: #E6E696"></i><span>L3</span><br>';
  div.innerHTML += '<i style="background: #E8E6E0"></i><span>L4</span><br>';
  div.innerHTML += '<i style="background: #FFFFFF"></i><span>L5</span><br>';
  div.innerHTML += '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>LEGEND</span><br>';
  return div
  };
  
  legend.addTo(map);

// location locate

  L.control.locate({
    position: "topright"
    
  }).addTo(map);
  
  
  
  
  
  
  // --------------------------------------------------------------
  // create seearch button
  
  const buttonTemplate = `<div class="leaflet-search"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path></svg></div><div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." /><div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div></div>`;
  
  // create custom button
  const customControl = L.Control.extend({
  // button position
  options: {
  position: "topleft",
  className: "leaflet-autocomplete",
  },
  
  // method
  onAdd: function () {
  return this._initialLayout();
  },
  
  _initialLayout: function () {
  // create button
  const container = L.DomUtil.create(
    "div",
    "leaflet-bar " + this.options.className
  );
  
  L.DomEvent.disableClickPropagation(container);
  
  container.innerHTML = buttonTemplate;
  
  return container;
  },
  });
  
  // adding new button to map controll
  map.addControl(new customControl());
  
  // --------------------------------------------------------------
  
  // input element
  const root = document.getElementById("marker");
  
  function addClassToParent() {
  const searchBtn = document.querySelector(".leaflet-search");
  searchBtn.addEventListener("click", (e) => {
  // toggle class
  e.target
    .closest(".leaflet-autocomplete")
    .classList.toggle("active-autocomplete");
  
  // add placeholder
  root.placeholder = "Search ...";
  
  // focus on input
  root.focus();
  
  // click on clear button
  clickOnClearButton();
  });
  }
  
  // function click on clear button
  function clickOnClearButton() {
  document.querySelector(".auto-clear").click();
  }
  
  addClassToParent();
  
  // function clear input
  map.on("click", () => {
  document
  .querySelector(".leaflet-autocomplete")
  .classList.remove("active-autocomplete");
  
  clickOnClearButton();
  });
  
  // autocomplete section
  // 
  // more config find in https://github.com/tomik23/autocomplete
  // --------------------------------------------------------------
  
  new Autocomplete("marker", {
  delay: 1000,
  selectFirst: true,
  howManyCharacters: 2,
  
  onSearch: function ({ currentValue }) {
  const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
    currentValue
  )}`;
  
  /**
   * Promise
   */
  return new Promise((resolve) => {
    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        resolve(data.features);
      })
      .catch((error) => {
        console.error(error);
      });
  });
  },
  
  onResults: ({ currentValue, matches, template }) => {
  const regex = new RegExp(currentValue, "i");
  // checking if we have results if we don't
  // take data from the noResults method
  return matches === 0
    ? template
    : matches
        .map((element) => {
          return `
            <li role="option">
              <p>${element.properties.display_name.replace(
                regex,
                (str) => `<b>${str}</b>`
              )}</p>
            </li> `;
        })
        .join("");
  },
  
  onSubmit: ({ object }) => {
  const { display_name } = object.properties;
  const cord = object.geometry.coordinates;
  // custom id for marker
  // const customId = Math.random();
  
  // remove last marker
  map.eachLayer(function (layer) {
    if (layer.options && layer.options.pane === "markerPane") {
      if (layer._icon.classList.contains("leaflet-marker-locate")) {
        map.removeLayer(layer);
      }
    }
  });
  
  // add marker
  const marker = L.marker([cord[1], cord[0]], {
    title: display_name,
  });
  
  // add marker to map
  marker.addTo(map).bindPopup(display_name);
  
  // set marker to coordinates
  map.setView([cord[1], cord[0]], 8);
  
  // add class to marker
  L.DomUtil.addClass(marker._icon, "leaflet-marker-locate");
  },
  
  // the method presents no results
  noResults: ({ currentValue, template }) =>
  template(`<li>No results found: "${currentValue}"</li>`),
  });
  
  
  const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  const cartoDB = '<a href="http://cartodb.com/attributions">CartoDB</a>';
  
  const osmUrl = "http://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttrib = `&copy; ${osmLink} Contributors`;
  const landUrl =
  "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png";
  const cartoAttrib = `&copy; ${osmLink} Contributors & ${cartoDB}`;
  
  const osmMap = L.tileLayer(osmUrl, { attribution: osmAttrib });
  const landMap = L.tileLayer(landUrl, { attribution: cartoAttrib });
  var stamenLayer = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
        "Map data {attribution.OpenStreetMap}",
    }
  )
  
  
  // config map
  
  
  var baseLayers = {
  "OSM Mapnik": osmMap,
  "CartoDB": landMap,
  "Stamen" : stamenLayer
  };
  
  L.control.layers(null, baseLayers, {position: 'topleft'}).addTo(map);
  
  
  var cl =1;
  
  var drawnItems = L.featureGroup().addTo(map);
  // load geojson from localstorage
    
  const geojsonFromLocalStorage = JSON.parse(localStorage.getItem("geojson"));
    
  function setGeojsonToMap(geojson) {
    const feature = L.geoJSON(geojson, {
      style: function (feature) {
        return {
          color: "red",
          weight: 2,
        };
      },
      pointToLayer: (feature, latlng) => {
        if (feature.properties.type === "circle") {
          return new L.circle(latlng, {
            radius: feature.properties.radius,
          });
        } else if (feature.properties.type === "circlemarker") {
          return new L.circleMarker(latlng, {
            radius: 10,
          });
        } else {
          return new L.Marker(latlng);
        }
      },
      onEachFeature: function (feature, layer) {
        drawnItems.addLayer(layer);
        addPopup(layer);
  
        feature = (layer.feature = layer.feature || {});
        let props = (feature.properties = feature.properties || {});
  
  
      },
    }).addTo(map);
  
    map.flyToBounds(feature.getBounds());
  }
  
  // if (geojsonFromLocalStorage) {
  //   setGeojsonToMap(geojsonFromLocalStorage);
  // }
  
  // --------------------------------------------------
  // get geojson from file
  
  function openFile(event) {
    const input = event.target;
  
    const reader = new FileReader();
    reader.onload = function () {
      const result = reader.result;
      const geojson = JSON.parse(result);
  
      Notiflix.Notify.info("The data has been loaded from the file");
  
      setGeojsonToMap(geojson);
    };
    reader.readAsText(input.files[0]);
  }
  
  
  
  
  
  function arr(){
  
    if(cl==1){
    /// GEOJSON DELETE AND ADD
    
    Notiflix.Notify.init({
    width: "280px",
    position: "right-bottom",
    distance: "10px",
    });
    
    // --------------------------------------------------
    // add buttons to map
    
    const customControl2 = L.Control.extend({
    // button position
    options: {
    position: "topright",
    },
    
    // method
    onAdd: function () {
    const array = [
      {
        title: "export features geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-export'></use></svg>",
        className: "export link-button leaflet-bar",
      },
      {
        title: "save geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-add'></use></svg>",
        className: "save link-button leaflet-bar",
      },
      {
        title: "remove geojson",
        html: "<svg class='icon-geojson'><use xlink:href='#icon-remove'></use></svg>",
        className: "remove link-button leaflet-bar",
      },
      {
        title: "load gejson from file",
        html: "<input type='file' id='geojson' class='geojson' accept='text/plain, text/json, .geojson' onchange='openFile(event)' /><label for='geojson'><svg class='icon-geojson'><use xlink:href='#icon-import'></use></svg></label>",
        className: "load link-button leaflet-bar",
      },
  
      
    ];
    
    const container = L.DomUtil.create(
      "div",
      "leaflet-control leaflet-action-button"
    );
    
    array.forEach((item) => {
      const button = L.DomUtil.create("a");
      button.href = "#";
      button.setAttribute("role", "button");
    
      button.title = item.title;
      button.innerHTML = item.html;
      button.className += item.className;
    
      // add buttons to container;
      container.appendChild(button);
    });
    
    return container;
    },
    });
    map.addControl(new customControl2());
    
  
  
    // Drow polygon, circle, rectangle, polyline
    // --------------------------------------------------
    
  
    
    map.addControl(
    new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
      poly: {
        allowIntersection: false,
      },
    },
    draw: {
      polygon : false,
    polyline : false,
    rectangle : false,
    circle : false,
    },
    })
    );
    
    map.on(L.Draw.Event.CREATED, function (event) {
    let layer = event.layer;
    let feature = (layer.feature = layer.feature || {});
    let type = event.layerType;
    
    feature.type = feature.type || "Feature";
    let props = (feature.properties = feature.properties || {});
  
  
    if (type === "circle") {
    props.radius = layer.getRadius();
    }
    
    drawnItems.addLayer(layer);
    addPopup(layer);
    });
    
    
    
    
    
    // --------------------------------------------------
    // save geojson to file
    
    const exportJSON = document.querySelector(".export");
    
    exportJSON.addEventListener("click", () => {
    // Extract GeoJson from featureGroup
    const data = drawnItems.toGeoJSON();
    
    if (data.features.length === 0) {
    Notiflix.Notify.failure("You must have some data to save a geojson file");
    return;
    } else {
    Notiflix.Notify.info("You can save the data to a geojson");
    }
    
  
    for(let i=0;i<data.length;i++){
      delete data[i].filename;
  }
  
   // data  = newArray;
  
    // Stringify the GeoJson
    const convertedData =
    "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  
   
  
  
    exportJSON.setAttribute("href", "data:" + convertedData);
    exportJSON.setAttribute("download", "data.geojson");
    });
    
    // --------------------------------------------------
    // save geojson to localstorage
    const saveJSON = document.querySelector(".save");
    
    saveJSON.addEventListener("click", (e) => {
    e.preventDefault();
    
    const data = drawnItems.toGeoJSON();
    
    if (data.features.length === 0) {
    Notiflix.Notify.failure("You must have some data to save it");
    return;
    } else {
    Notiflix.Notify.success("The data has been saved to localstorage");
    }
    
    localStorage.setItem("geojson", JSON.stringify(data));
    });
    
    // --------------------------------------------------
    // remove gojson from localstorage
    
    const removeJSON = document.querySelector(".remove");
    
    removeJSON.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("geojson");
    
    Notiflix.Notify.info("All layers have been deleted");
    
    drawnItems.eachLayer(function (layer) {
    drawnItems.removeLayer(layer);
    });
    });
    
    
    // --------------------------------------------------
  }
  
  cl =0;
  
  }
    
    
  
  L.easyButton( '<span class="star">&starf;</span>', function(){
  arr();
  }).addTo(map);
  
  // Earth Button
  // Map Button
  
  
  
  var buttons = []; // NOTE: use a separate array to collect the buttons
  var coords = [[20.59,78.96],[7.118342,20.962716]]

  var zooms2 = [[5],[4]]
  var fileTime = ["Map","Earth","Chat"]
  for (var i = 0; i < fileTime.length; i++) {
    (function() {
      var time = String(fileTime[i])
      let zo = zooms2[i]
      var mybutton = L.easyButton({
        states: [{
          icon: '<strong>' + time + '</strong>',
          onClick : function(e){
            if(time=='Map'){
              let co = map.getCenter();
              let URL= 'https://www.google.com/maps/dir/?api=1&destination='+co.lat+','+co.lng
              window.open(URL,"_blank");
            }
            else{
              let co = map.getCenter();
              let URL = 'https://earth.google.com/web/search/+'+co.lat+'°,+'+co.lng
              window.open(URL,"_blank");
            }
            if(time='Chat'){
              
            }            //map.flyTo(co, 5);
          }
        }]
      });
      buttons.push(mybutton) // NOTE: add to the buttons array instead of the map
    })();
  }
  
  var bar = L.easyBar(buttons, {
    id: 'myeasybar',
    position: 'topright'
  }); // NOTE: create an easyBar 
  
  bar.addTo(map); 
  
  var buttons = []; // NOTE: use a separate array to collect the buttons
  var coords = [[20.59,78.96],[7.118342,20.962716]]

  var zooms2 = [[5],[4]]  
  var bar = L.easyBar(buttons, {
    id: 'myeasybar',
    position: 'topright'
  }); // NOTE: create an easyBar 
  
  bar.addTo(map); 
  
  
  
  const htmlTemplate =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';
  
  // const customControl3 = L.Control.extend({
  // // button position
  // options: {
  // position: "topright",
  // },
  
  // // method
  // onAdd: function (map) {
  // console.log(map.getCenter());
  // // create button
  // const btn = L.DomUtil.create("button");
  // btn.title = "back to home";
  // btn.innerHTML = htmlTemplate;
  // btn.className += "leaflet-bar back-to-home hidden";
  
  // return btn;
  // },
  // });
  
  // // adding new button to map controll
  // map.addControl(new customControl3());
  
  // on drag end
  
  
  // const buttonBackToHome = document.querySelector(".back-to-home");
  // buttonBackToHome.classList.remove("hidden");
  
  // buttonBackToHome.addEventListener("click", () => {
  //   map.flyTo([lat, lng], 5);
  //   });

  var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
    });
  
    var redIcon = new L.Icon({
    iconUrl: "marker-icon-2x-red.png",
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
    });
  
    var violetIcon = new L.Icon({
      iconUrl: "marker-icon-2x-violet.png",
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
      });
  
    var shopIcon = new L.Icon({
      iconUrl: "shop-icon.jpg",
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
      });
      
  
  

  var hmm="";
  
  function addPopup(layer) {
  
    let popupContent = `
      <form class="popup-form">  
        <div class="form-group">
          <label class="mb-0" for="comment">Comment:</label>
          <textarea class="form-control" rows="4" class="comment" id="check"></textarea>${
            hmm
          }
        </div>
        <div class="d-flex">  
          <button class="delete-button btn btn-outline-danger btn-sm ml-auto">
            Save
          </button>
        </div>
      </form>
      `;
  
  
    layer.bindPopup(popupContent).on("popupopen", () => {
  
      let s = document.getElementById('check');
      let props = layer.feature.properties; 
      let stri;
        if(props){
           stri = ""; 
          for(const prop in props){
              stri+=prop+":"+props[prop]+"\n"
          }
        }
      s.value = stri;
  
  
      $(".delete-button").on("click", e => {
        e.preventDefault();
        if (layer.feature.properties){
       // console.log(layer.feature.properties.NAME_1);
  
        let textArray = s.value.split("::");
        console.log(textArray[0]+":"+textArray[1]);
  
        layer.feature.properties[textArray[0]] = textArray[1];
        hmm = textArray[1];
        }
          // marker to cluster marker group

        let cor = layer._latlng
        //console.log(cor)
        
        let markert = L.marker(new L.LatLng(cor.lat, cor.lng), {icon: redIcon});
        const customOption = {
          minWidth: "250", // set max-width
          keepInView: false,
          className : 'customPopup'
        };

        let URL= "https://www.google.com/maps/dir/?api=1&destination="+cor.lat+','+cor.lng;

        let URL2= 'http://127.0.0.1:8060/'

        markert.bindPopup( 
        
          '<div class="content-pop">'+
      
          "Name : "+layer.feature.properties.Name + '<br>'
          +
         '<br>'+
         '<button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL  +"'" +');' +'"' + '>Get Directions</button>'+'</center>'
         +
         '<br><br> <button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL2  +"'" +');' +'"' + '>Chat Room</button>'+'</center>'+
         +
         '</div>'
       
        ,customOption);

        ind_playmarkers.addLayer(markert);
        drawnItems.removeLayer(layer);
        //map.removeLayer(layer);
          // end of marker to cluster marker group

      });
    });
  
  }
  
  function runTabs() {
    const tabs = new Tabby("[data-tabs]");
  }
  
  function overflowstyle(){
    document.getElementById('info').className = 'changeoverflow';
    document.getElementsByClassName('linker')[0].remove();
  }

  



  

var world_playsmarkers = L.markerClusterGroup();
var ind_playmarkers = L.markerClusterGroup();
var stadiumMarkers = L.markerClusterGroup();
var shopMarkers = L.markerClusterGroup();
var femaleMarkers = L.markerClusterGroup();



L.geoJSON(world_plays, {
  pointToLayer : function(feature, latlng){
    var marker = L.marker(latlng);
    //console.log(marker);
    marker.bindPopup(
    //     "Type : " +
    // feature.properties.feature_type +
    // "<br>Purpose:" +
    // feature.properties.purpose +
    // "<br>Organisation:" +
    // feature.properties.organisation +
    // "<br>Status:" +
    // feature.properties.status
    
    );
    marker.addTo(world_playsmarkers);
    return marker;
  }
});




for (var i = 0; i < ind_plays.length; i++) {
  var a = ind_plays[i];
  //console.log(a);
  var title = a.Name +"\n"+ a.Freq+"\n" +a.Code;
    
    if(a.Type=='rcheck'){
        
    var marker = L.marker(new L.LatLng(a.Latitude, a.Longitude), {icon: greenIcon});
  }
  else{
    var marker = L.marker(new L.LatLng(a.Latitude, a.Longitude), {icon: redIcon});
  }
  
  const customOption = {
    minWidth: "250", // set max-width
    keepInView: false,
    className : 'customPopup'
  };

  let URL= "https://www.google.com/maps/dir/?api=1&destination="+a.Latitude+','+a.Longitude
  let URL2= 'http://127.0.0.1:8060/'
  let imloc = 'images/'
  if(a.Type=='Gully Cricket') imloc +='gully.jpg'
  else if(a.Type=='Park') imloc+='park.jpg'
  else if(a.Type=='Cricket Ground') imloc+='ground.jpg'
  else imloc+='nets.jpg'

  

  marker.bindPopup( 
  
    '<div class="content-pop">'+

    "Player Name : "+a['Name'] + '<br>'+'<br>'+


  '<img src= ' + ' " '  +imloc+ ' " '+ 'height="220px" width=:"220px"/>'+
    '<br>'+
   "ID : " +  a.Code +'<br> <center>'+
   "Ball : " + a.Freq + '<br>'+
   'Type : '+ a.Type+
   '<br> <br>'+

   '<button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL  +"'" +');' +'"' + '>Get Directions</button>'+'</center>'+
    '<br>'+
   '<button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL2  +"'" +');' +'"' + '>Chat Room</button>'+'</center>'+
   '</div>'
 
  ,customOption);
  let ran = Math.floor(Math.random() * 5);
  if(ran==2){
    femaleMarkers.addLayer(marker);
  }

  ind_playmarkers.addLayer(marker);
}


for (var i = 0; i < stads.length; i++) {
  var a = stads[i];
  //console.log(a);
  var title = a.Name ;
    

        if(a.Type=='rcheck'){
 
    var marker = L.circleMarker(new L.LatLng(a.Latitude, a.Longitude), {icon: greenIcon});
  }
  else{
    var marker = L.circleMarker(new L.LatLng(a.Latitude, a.Longitude), {icon: redIcon});
  }
  const customOption = {
    minWidth: "250", // set max-width
    keepInView: false,
    className : 'customPopup'
  };

  let imarray = ['d1.jpg','d2.jpg','d3.jpg','d4.jpg']
  let ran = Math.floor(Math.random() * imarray.length);
  let URL= "https://www.t20worldcup.com/"
  
  let imloc = 'images/'+imarray[ran];
  marker.bindPopup( 
  
    '<div class="content-pop">'+

    "Stadium Name : "+a['Name'] + '<br>'+'<br>'+


  '<img src= ' + ' " '  +imloc+ ' " '+ 'height="220px" width=:"220px"/>'+
    '<br>'+
   "Capacity : 60,000"  +'<br> <br> <center>'+
   '<button class="button-7" role="button">See Schedule</button>'+'</center>'
    +
   '<br>'+
   '<button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL  +"'" +');' +'"' + '>Buy Tickets</button>'+'</center>'+
    
   '</div>'
 
  ,customOption);

  stadiumMarkers.addLayer(marker);
}


for (var i = 0; i < shops.length; i++) {
  var a = shops[i];
  //console.log(a);
  var title = a.Name ;
        if(a.Type=='rcheck'){
    var marker = L.marker(new L.LatLng(a.Latitude, a.Longtitude), {icon: greenIcon,title: title});
  }
  else{
    var marker = L.marker(new L.LatLng(a.Latitude, a.Longtitude), {icon: violetIcon,title: title}).on('click', function(e) {
      console.log(e.latlng);
  });;
  }

  const customOption = {
    minWidth: "250", // set max-width
    keepInView: false,
    className : 'customPopup'
  };

  imarray = ['s1.jpg','s2.jpg','s3.jpg','s4.jpg']
  let ran = Math.floor(Math.random() * imarray.length);
  let URL= "https://www.google.com/maps/dir/?api=1&destination="+a.Latitude+','+a.Longtitude
  let imloc = 'images/'+imarray[ran];
  marker.bindPopup( 
  
    '<div class="content-pop">'+

    "Shop Name : "+a['Shop Owner'] + '<br>'+'<br>'+


  '<img src= ' + ' " '  +imloc+ ' " '+ 'height="220px" width=:"220px"/>'+
    '<br>'+
   "ID : " + a.ID +'<br> <br> <center>'+
   '<button class="button-7" role="button">See Prices</button>'+'</center>'
    +
   '<br>'+
   '<button class="button-7" role="button" '+ 'onclick='+ '"' +'window.open(' +"'" + URL  +"'" +');' +'"' + '>Get Directions</button>'+'</center>'+
    
   '</div>'
 
  ,customOption);
  shopMarkers.addLayer(marker);
}


var overlayLayers= {
  "World ":world_playsmarkers,
  "India ":ind_playmarkers,
  'Stadiums' :stadiumMarkers,
  'Shops':shopMarkers,
  'Female' : femaleMarkers
  };



L.control.layers(null,overlayLayers).addTo(map);






