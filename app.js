var iconosUsados = new Set();
var placingIcon = null;

// --- 1. CONFIGURACIÓN DE ICONOS ---
// Definimos un objeto para no repetir código
const configuracionIconos = {
  "banderero": { url: 'banderero.png', label: "👷 Banderero" },
  "colombinas": { url: 'Colombinas.png', label: "🚧 Colombinas" },
  "desvio": { url: 'desvio.png', label: "↪️ Desvío" },
  "imag01": { url: 'Imag01.png', label: "📍 Indicador 01" },
  "imag02": { url: 'Imag02.png', label: "📍 Indicador 02" },
  "obra": { url: 'Obra_via.png', label: "⚠️ Obra en vía" },
  "velocidad": { url: 'Velocidad.png', label: "🚫 Velocidad" }
};

// Creamos los objetos L.icon de Leaflet dinámicamente
const leafletIcons = {};
for (const key in configuracionIconos) {
  leafletIcons[key] = L.icon({
    iconUrl: configuracionIconos[key].url,
    iconSize: [40, 40],
    iconAnchor: [20, 20] // Centrado
  });
}

// --- 2. CONFIGURACIÓN DEL MAPA ---
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2
});

var bounds = [[0,0], [1000,1000]];
L.imageOverlay('plano.png', bounds).addTo(map);
map.fitBounds(bounds);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// --- 3. CONTROLES DE DIBUJO ---
var drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polygon: false,
    polyline: true,
    rectangle: false,
    circle: false,
    marker: false
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
  drawnItems.addLayer(event.layer);
});

// --- 4. FUNCIONES PARA AGREGAR ICONOS ---
// Ahora una sola función recibe el tipo
function selectIcon(tipo) {
  placingIcon = tipo;
}

// Detectar clic en el mapa
map.on('click', function(e) {
  if (!placingIcon) return;

  const data = configuracionIconos[placingIcon];
  
  if (data) {
    var marker = L.marker(e.latlng, { icon: leafletIcons[placingIcon] });
    drawnItems.addLayer(marker);
    
    // Agregamos a la lista de convenciones para el PDF
    iconosUsados.add(data.label);
  }

  placingIcon = null; // Reset para el siguiente clic
});

function clearMap() {
  drawnItems.clearLayers();
  iconosUsados.clear();
}

// --- 5. EXPORTAR A PDF (Se mantiene tu lógica pro) ---
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

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 5;
    const bottomHeight = 40;

    // MAPA
    pdf.addImage(imgData, "PNG", margin, margin, pageWidth - (margin * 2), pageHeight - bottomHeight - margin);

    // LÍNEA SEPARADORA
    let yStart = pageHeight - bottomHeight;
    pdf.line(margin, yStart, pageWidth - margin, yStart);

    // FRANJA INFERIOR - BLOQUES (Tu diseño original)
    pdf.rect(margin, yStart, 60, bottomHeight);
    pdf.setFontSize(8);
    pdf.text("ACUEDUCTO", margin + 5, yStart + 10);
    pdf.text("PMT POR EMERGENCIA", margin + 5, yStart + 18);
    pdf.text("AC 20 x KR 39", margin + 5, yStart + 24);

    pdf.rect(margin + 60, yStart, 140, bottomHeight);
    pdf.setFontSize(7);
    pdf.text("ACTIVIDADES PLANIFICADAS, COTIDIANAS Y DE EMERGENCIA EJECUTADAS POR LA EMPRESA DE ACUEDUCTO, ALCANTARILLADO Y ASEO DE BOGOTÁ D.C.", margin + 65, yStart + 10, { maxWidth: 130 });

    pdf.rect(margin + 200, yStart, 92, bottomHeight);
    pdf.line(margin + 200, yStart + 15, pageWidth - margin, yStart + 15);
    pdf.line(margin + 260, yStart, margin + 260, pageHeight - margin);

    pdf.setFontSize(7);
    pdf.text("CONVENCIONES", margin + 202, yStart + 5);

    let lista = Array.from(iconosUsados);
    let yConv = yStart + 10;
    if (lista.length === 0) {
      pdf.text("Sin elementos", margin + 202, yConv);
    } else {
      lista.forEach((item, index) => {
        // Ajuste para que no se salgan si hay muchos (2 columnas)
        let xOffset = index > 4 ? 30 : 0; 
        let yOffset = (index % 5) * 4;
        pdf.text(item, margin + 202 + xOffset, yConv + yOffset);
      });
    }   

    pdf.text("HORARIO: 8:00 - 18:00", margin + 262, yStart + 5);
    pdf.text("ESCALA: S/N", margin + 262, yStart + 18);
    pdf.text("PLANO 1 DE 1", margin + 262, yStart + 25);
    pdf.rect(2, 2, pageWidth - 4, pageHeight - 4);

    pdf.save("plano_PMT_emergencia.pdf");
  });
}
