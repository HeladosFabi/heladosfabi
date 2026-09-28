document.addEventListener("DOMContentLoaded", () => {
    iniciarAnimaciones();
    iniciarScrollSuave();
    iniciarBotonScroll();
    iniciarMenuMovil();
    iniciarFiltro();
    checkHorario();
    iniciarRecomendaciones();
});

/* ANIMACIONES */
function iniciarAnimaciones() {
    const elementos = document.querySelectorAll(".fade-in");

    if (elementos.length === 0) return;

    // Si el navegador no soporta IntersectionObserver,
    // mostramos todo el contenido inmediatamente.
    if (!("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => {
            elemento.classList.add("visible");
        });
        return;
    }

    document.documentElement.classList.add("js-anim");

    const observer = new IntersectionObserver(
        (entradas, observerActual) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observerActual.unobserve(entrada.target);
                }
            });
        },
        {
            rootMargin: "100px",
            threshold: 0.01
        }
    );

    elementos.forEach((elemento) => {
        observer.observe(elemento);
    });

    // Respaldo por si Firefox o algún celular no ejecuta correctamente
    // el IntersectionObserver.
    setTimeout(() => {
        elementos.forEach((elemento) => {
            elemento.classList.add("visible");
        });
    }, 2000);
}

/* SCROLL SUAVE */
function iniciarScrollSuave() {
    const enlaces = document.querySelectorAll('a[href^="#"]');

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", (evento) => {
            evento.preventDefault();

            const id = enlace.getAttribute("href");
            const destino = document.querySelector(id);

            if (destino) {
                destino.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            // Cerrar el menú móvil después de seleccionar una opción
            const menu = document.querySelector(".menu");
            const icono = document.getElementById("iconNav");

            if (menu && window.innerWidth < 1033) {
                menu.classList.remove("menu-visible");

                if (icono) {
                    icono.className = "fa-solid fa-bars";
                }
            }
        });
    });
}

/* BOTÓN IR ARRIBA */
function iniciarBotonScroll() {
    const boton = document.getElementById("scrollToTopBtn");

    if (!boton) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            boton.classList.add("mostrar");
        } else {
            boton.classList.remove("mostrar");
        }
    });

    boton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* MENÚ MÓVIL */
function iniciarMenuMovil() {
    const icono = document.getElementById("iconNav");
    const menu = document.querySelector(".menu");

    if (!icono || !menu) return;

    icono.parentElement.addEventListener("click", () => {
        const menuAbierto = menu.classList.toggle("menu-visible");

        if (menuAbierto) {
            icono.className = "fa-solid fa-xmark";
        } else {
            icono.className = "fa-solid fa-bars";
        }
    });
}

