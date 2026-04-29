var iconosUsados = new Set();
var placingIcon = null;

function enableTextMode() {
  // Quitamos CUALQUIER alert que haya aquí adentro
  placingIcon = 'TEXT_MODE';
  
  // Opcional: solo para que tú sepas que funcionó, lo ponemos en la consola (que no molesta)
  console.log("Modo texto activado");
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

var bounds = [[0,0], [2295, 4000]];
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
  // 1. MODO TEXTO (Escritura directa corregida)
  if (placingIcon === 'TEXT_MODE') {
    const myIcon = L.divIcon({
        // Añadimos 'display: inline-block' para que la caja se ajuste al texto
        html: '<div contenteditable="true" style="display: inline-block; outline: none;" class="text-editable">Escribe aquí...</div>',
        className: 'text-label',
        iconSize: [null, null]
    });

    const marker = L.marker(e.latlng, { icon: myIcon }).addTo(drawnItems);
    
    // Enfocar automáticamente para empezar a escribir de una vez
    setTimeout(() => {
        const el = marker.getElement().querySelector('.text-editable');
        if (el) {
            el.focus();
            // Limpiar el texto de ejemplo al hacer foco
            el.onfocus = function() { if(this.innerText === "Escribe aquí...") this.innerText = ""; };
        }
    }, 100);

    placingIcon = null; 
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
  // 1. Preguntas iniciales
  const horarioUsuario = prompt("Ingrese el horario:", "8:00 - 18:00");
  const direccionUsuario = prompt("Ingrese la dirección:", "AC 20 x KR 39");
  const tipoPmtUsuario = prompt("Ingrese el tipo de PMT:", "PMT POR EMERGENCIA");

  const mapElement = document.getElementById("map");

  html2canvas(mapElement, {
    useCORS: true,
    backgroundColor: "#ffffff",
    scale: 2
  }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    
    // --- CARGA DEL LOGO ---
    const logoImg = new Image();
    logoImg.src = 'tu_logo.png'; // REEMPLAZA CON TU ARCHIVO REAL

    logoImg.onload = function() {
      const pdf = new window.jspdf.jsPDF({
        orientation: "landscape", unit: "mm", format: "a4"
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10; // Aumentado para evitar cortes
      const bottomHeight = 45; // Espacio para el cajetín

      // 1. MAPA (Corregido para que NO se solape con el cajetín)
      // Restamos el margen superior, el inferior y la altura del cajetín
      const mapWidth = pageWidth - (margin * 2);
      const mapHeight = pageHeight - bottomHeight - (margin * 2);
      pdf.addImage(imgData, "PNG", margin, margin, mapWidth, mapHeight);

      // 2. CAJETÍN INFERIOR
      let yStart = pageHeight - bottomHeight - margin + 5;

      // BLOQUE IZQUIERDO (Logo + Info Dinámica)
      pdf.rect(margin, yStart, 60, bottomHeight);
      try {
        pdf.addImage(logoImg, 'PNG', margin + 22, yStart + 2, 15, 8);
      } catch(e) { }
      
      pdf.setFontSize(8);
      pdf.text("ACUEDUCTO", margin + 5, yStart + 15);
      pdf.text(tipoPmtUsuario.toUpperCase(), margin + 5, yStart + 23);
      pdf.text(direccionUsuario.toUpperCase(), margin + 5, yStart + 30);

      // BLOQUE CENTRAL (Descripción)
      pdf.rect(margin + 60, yStart, 140, bottomHeight);
      pdf.setFontSize(7);
      pdf.text("ACTIVIDADES PLANIFICADAS, COTIDIANAS Y DE EMERGENCIA EJECUTADAS POR LA EMPRESA DE ACUEDUCTO, ALCANTARILLADO Y ASEO DE BOGOTÁ D.C.", margin + 65, yStart + 10, { maxWidth: 130 });

      // BLOQUE DERECHO (Convenciones Dinámicas con Iconos)
      pdf.rect(margin + 200, yStart, 92, bottomHeight);
      pdf.line(margin + 200, yStart + 10, margin + 260, yStart + 10); // Bajamos la línea para que no corte
      pdf.line(margin + 260, yStart, margin + 260, yStart + bottomHeight);

      pdf.setFontSize(7);
      pdf.text("CONVENCIONES", margin + 202, yStart + 7);

      // --- LÓGICA DE ICONOS EN CONVENCIONES ---
      let listaKeys = Object.keys(configuracionIconos).filter(key => 
        iconosUsados.has(configuracionIconos[key].label)
      );

      let yConv = yStart + 15;
      if (listaKeys.length === 0) {
        pdf.text("Sin elementos", margin + 202, yConv);
      } else {
        listaKeys.forEach((key, index) => {
          if (index < 6) { // Para que no se salgan del cuadro
            const iconUrl = configuracionIconos[key].url;
            const label = configuracionIconos[key].label;
            
            // Intentar dibujar el iconito al lado del texto
            try {
              const iconImg = new Image();
              iconImg.src = iconUrl; 
              // Dibujamos el icono pequeño (5x5 mm)
              pdf.addImage(iconImg, 'PNG', margin + 202, yConv + (index * 5) - 3, 5, 5);
            } catch(e) {}
            
            pdf.text(label, margin + 208, yConv + (index * 5));
          }
        });
      }

      // HORARIO Y DATOS FINALES
      pdf.text("HORARIO:", margin + 262, yStart + 7);
      pdf.text(horarioUsuario, margin + 262, yStart + 13);
      pdf.text("ESCALA: S/N", margin + 262, yStart + 22);
      pdf.text("PLANO 1 DE 1", margin + 262, yStart + 32);

      // Marco exterior del plano
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      pdf.save(`Plano_${direccionUsuario.replace(/ /g, "_")}.pdf`);
    };

    logoImg.onerror = function() { logoImg.onload(); };
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
