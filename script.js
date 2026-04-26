async function cargarNoticias() {
    const fuentesNac = [
        { nombre: 'GESTIÓN', query: 'site:gestion.pe "economía" OR "gobierno"' },
        { nombre: 'EL COMERCIO', query: 'site:elcomercio.pe "economía" OR "actualidad"' },
        { nombre: 'RPP', query: 'site:rpp.pe "política" OR "economía"' },
        { nombre: 'LA REPÚBLICA', query: 'site:larepublica.pe "economía" OR "gobierno"' },
        { nombre: 'SEMANA ECONÓMICA', query: 'site:semanaeconomica.com' }
    ];

    const fuentesInt = [
        { nombre: 'BLOOMBERG', query: 'site:bloomberglinea.com "mercados"' },
        { nombre: 'FORBES', query: 'site:forbes.pe OR site:forbes.es "negocios"' },
        { nombre: 'BBC', query: 'site:bbc.com/mundo "economía"' },
        { nombre: 'CNN', query: 'site:cnnespanol.cnn.com "economía"' },
        { nombre: 'REUTERS', query: 'site:reuters.com "latam" OR "mercados"' }
    ];

    const buscarNoticiaPorFuente = async (fuente) => {
        // Generamos un número único basado en la hora para romper el caché
        const antiCache = new Date().getTime();
        const urlRSS = `https://news.google.com/rss/search?q=${encodeURIComponent(fuente.query + " when:1d")}&hl=es-419&gl=PE&ceid=PE:es-419&v=${antiCache}`;
        const apiURL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(urlRSS)}&nocache=${antiCache}`;
        
        try {
            const res = await fetch(apiURL);
            const data = await res.json();
            if (data.status === 'ok' && data.items.length > 0) {
                const noticiaValida = data.items.find(item => 
                    item.title.length > 40 && 
                    !item.title.toLowerCase().includes("noticias")
                );
                
                if (noticiaValida) {
                    let titular = noticiaValida.title.split(' - ')[0].trim();
                    return `<span class="news-item-api"> <b style="color:#4ade80">[${fuente.nombre}]</b> ${titular} </span>`;
                }
            }
        } catch (e) { return null; }
        return null;
    };

    try {
        const promesasNac = fuentesNac.map(f => buscarNoticiaPorFuente(f));
        const promesasInt = fuentesInt.map(f => buscarNoticiaPorFuente(f));

        const resultadosNac = await Promise.all(promesasNac);
        const resultadosInt = await Promise.all(promesasInt);

        const finales = [...resultadosNac, ...resultadosInt].filter(n => n !== null);
        const contenedor = document.getElementById('noticias-dinamicas');
        
        if (finales.length > 0) {
            contenedor.innerHTML = finales.join("") + finales.join("");
        } else {
            contenedor.innerHTML = '<span class="news-item-api"> Buscando titulares de última hora... </span>';
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Ejecutar al cargar
cargarNoticias();

// Refrescar cada 10 minutos (Ahora sí traerá nuevas)
setInterval(cargarNoticias, 10 * 60 * 1000);

// Recarga forzada de la página cada 45 min para limpiar la memoria del navegador
setTimeout(() => { window.location.reload(true); }, 45 * 60 * 1000);