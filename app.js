var iconosUsados = new Set();
var placingIcon = null;

function enableTextMode() {
  placingIcon = 'TEXT_MODE';
  alert("Haz clic en el mapa para colocar el texto");
}
// --- 1. CONFIGURACIÓN DE ICONOS (Tus nuevos archivos) ---
const configuracionIconos = {
  "banderero": { url: 'banderero.png', label: "Banderero" },
  "colombinas": { url: 'Colombinas.png', label: "Colombinas" },
  "desvio": { url: 'desvio.png', label: "Desvío" },
  "obra": { url: 'Obra_via.png', label: "Obra en vía" },
  "velocidad": { url: 'Velocidad.png', label: "Velocidad" }
};

const leafletIcons = {};
for (const key in configuracionIconos) {
  leafletIcons[key] = L.icon({
    iconUrl: configuracionIconos[key].url,
    iconSize: [100, 100],
    iconAnchor: [20, 20]
  });
}

// --- 2. CONFIGURACIÓN DEL MAPA ---
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2
});

var bounds = [[0,0], [4000, 2295]];
L.imageOverlay('plano1.png', bounds, { interactive: false }).addTo(map);
map.fitBounds(bounds);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// --- 3. CONTROLES DE DIBUJO ---
var drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polygon: false, polyline: true, rectangle: false, circle: false, marker: false
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
  drawnItems.addLayer(event.layer);
});

// --- 4. FUNCIONES DE ICONOS ---
function selectIcon(tipo) {
  placingIcon = tipo;
}

map.on('click', function(e) {

  console.log("Clic detectado en el mapa. Valor de placingIcon:", placingIcon);
  
  // Si no hay modo activo, no hacemos nada
  if (!placingIcon) return;

  // 1. MODO TEXTO
  if (placingIcon === 'TEXT_MODE') {
    const texto = prompt("Escribe el texto:");
    if (texto) {
      const myIcon = L.divIcon({
        html: texto,
        className: 'text-label',
        iconSize: [null, null]
      });
      // Añadimos directamente a drawnItems para que sea editable
      L.marker(e.latlng, { icon: myIcon }).addTo(drawnItems);
    }
  } 
  // 2. MODO ICONO
  else {
    const data = configuracionIconos[placingIcon];
    if (data) {
      var marker = L.marker(e.latlng, { icon: leafletIcons[placingIcon] });
      drawnItems.addLayer(marker);
      iconosUsados.add(data.label);
    }
    // Solo reseteamos el selector si era un icono
    const selector = document.getElementById("iconSelector");
    if (selector) selector.value = "";
  }
  
  // Limpiamos el modo activo después de usarlo
  placingIcon = null;
});
// --- 5. EXPORTAR PDF (TU CONFIGURACIÓN ORIGINAL) ---
function exportPDF() {
  const mapElement = document.getElementById("map");

  html2canvas(mapElement, {
    useCORS: true,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape", unit: "mm", format: "a4"
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

    // BLOQUE IZQUIERDO (Logo + Info original)
    pdf.rect(margin, yStart, 60, bottomHeight);
    pdf.setFontSize(8);
    pdf.text("ACUEDUCTO", margin + 5, yStart + 10);
    pdf.text("PMT POR EMERGENCIA", margin + 5, yStart + 18);
    pdf.text("AC 20 x KR 39", margin + 5, yStart + 24);

    // BLOQUE CENTRAL (Descripción original)
    pdf.rect(margin + 60, yStart, 140, bottomHeight);
    pdf.setFontSize(7);
    pdf.text("ACTIVIDADES PLANIFICADAS, COTIDIANAS Y DE EMERGENCIA EJECUTADAS POR LA EMPRESA DE ACUEDUCTO, ALCANTARILLADO Y ASEO DE BOGOTÁ D.C.", margin + 65, yStart + 10, { maxWidth: 130 });

    // BLOQUE DERECHO (Convenciones y Horarios original)
    pdf.rect(margin + 200, yStart, 92, bottomHeight);
    pdf.line(margin + 200, yStart + 15, pageWidth - margin, yStart + 15);
    pdf.line(margin + 260, yStart, margin + 260, pageHeight - margin);

    pdf.setFontSize(7);
    pdf.text("CONVENCIONES", margin + 202, yStart + 5);

    // Lista dinámica de convenciones basada en iconos usados
    let lista = Array.from(iconosUsados);
    let yConv = yStart + 10;
    if (lista.length === 0) {
      pdf.text("Sin elementos", margin + 202, yConv);
    } else {
      lista.forEach((item, index) => {
        // Ajuste simple para que quepan varias en el cuadro
        pdf.text("• " + item, margin + 202, yConv + (index * 4));
      });
    }   

    pdf.text("HORARIO:", margin + 262, yStart + 5);
    pdf.text("8:00 - 18:00", margin + 262, yStart + 10);
    pdf.text("ESCALA: S/N", margin + 262, yStart + 18);
    pdf.text("PLANO 1 DE 1", margin + 262, yStart + 25);

    pdf.rect(2, 2, pageWidth - 4, pageHeight - 4);
    pdf.save("plano_profesional.pdf");
  });
}

L.imageOverlay('plano1.png', bounds).addTo(map);

window.addEventListener('load', function() {
    map.invalidateSize();
    
    // Esto es un "truco" para que la imagen ocupe más espacio
    // En lugar de fitBounds, usamos setView con un zoom calculado manualmente
    // 0 es el zoom inicial. Prueba con 0, o sube a 0.5 si quieres más zoom
    map.setView([1968 / 2, 2901 / 2], 0); 
    
    // O si prefieres quedarte con fitBounds pero sin espacios, fuerza esto:
    map.fitBounds(bounds, { padding: [0, 0] });
});
