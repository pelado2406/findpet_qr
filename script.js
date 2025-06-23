function obtenerCodigoDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

async function verificarCodigoDisponible(codigo) {
    const url = `https://raw.githubusercontent.com/pelado2406/findpet_qr/main/fichas/${codigo}.html`;
    const resp = await fetch(url);
    return !resp.ok;
}

async function subirFichaAGithub(nombreArchivo, contenidoHTML, urlFinal) {
    const token = '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';
    const usuario = 'pelado2406';
    const repositorio = 'findpet_qr';
    const rama = 'main';
    const ruta = `fichas/${nombreArchivo}.html`;

    const getUrl = `https://api.github.com/repos/${usuario}/${repositorio}/contents/${ruta}`;

    let sha = null;
    const checkResp = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (checkResp.ok) {
        const data = await checkResp.json();
        sha = data.sha;
    }

    const res = await fetch(getUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Nueva ficha de mascota',
            content: btoa(unescape(encodeURIComponent(contenidoHTML))),
            branch: rama,
            sha: sha || undefined
        })
    });

    if (!res.ok) throw new Error('Error al subir ficha');

    window.location.href = urlFinal;
}

async function generarFichaYSubir() {
    const codigo = obtenerCodigoDesdeURL();
    if (!codigo) {
        alert("❌ Código no encontrado en la URL.");
        return;
    }

    const disponible = await verificarCodigoDisponible(codigo);
    if (!disponible) {
        alert("⚠️ El código ya está en uso. Elegí otro.");
        return;
    }

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const direccion = document.getElementById("direccion").value;

    const html = `
<html><head><meta charset="UTF-8"><title>${nombre}</title></head><body>
<h2>🐾 Mascota Perdida</h2>
<p><strong>Nombre:</strong> ${nombre}</p>
<p><strong>Teléfono:</strong> <a href="tel:${telefono}">${telefono}</a></p>
<p><strong>WhatsApp:</strong> <a href="https://wa.me/${whatsapp}">${whatsapp}</a></p>
<p><strong>Dirección:</strong> ${direccion}</p>
<p><a href="https://maps.google.com/?q=${encodeURIComponent(direccion)}">📍 Ver ubicación</a></p>
</body></html>
`;

    const urlFinal = `https://pelado2406.github.io/findpet_qr/fichas/${codigo}.html`;
    subirFichaAGithub(codigo, html, urlFinal);
}

function descargarQR() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = "codigo_qr.png";
    link.href = canvas.toDataURL();
    link.click();
}
