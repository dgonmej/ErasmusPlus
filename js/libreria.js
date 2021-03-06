/**
 * @file Archivo con la lógica básica de la aplicación.
 * @author Diego González 
 */

/** @var {cualquier} datos Variable global llamada "datos" */
var datos;

/** @var {cualquier} mapa Variable global llamada "mapa" */
var mapa;

/** @var {matriz} marcadores Variable global llamada "marcadores" */
var marcadores = [];

/** @var {matriz} listaCiclos Variable global llamada "listaCiclos" */
var listaCiclos = [];

/** @var {matriz} listaPaises Variable global llamada "listaPaises" */
var listaPaises = [];

/** @var {matriz} latitudCiclo Variable global llamada "latitudCiclo" */
var latitudCiclo = [];

/** @var {matriz} longitudCiclo Variable global llamada "longitudCiclo" */
var longitudCiclo = [];

/** @var {matriz} listaCiclosPaises Variable global llamada "listaCiclosPaises" */
var listaCiclosPaises = [];

/**
 * Método que carga el mapa inicial con el centro en Múnich
 */
function cargarMapa() {
    contenedorMapa = document.getElementById("google-mapa");
    centro = new google.maps.LatLng(47.806145, 10.042419);
    opcionesMapa = { center: centro, zoom: 4 };
    mapa = new google.maps.Map(contenedorMapa, opcionesMapa);

    if (screen.width < 768) {
        mapa.setZoom(3);
    } else if (screen.width < 992) {
        mapa.setZoom(4);
    } else if (screen.width < 1200) {
        mapa.setZoom(5);
    } else {
        mapa.setZoom(5);
    }
}

/**
 * Método que genera los marcadores del mapa
 * @param {cualquier} opcion Recibe la opción para detenerminar que filtro usa
 */
function generarMarcadores(opcion) {
    borrarMarcadores();
    if (opcion == "ciclos") {
        filtrarDatos("coordenadasCiclos");
    }
    if (opcion == "paises") {
        filtrarDatos("coordenadasPaises");
    }
    if (opcion == "todos") {
        filtrarDatos("todos");
    }

    for (i = 0; i < latitudCiclo.length; i++) {
        var posicionCiclo = new google.maps.LatLng(
            parseFloat(latitudCiclo[i]),
            parseFloat(longitudCiclo[i])
        );
        var marcador = new google.maps.Marker({
            position: posicionCiclo,
            title: "Marcador",
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            animation: google.maps.Animation.BOUNCE
        });
        marcadores.push(marcador);

        var ciclos = [];
        for (var iterador in datos) {
            if (datos[iterador].latitud == latitudCiclo[i] && datos[iterador].longitud == longitudCiclo[i]) {
                if (!ciclos.includes(datos[iterador].ciclo)){
                    ciclos.push(datos[iterador].ciclo);
                }
            }
        }
        ciclos = ciclos.join("<br/>");
        contenido = "<h5 style='text-align: left;'>Ciclos formativos en la ciudad:</h5><p style='text-align: left;'>" + ciclos + "</p>";
        informacion = new google.maps.InfoWindow();

        google.maps.event.addListener(
            marcador,
            "click",
            (function(marcador, contenido, informacion) {
                return function() {
                informacion.setContent(contenido);
                informacion.open(mapa, marcador);
                };
            })(marcador, contenido, informacion)
        );
    }
    ponerMarcador(mapa);
}

/**
 * Método que añade un marcador en el mapa
 * @param {cualquier} mapa Recibe el mapa en el que poner el marcador 
 */
function ponerMarcador(mapa) {
    for (var i = 0; i < marcadores.length; i++) {
        marcadores[i].setMap(mapa);
      }
}

/**
 * Método que borra todos los marcadores del mapa
 */
function borrarMarcadores() {
    ponerMarcador(null);
    marcadores = [];
    latitudCiclo = [];
    longitudCiclo = [];
}

/**
 * Método que carga los datos del JSON y realiza el primer filtro
 */
function cargarDatos() {
    conexion();

    if (document.getElementById("movilidad").value == "Todos"){
        document.getElementById("contenedor-opcion").style.visibility = "hidden";
        document.getElementById("contenedor-buscar").style.visibility = "hidden";
        document.getElementById("contenedor-filtro").style.visibility = "hidden";
        generarMarcadores("todos");
    }
    else {
        document.getElementById("contenedor-opcion").style.visibility = "initial";
        document.getElementById("contenedor-buscar").style.visibility = "initial";
        document.getElementById("contenedor-filtro").style.visibility = "initial";
        document.getElementById("toggle").addEventListener("click", seleccionarOpcion, false);
    
        borrarElemento("labelCiclos");
        borrarLista(listaCiclos);
    
        borrarElemento("labelPaises");
        borrarLista(listaPaises);
    
        filtrarDatos("principal");
    
        seleccionarOpcion();
    }
}

