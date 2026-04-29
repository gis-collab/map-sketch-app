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
    // 1. PRIMERO PEDIMOS LOS DATOS (Esto asegura que aparezcan las ventanas)
    const tipoPmt = prompt("Ingrese el tipo de PMT:", "PMT POR EMERGENCIA") || "PMT POR EMERGENCIA";
    const direccion = prompt("Ingrese la dirección:", "AC 20 x KR 39") || "AC 20 x KR 39";
    const horario = prompt("Ingrese el horario:", "8:00 - 18:00") || "8:00 - 18:00";

    const mapElement = document.getElementById("map");

    // Preparamos el logo
    const logoImg = new Image();
    logoImg.src = 'tu_logo.png'; // Asegúrate de que este nombre sea el correcto

    html2canvas(mapElement, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        logoImg.onload = function() {
            const pdf = new window.jspdf.jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

            const pageWidth = 297;
            const pageHeight = 210;
            const margin = 10;
            const bottomHeight = 45;

            // --- SOLUCIÓN AL SOLAPE ---
            // El mapa ahora ocupa un espacio definido que NO toca el cajetín
            const mapWidth = pageWidth - (margin * 2);
            const mapHeight = pageHeight - bottomHeight - (margin * 2);
            pdf.addImage(imgData, "PNG", margin, margin, mapWidth, mapHeight);

            // --- CAJETÍN INFERIOR ---
            let yStart = pageHeight - bottomHeight - 5; // Posición base del cajetín

            // Bloque Izquierdo (Logo + Textos Dinámicos)
            pdf.rect(margin, yStart, 60, bottomHeight);
            try {
                pdf.addImage(logoImg, 'PNG', margin + 20, yStart + 2, 20, 10);
            } catch (e) { console.log("Logo no encontrado"); }
            
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.text("ACUEDUCTO", margin + 5, yStart + 18);
            pdf.setFont("helvetica", "normal");
            pdf.text(tipoPmt.toUpperCase(), margin + 5, yStart + 26);
            pdf.text(direccion.toUpperCase(), margin + 5, yStart + 34);

            // Bloque Central
            pdf.rect(margin + 60, yStart, 140, bottomHeight);
            pdf.setFontSize(7);
            const desc = "ACTIVIDADES PLANIFICADAS, COTIDIANAS Y DE EMERGENCIA EJECUTADAS POR LA EMPRESA DE ACUEDUCTO, ALCANTARILLADO Y ASEO DE BOGOTÁ D.C.";
            pdf.text(desc, margin + 65, yStart + 15, { maxWidth: 130 });

            // Bloque Derecho (CONVENCIONES CON ICONOS)
            pdf.rect(margin + 200, yStart, 92, bottomHeight);
            pdf.line(margin + 200, yStart + 10, margin + 260, yStart + 10);
            pdf.line(margin + 260, yStart, margin + 260, yStart + bottomHeight);

            pdf.setFontSize(7);
            pdf.setFont("helvetica", "bold");
            pdf.text("CONVENCIONES", margin + 205, yStart + 7);
            pdf.setFont("helvetica", "normal");

            // --- DIBUJAR ICONOS EN CONVENCIONES ---
            let yConv = yStart + 16;
            // Filtramos los iconos que realmente se usaron
            const usados = Object.keys(configuracionIconos).filter(k => iconosUsados.has(configuracionIconos[k].label));

            usados.forEach((key, index) => {
                if (index < 5) { // Límite para que no se solape la línea
                    const iconData = configuracionIconos[key];
                    const imgIcono = new Image();
                    imgIcono.src = iconData.url;
                    // Dibujamos el icono al lado del nombre
                    pdf.addImage(imgIcono, 'PNG', margin + 202, yConv + (index * 6) - 4, 5, 5);
                    pdf.text(iconData.label, margin + 210, yConv + (index * 6));
                }
            });

            // Horario y Escala
            pdf.setFont("helvetica", "bold");
            pdf.text("HORARIO:", margin + 265, yStart + 7);
            pdf.setFont("helvetica", "normal");
            pdf.text(horario, margin + 265, yStart + 14);
            pdf.text("ESCALA: S/N", margin + 265, yStart + 24);
            pdf.text("PLANO 1 DE 1", margin + 265, yStart + 34);

            // Marco decorativo final
            pdf.setLineWidth(0.5);
            pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

            pdf.save(`PMT_${direccion.replace(/ /g, "_")}.pdf`);
        };

        // Si el logo no carga, ejecutamos la función de todos modos
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
