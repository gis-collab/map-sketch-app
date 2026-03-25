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
    //polygon: true,
    polyline: true,
    //rectangle: true,
    //circle: false,
    //marker: true
  }
});

map.addControl(drawControl);

// 7. Guardar lo que dibuja el usuario
map.on(L.Draw.Event.CREATED, function (event) {
  drawnItems.addLayer(event.layer);
});

// 8. Función para agregar iconos
function selectIcon(tipo) {
  placingIcon = tipo;
}

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

    // 📏 Medidas base
    const pageWidth = 297;
    const pageHeight = 210;

    const margin = 5;
    const bottomHeight = 40;

    // 🗺️ MAPA (arriba)
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin,
      pageWidth - (margin * 2),
      pageHeight - bottomHeight - margin
    );

    // 🔲 LÍNEA SEPARADORA
    pdf.line(
      margin,
      pageHeight - bottomHeight,
      pageWidth - margin,
      pageHeight - bottomHeight
    );

    // =========================
    // 📋 FRANJA INFERIOR
    // =========================

    let yStart = pageHeight - bottomHeight;

    // 🟦 BLOQUE IZQUIERDO (logo + info)
    pdf.rect(margin, yStart, 60, bottomHeight);

    pdf.setFontSize(8);
    pdf.text("ACUEDUCTO", margin + 5, yStart + 10);
    pdf.text("PMT POR EMERGENCIA", margin + 5, yStart + 18);
    pdf.text("AC 20 x KR 39", margin + 5, yStart + 24);

    // 🟨 BLOQUE CENTRAL (descripción)
    pdf.rect(margin + 60, yStart, 140, bottomHeight);

    pdf.setFontSize(7);
    pdf.text(
      "ACTIVIDADES PLANIFICADAS, COTIDIANAS Y DE EMERGENCIA EJECUTADAS POR LA EMPRESA DE ACUEDUCTO, ALCANTARILLADO Y ASEO DE BOGOTÁ D.C.",
      margin + 65,
      yStart + 10,
      { maxWidth: 130 }
    );

    // 🟧 BLOQUE DERECHO (convenciones + info)
    pdf.rect(margin + 200, yStart, 92, bottomHeight);

    // subdivisiones internas
    pdf.line(margin + 200, yStart + 15, pageWidth - margin, yStart + 15);
    pdf.line(margin + 260, yStart, margin + 260, pageHeight - margin);

    //  CONVENCIONES DINÁMICAS
    pdf.setFontSize(7);
    pdf.text("CONVENCIONES", margin + 202, yStart + 5);

    // Convertir Set a array
    let lista = Array.from(iconosUsados);

    let yConv = yStart + 10;

    if (lista.length === 0) {
      pdf.text("Sin elementos", margin + 202, yConv);
    } else {
      lista.forEach((item, index) => {
        pdf.text(item, margin + 202, yConv + (index * 5));
      });
    }   

    // 📄 INFO DERECHA
    pdf.text("HORARIO:", margin + 262, yStart + 5);
    pdf.text("8:00 - 18:00", margin + 262, yStart + 10);

    pdf.text("ESCALA: S/N", margin + 262, yStart + 18);
    pdf.text("PLANO 1 DE 1", margin + 262, yStart + 25);

    // 🧾 BORDE GENERAL
    pdf.rect(2, 2, pageWidth - 4, pageHeight - 4);

    pdf.save("plano_profesional.pdf");

  }).catch(error => {
    console.error("Error al exportar:", error);
  });
}
