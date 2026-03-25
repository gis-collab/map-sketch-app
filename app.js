// 1. Crear mapa tipo plano (sin geografía real)
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2
});

// 2. Definir tamaño del plano (AJUSTA SI NO CUADRA)
var bounds = [[0,0], [1000,1000]];

// 3. Cargar imagen del plano
L.imageOverlay('plano.png', bounds).addTo(map);

// 4. Ajustar vista
map.fitBounds(bounds);

// 5. Grupo para dibujos
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// 6. Controles de dibujo
var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: true,
    polyline: true,
    rectangle: true,
    circle: false,
    marker: true
  }
});

map.addControl(drawControl);

// 7. Guardar lo que dibuja el usuario
map.on(L.Draw.Event.CREATED, function (event) {
  drawnItems.addLayer(event.layer);
});

// 8. Función para agregar icono simple
var placingIcon = false;

function addIcon() {
  placingIcon = true;
  alert("Haz clic en el mapa para colocar el icono");
}

// Detectar clic en el mapa
map.on('click', function(e) {
  if (placingIcon) {
    var marker = L.marker(e.latlng);
    drawnItems.addLayer(marker);
    placingIcon = false;
  }
});

// 9. Limpiar mapa
function clearMap() {
  drawnItems.clearLayers();
}

// 10. Exportar a PDF
function exportPDF() {
  const mapElement = document.getElementById("map");

  html2canvas(mapElement, {
    useCORS: true,
    allowTaint: true
  }).then(canvas => {

    const imgData = canvas.toDataURL("image/png");

    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape"
    });

    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("plano.pdf");
  }).catch(error => {
    console.error("Error al exportar:", error);
  });
}