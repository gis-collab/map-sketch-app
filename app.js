// Estado de qué icono se va a poner
var placingIcon = null;

// Iconos
var icono30 = L.icon({
  iconUrl: 'icono-30.png',
  iconSize: [40, 40]
});

var iconoObra = L.icon({
  iconUrl: 'icono-obra.png',
  iconSize: [40, 40]
});

var iconoDesvio = L.icon({
  iconUrl: 'icono-desvio.png',
  iconSize: [40, 40]
});

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

// 8. Función para agregar iconos

function addIcon30() {
  placingIcon = "30";
}

function addIconObra() {
  placingIcon = "obra";
}

function addIconDesvio() {
  placingIcon = "desvio";
}

// Detectar clic en el mapa
map.on('click', function(e) {

  if (!placingIcon) return;

  let iconoSeleccionado;

  if (placingIcon === "30") {
    iconoSeleccionado = icono30;
  }

  if (placingIcon === "obra") {
    iconoSeleccionado = iconoObra;
  }

  if (placingIcon === "desvio") {
    iconoSeleccionado = iconoDesvio;
  }

  var marker = L.marker(e.latlng, { icon: iconoSeleccionado });
  drawnItems.addLayer(marker);

  placingIcon = null;
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
    backgroundColor: "#ffffff"
  }).then(canvas => {

    const imgData = canvas.toDataURL("image/png");

    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // 🔲 Marco exterior
    pdf.setLineWidth(0.5);
    pdf.rect(5, 5, 287, 200);

    // 🗺️ Área del mapa (izquierda)
    pdf.addImage(imgData, "PNG", 10, 10, 200, 150);

    // 🧾 Caja de título
    pdf.rect(10, 165, 200, 30);
    pdf.setFontSize(10);
    pdf.text("PLANO DE MANEJO DE TRÁFICO", 12, 175);
    pdf.text("Proyecto: ________", 12, 182);
    pdf.text("Fecha: ________", 12, 189);

    // 📊 Caja de convenciones (derecha)
    pdf.rect(215, 10, 70, 120);
    pdf.text("CONVENCIONES", 220, 20);

    // Iconos dibujados 
    pdf.setFontSize(9);
    pdf.text("📍 Punto", 220, 35);
    pdf.text("— Línea", 220, 45);
    pdf.text("⬛ Área", 220, 55);

    // 🧾 Caja inferior derecha
    pdf.rect(215, 135, 70, 60);
    pdf.text("OBSERVACIONES:", 220, 145);

    pdf.save("plano_profesional.pdf");

  }).catch(error => {
    console.error("Error al exportar:", error);
  });
}