/**
 * Método para conectar la aplicación con JSON que contiene los datos
 */
function conexion() {           
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        var datosJSon = xhttp.responseText;
        datos = JSON.parse(datosJSon);
    };
    
    xhttp.open("GET", "js/datos.json", false);
    xhttp.send();
}

/**
 * Método que recoge los filtros a realizar al archivo JSON
 * @param {cualquier} opcion Recibe la opción para detenerminar que filtro usa
 */
function filtrarDatos(opcion) {
    movilidad = document.getElementById("movilidad");
    switch (true) {
        case opcion == "principal":
            for (var iterador in datos) {
                if (datos[iterador].tipo == movilidad.value) {
                    if (!listaCiclos.includes(datos[iterador].ciclo)) {
                        listaCiclos.push(datos[iterador].ciclo);
                    }
                    if (!listaPaises.includes(datos[iterador].pais)) {
                        listaPaises.push(datos[iterador].pais);
                    }
                }
            }
            break;
        case opcion == "ciclosEnPaises":
            paisSeleccionado = document.getElementById('selectPaises').value;
            for (var iterador in datos) {
                if (datos[iterador].pais == paisSeleccionado && datos[iterador].tipo == movilidad.value && !listaCiclosPaises.includes(datos[iterador].ciclo)) {
                    listaCiclosPaises.push(datos[iterador].ciclo);
                }
            }
            break;
        case opcion == "todos":
            for (var iterador in datos) {
                if (!latitudCiclo.includes(datos[iterador].latitud)) {
                    latitudCiclo.push(datos[iterador].latitud);
                }
                if (!longitudCiclo.includes(datos[iterador].longitud)) {
                    longitudCiclo.push(datos[iterador].longitud);
                }
            }
            break;
        case opcion == "coordenadasCiclos":
            ciclosSelecionados = document.querySelectorAll("input[type='checkbox']:checked");
            for (i = 0; i < ciclosSelecionados.length; i++) {
                ciclo = ciclosSelecionados[i].value;
                for (var iterador in datos) {
                    if (datos[iterador].ciclo == ciclo) {
                        if (!latitudCiclo.includes(datos[iterador].latitud)) {
                            latitudCiclo.push(datos[iterador].latitud);
                        }
                        if (!longitudCiclo.includes(datos[iterador].longitud)) {
                            longitudCiclo.push(datos[iterador].longitud);
                        }
                    }
                }
            }
            break;
        case opcion == "coordenadasPaises":
            for (var iterador in datos) {
                if (datos[iterador].pais == document.getElementById("selectPaises").value && datos[iterador].ciclo == document.getElementById("selectCiclos").value) {
                    if (!latitudCiclo.includes(datos[iterador].latitud)) {
                        latitudCiclo.push(datos[iterador].latitud);
                    }
                    if (!longitudCiclo.includes(datos[iterador].longitud)) {
                        longitudCiclo.push(datos[iterador].longitud);
                    }
                }
            }
            break;
        default:
            break;
    }
}

/**
 * Método para generar o bien el grupo de checkbox de ciclos o el combo de países
 * @param {cualquier} opcion Recibe la opción para saber si crea los ciclos o países 
 * @param {cualquier} titulo Recibe el título que le añadirá
 */
function generarElementos(opcion, titulo) {
    iterador = 0;
    contenedor = document.getElementById("contenedor-filtro");
    tituloFiltro = document.getElementById("titulo-filtro");
    tituloFiltro.textContent = titulo;
    tituloFiltro.style.display = "inline-block";

    if (opcion == "ciclos") {
        for (i = 0; i < listaCiclos.length; i++) {
            iterador++;
            label = contenedor.appendChild(crearElementoCombo("label", "for", "elemento-" + iterador));
            label.className = "labelCiclos";
            label.appendChild(crearElementoBoton("checkbox", "id", "elemento-" + iterador, "class", "ciclo", "value", listaCiclos[i]));
            label.appendChild(crearElementoTexto("span", "texto", listaCiclos[i]));
        }
    }

    if (opcion == "paises") {
        label = contenedor.appendChild(crearElementoCombo("label", "for", "selectPaises"));
        label.className = "labelPaises";
        select = label.appendChild(crearElementoCombo("select", "id", "selectPaises"));
        select.addEventListener("change", generarCombo, false);

        for (i = -1; i < listaPaises.length; i++) {
            option = select.appendChild(crearElementoOption("option", "value", listaPaises[i], listaPaises[i]));
            if (i == -1) {
                option.value = '';
                option.setAttribute("disabled", "disabled");
                option.setAttribute("selected", "selected");
                option.textContent = 'Elegir un país...';
            }
        }
    }
}

/**
 * Método para generar el combo secundario en la elección de países
 */