/* FILTRO DE HELADOS */
function iniciarFiltro() {
    const input = document.getElementById("input_filter");
    const lista = document.getElementById("iceCream");

    if (!input || !lista) return;

    input.addEventListener("input", () => {
        const filtro = input.value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

        const productos = lista.querySelectorAll("li");

        productos.forEach((producto) => {
            const enlace = producto.querySelector("a");

            if (!enlace) return;

            const texto = enlace.textContent
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            const datos = enlace.getAttribute("href") || "";

            const coincide =
                texto.includes(filtro) ||
                datos.toLowerCase().includes(filtro);

            producto.style.display = coincide ? "" : "none";
        });
    });

    input.addEventListener("click", () => {
        input.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}

/* HORARIO DE ATENCIÓN */
function checkHorario() {
    const estado = document.getElementById("OpenClose");
    const recomendaciones = document.getElementById("parahoy");

    if (!estado) return;

    const horaActual = new Date().getHours();
    const estaAbierto = horaActual >= 10 && horaActual < 22;

    if (estaAbierto) {
        estado.innerHTML =
            "Ahora mismo: Abierto <i class='fa-regular fa-face-smile'></i>";
        estado.style.color = "green";

        if (recomendaciones) {
            recomendaciones.style.display = "block";
        }
    } else {
        estado.innerHTML =
            "Ahora mismo: Cerrado <i class='fa-regular fa-face-sad-tear'></i>";
        estado.style.color = "red";

        if (recomendaciones) {
            recomendaciones.style.display = "none";
        }
    }
}

/* RECOMENDACIONES */
function iniciarRecomendaciones() {
    const boton = document.getElementById("btn_weather");

    if (!boton) return;

    boton.addEventListener("click", mostrarRecomendaciones);
}

async function mostrarRecomendaciones() {
    const contenido = document.getElementById("toggle-content");
    const recomendacion = document.getElementById("recomendation");

    if (!contenido || !recomendacion) return;

    const estaVisible = contenido.classList.contains("contenido-visible");

    if (estaVisible) {
        contenido.classList.remove("contenido-visible");
        return;
    }

    contenido.classList.add("contenido-visible");
    recomendacion.innerHTML =
        "CARGANDO... <i class='fa-solid fa-spinner fa-spin'></i>";
    recomendacion.style.color = "#978BF8";

    const weatherData = await getTodayWeather();

    let indiceRecomendacion = 15;

    if (weatherData) {
        const feelslike = Number(weatherData.feelslike) || 0;
        const precipitacion = Number(weatherData.precipitation) || 0;
        const radiacionSolar = Number(weatherData.solar_radiation) || 0;

        indiceRecomendacion =
            0.6 * feelslike +
            0.003 * radiacionSolar -
            5 * precipitacion;
    }

    const catalogo = {
        muyFrio: [
            "Sundae con chocolate",
            "Vaso con pasitas borrachas",
            "Vaso con fosh",
            "Cono chocolate",
            "Vaso con doña pepa"
        ],
        fresco: [
            "Sundae con manjar",
            "Vaso con choco donuts",
            "Vaso con oreo",
            "Cono sublime",
            "Cono maní",
            "Vaso maní"
        ],
        templado: [
            "Cono vainilla",
            "Cono combinado",
            "Sundae con lúcuma",
            "Vaso con grageas",
            "Vaso con lentejas",
            "Vaso ositos"
        ],
        calor: [
            "Sundae con fresa",
            "Vaso con fresa",
            "Sundae con saúco",
            "Sundae con aguaymanto",
            "Vaso chocoyogurt",
            "Sundae con menta"
        ],
        extremo: [
            "Sundae con maracuyá",
            "Vaso con maracuyá",
            "Sundae con tamarindo",
            "Vaso Fabito",
            "Vaso Yayito"
        ]
    };

    let lista;

    if (indiceRecomendacion < 8) {
        lista = catalogo.muyFrio;
    } else if (indiceRecomendacion < 12) {
        lista = catalogo.fresco;
    } else if (indiceRecomendacion < 17) {
        lista = catalogo.templado;
    } else if (indiceRecomendacion < 21) {
        lista = catalogo.calor;
    } else {
        lista = catalogo.extremo;
    }

    const productosMezclados = [...lista].sort(() => Math.random() - 0.5);
    const sugerencias = productosMezclados.slice(0, 3);

    recomendacion.innerHTML = sugerencias
        .map((producto) => `🌟 ${producto}`)
        .join("<br>");

    recomendacion.style.color = "black";
}

/* CLIMA */
async function getTodayWeather() {
    const API_KEY = "BYSHMJKC9L8CVY5JZPKH6WMWW";
    const LOCATION = "Ventanilla, Callao";
    const BASE_URL =
        "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

    const cacheKey = "weather_data_cache";
    const cacheTimeKey = "weather_timestamp";
    const tiempoCache = 60 * 60 * 1000;

    const ahora = Date.now();
    const datosGuardados = localStorage.getItem(cacheKey);
    const fechaGuardada = localStorage.getItem(cacheTimeKey);

    if (
        datosGuardados &&
        fechaGuardada &&
        ahora - Number(fechaGuardada) < tiempoCache
    ) {
        try {
            return JSON.parse(datosGuardados);
        } catch (error) {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(cacheTimeKey);
        }
    }

    const fechaActual = new Date().toISOString().split("T")[0];

    const url =
        `${BASE_URL}/${encodeURIComponent(LOCATION)}/${fechaActual}` +
        `?unitGroup=metric` +
        `&key=${API_KEY}` +
        `&include=days` +
        `&elements=datetime,feelslike,precip,solarradiation` +
        `&contentType=json`;

    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!datos.days || datos.days.length === 0) {
            throw new Error("La API no devolvió datos del clima");
        }

        const clima = datos.days[0];

        const resultado = {
            date: clima.datetime,
            location: datos.resolvedAddress,
            feelslike: clima.feelslike,
            precipitation: clima.precip,
            solar_radiation: clima.solarradiation
        };

        localStorage.setItem(cacheKey, JSON.stringify(resultado));
        localStorage.setItem(cacheTimeKey, ahora.toString());

        return resultado;
    } catch (error) {
        console.error("No se pudo obtener el clima:", error);
        return null;
    }
}