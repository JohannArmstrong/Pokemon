const pokeapi = "https://pokeapi.co/api/v2/pokemon/"

const searchInput = document.getElementById("busqueda")

const buscadoContainer = document.getElementById("buscado")

const searchBtn = document.getElementById("searchBtn")



//la función es async porque espera la respuesta de la api
async function buscarPokemon() {

    //cambio el ingreso a minúsculas para que coincida con el formato del json
    const pokemonBuscado = searchInput.value.toLowerCase()

    try {
        //await es usado dentro de funciones async
        const respuesta = await fetch(pokeapi + pokemonBuscado)

        //buscador container comienza con display:none, ahora se hace visible
        buscadoContainer.style.display = "block";

        //muestra mensaje si no coincide el ingreso con un pokemon(o no responde la api)
        if (!respuesta.ok) {
            buscadoContainer.innerHTML = `<p>${pokemonBuscado} no encontrado</p>`;         
            return;
        }

        //se almacena todo el json del pokemon buscado en ¨data¨
        const data = await respuesta.json()

        //crea elementos en el html, en la div ¨buscado¨ donde se mostrará la info del pokemon buscado
        //se muestra el nombre con la primera letra en mayúscula
        //los datos numéricos se convierten de unidad
        //muestra el nombre de cada abilidad dentro del array, separándola con coma
        buscadoContainer.innerHTML =
        `
            <img src="${data.sprites.front_default}">
            <h2>${data.name.charAt(0).toUpperCase()+data.name.slice(1)}</h2>
            <p>Abilidades: ${data.abilities.map(a => a.ability.name).join(", ")}</p>
            <p>Altura: ${data.height / 10}m</p>
            <p>Peso: ${data.weight / 10}kg</p>
            <button onclick="toggleFavorite('${data.name}')">
                ${isFavorite(data.name) ? "Eliminar de Favoritos" : "Agregar a Favoritos"}
            </button>
        `;

        mostrarFavoritos();
        cargarPrimerosDiez();

    } catch (e) {
        console.error(e);
    }
}

//edición de la función buscarPokemon
async function clickPokemon(nombre) {

    //cambio el ingreso a minúsculas para que coincida con el formato del json
    const pokemonBuscado = nombre

    try {
        //await es usado dentro de funciones async
        const respuesta = await fetch(pokeapi + pokemonBuscado)

        //buscador container comienza con display:none, ahora se hace visible
        buscadoContainer.style.display = "block";

        //muestra mensaje si no coincide el ingreso con un pokemon(o no responde la api)
        if (!respuesta.ok) {
            buscadoContainer.innerHTML = `<p>${pokemonBuscado} no encontrado</p>`;         
            return;
        }

        //se almacena todo el json del pokemon buscado en ¨data¨
        const data = await respuesta.json()

        //crea elementos en el html, en la div ¨buscado¨ donde se mostrará la info del pokemon buscado
        //se muestra el nombre con la primera letra en mayúscula (y las demás en minúsculas)
        //los datos numéricos se convierten de unidad
        //muestra el nombre de cada abilidad dentro del array, separándola con coma
        buscadoContainer.innerHTML =
        `
            <img src="${data.sprites.front_default}">
            <h2>${data.name.charAt(0).toUpperCase()+data.name.slice(1)}</h2>
            <p>Abilidades: ${data.abilities.map(a => a.ability.name).join(", ")}</p>
            <p>Altura: ${data.height / 10}m</p>
            <p>Peso: ${data.weight / 10}kg</p>
            <button onclick="toggleFavorite('${data.name}')">
                ${isFavorite(data.name) ? "Eliminar de Favoritos" : "Agregar a Favoritos"}
            </button>
        `;

        mostrarFavoritos();
        cargarPrimerosDiez();

    } catch (e) {
        console.error(e);
    }
}


//--------------------------------------------
//acá me ayudó bastante el robotito
const containerTen = document.querySelector(".containerTen")
const favoritesContainer = document.querySelector(".favoritesContainer")
let favorites = JSON.parse(localStorage.getItem("favorites")) || []//trabaja con un array llamado favorites que se guarda en el localStorage

//función para cargar los primeros 10 pokemons
async function cargarPrimerosDiez() {
    try {
        const respuestas = await Promise.all(
            Array.from({ length: 10 }, (_, index) => fetch(pokeapi + (index + 1)))
        );

        const datos = await Promise.all(respuestas.map(res => res.json()));
        
        //el primer onclick llama a una modificación de la búsqueda normal
        //el otro onclick llama a la función que le dice si es favorito o no para seleccionar el texto a mostrar
        containerTen.innerHTML = datos.map(data => `
            <div class="pokemonDeMuestra" onclick="clickPokemon('${data.name}')">
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
                <button onclick="toggleFavorite('${data.name}')">
                    ${isFavorite(data.name) ? "Eliminar de Favoritos" : "Agregar a Favoritos"}
                </button>
            </div>
        `).join('');

        mostrarFavoritos(); 

    } catch (e) {
        console.error(e);
    }
}

//comprueba si un pokemon es favorito
function isFavorite(name) {
    return favorites.includes(name);
}

//marcar y desmarcar favoritos
function toggleFavorite(name) {
    //se fija si ya está en favoritos
    if (isFavorite(name)) {
        favorites = favorites.filter(fav => fav !== name);
    } else {
        favorites.push(name);
    }

    //el JSON.stringify convierte un tipo de jscript a json
    localStorage.setItem("favorites", JSON.stringify(favorites));

    cargarPrimerosDiez()//recargar la lista para actualizar el estado de los favoritos

    mostrarFavoritos()//muestra favoritos actualizados

    buscarPokemon()//solución para cuando el favorito viene de la búsqueda
    //todavía falta que se actualize el texto del botón cuando viene de "clickPokemon"
}

//usa la lógica de la función cargarPrimerosDiez
async function mostrarFavoritos() {
    favoritesContainer.innerHTML = ''; //limpia la sección de favoritos
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>Aún no hay favoritos.</p>';
        return;
    }

    try {
        const respuestas = await Promise.all(
            favorites.map(name => fetch(pokeapi + name))
        );

        const datos = await Promise.all(respuestas.map(res => res.json()));

        favoritesContainer.innerHTML = datos.map(data => `
            <div class="pokemonDeMuestra">
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
                <button onclick="toggleFavorite('${data.name}')">Eliminar de Favoritos</button>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

//cargar los primeros 10 pokemons al cargar la página
cargarPrimerosDiez();

searchBtn.addEventListener("click", buscarPokemon)