function generarCombo() {
    borrarElemento("labelCiclos");
    contenedor = document.getElementById('contenedor-filtro');

    filtrarDatos("ciclosEnPaises");

    label = contenedor.appendChild(crearElementoCombo("label", "for", "selectCiclos"));
    label.className = "labelCiclos";

    select = label.appendChild(crearElementoCombo("select", "id", "selectCiclos"));

    for (i = -1; i < listaCiclosPaises.length; i++) {
        option = select.appendChild(crearElementoOption("option", "value", listaCiclosPaises[i], listaCiclosPaises[i]));
        if (i == -1) {
            option.value = '';
            option.setAttribute("disabled", "disabled");
            option.setAttribute("selected", "selected");
            option.textContent = 'Elegir un ciclo en el país...';
        }
    }
    borrarLista(listaCiclosPaises);
}

/**
 * Método para borrar los elementos con la clase que le pasemos
 * @param {cualquier} elemento Recibe la clase de elementos a borrar
 */
function borrarElemento(elemento) {
    elementos = document.getElementsByClassName(elemento)
    while (elementos.length > 0) {
        elementos[0].parentNode.removeChild(elementos[0]);
    }
}

/**
 * Método para borrar los elementos de una matriz que le pasemos
 * @param {cualquier} lista Recibe la matriz a borrar
 */
function borrarLista(lista) {
    while (lista.length > 0) {
        lista.pop();
    }
}

/**
 * Métoodo que determinar si filtramos por países o por ciclos formativos
 */
function seleccionarOpcion() {
    estado = document.getElementById("toggle").checked;
    botonBuscar = document.getElementById('b_Buscar');

    if (estado) {
        borrarElemento("labelCiclos");
        generarElementos("paises", "Países (" + document.getElementById("movilidad").value + ")");
        botonBuscar.addEventListener('click', function() {
            generarMarcadores("paises")
        }, false);
    }
    if (!estado) {
        borrarElemento("labelPaises");
        generarElementos("ciclos", "Ciclos Formativos (" + document.getElementById("movilidad").value + ")");
        botonBuscar.addEventListener('click', function() {
            generarMarcadores("ciclos")
        }, false);
    }
}

/**
 * Método para crear los elementos de tipo "input" con los atributos que le pasemos
 * @param {cualquier} tipo Recibe el tipo de botón a crear
 * @param {cualquier} atributo1 Recibe un atributo a añadir
 * @param {cualquier} valor1 Recibe el valor del atributo
 * @param {cualquier} atributo2 Recibe un atributo a añadir
 * @param {cualquier} valor2 Recibe el valor del atributo
 * @param {cualquier} atributo3 Recibe un atributo a añadir
 * @param {cualquier} valor3 Recibe el valor del atributo
 */
function crearElementoBoton(tipo, atributo1, valor1, atributo2, valor2, atributo3, valor3) {
    elementoBoton = document.createElement("input");
    elementoBoton.setAttribute("type", tipo);
    elementoBoton.setAttribute(atributo1, valor1);
    elementoBoton.setAttribute(atributo2, valor2);
    elementoBoton.setAttribute(atributo3, valor3);
    return elementoBoton;
}

/**
 * Método para crear los elementos de tipo texto como por ejemplo un "span" o un "h1"
 * @param {cualquier} nombre Recibe el tipo de elemento que va a crear
 * @param {cualquier} clase Recibe la clase del elemento a añadir
 * @param {cualquier} texto Recibe el texto que tendrá 
 */
function crearElementoTexto(nombre, clase, texto) {
    elementoTexto = document.createElement(nombre);
    elementoTexto.setAttribute("class", clase);
    elementoTexto.textContent = texto;
    return elementoTexto;
}

/**
 * Método para crear los elementos de tipo "select" o "label" con un atributo que queramos
 * @param {cualquier} nombre Recibe el tipo de elemento que va a crear
 * @param {cualquier} atributo1 Recibe un atributo a añadir
 * @param {cualquier} valor1 Recibe el valor del atributo
 */
function crearElementoCombo(nombre, atributo1, valor1) {
    elementoSelect = document.createElement(nombre);
    elementoSelect.setAttribute(atributo1, valor1);
    return elementoSelect;
}

/**
 * Método para crear los elementos de tipo "option" con un atributo que queramos
 * @param {cualquier} nombre Recibe el tipo de elemento que va a crear
 * @param {cualquier} atributo1 Recibe un atributo a añadir
 * @param {cualquier} valor1 Recibe el valor del atributo
 * @param {cualquier} texto Recibe el texto que tendrá
 */
function crearElementoOption(nombre, atributo1, valor1, texto) {
    elementoOption = document.createElement(nombre);
    elementoOption.setAttribute(atributo1, valor1);
    elementoOption.textContent = texto;
    return elementoOption;
}
