const limit = 16;
let offset = 0

window.addEventListener('load', () => {
  loadPokemon()
  handleSearchInput()
  handleLoadMoreBtnClick()
});



//gets users requested pokemon
function handleSearchInput() {
  const form = document.getElementById("search-bar");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    //get pokemon name
    const data = new FormData(event.target);
    const pokemon = data.get("pokemon").toLowerCase();

    // request pokemon
    fetchPokemon(pokemon,true)

    // hide load more btn
    let loadMoreBtn = document.getElementById("load-more-btn")
    loadMoreBtn.style.display = "none";

    // go to pokemon card
    let resultsSection = document.getElementById("pokemon-results-section")
    resultsSection.scrollIntoView({"behavior":"smooth"})
  });
}


// handle load more button click
let handleLoadMoreBtnClick = () =>{
  let loadMoreBtn = document.getElementById("load-more-btn");

  loadMoreBtn.addEventListener("click",()=> {
    loadPokemon()
  })

}


// creates a Pokémon card
function createPokemonCard(pokemonData) {
  return `
    <div class="pokemon-card-container">
      <div class="pkm-card-top-section">
        <img src="${pokemonData.sprites.other["official-artwork"].front_default}" class="pkm-img" style="border-radius:50%" alt="${pokemonData.name}">
        <img src="/images/list_pokemon-bg.png" id = "top-bg">
      </div>
      <div class="pkm-card-bottom-section">
        <div class="pkm-identification">
          <span class="pkm-number">${pokemonData.id.toString().padStart(4, '0')}</span> 
          <h1 class="pkm-name">${pokemonData.name}</h1>
        </div>
        <div class="pkm-types">
          ${pokemonData.types.map(type => `<button class="type-btn">${type.type.name}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
}


// fetches requested pokeomon
async function fetchPokemon(pokemon,singlePokemon) {
  try {
    let resultsSection = document.getElementById("pokemon-results-section");

    // requests pokemon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

    if (!response.ok) {
      throw new Error("pokemon does not exist");
    }

    const data = await response.json();

    // creates pokemon card
    if(singlePokemon == true){
      resultsSection.innerHTML = createPokemonCard(data);
    }else{
      resultsSection.innerHTML += createPokemonCard(data);
    }

    //add pokemon type button styles
    setTypeBtnColor(data);

    // listens for click event on card
    // handlePokemonCardClick()


  } catch (error) {
    console.error(error);
  }
}


function setTypeBtnColor(){
  let typeBtns = document.querySelectorAll(".type-btn");

  // Get the CSS variable value using getComputedStyle
  const rootStyles = getComputedStyle(document.documentElement);
  typeBtns.forEach(btn => {
    let color = `--${btn.textContent}-btn-color`
    const myColor = rootStyles.getPropertyValue(color);
    btn.style.backgroundColor = myColor;
    btn.style.borderColor = myColor;
  })
 
}

// loads pokemon 
async function loadPokemon(){
  try{
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)

    if(!response.ok){
      throw new Error("could not load pokemon")
    }

    const data = await response.json();

    data.results.forEach(pokemon => {
      // create pokemon card
      fetchPokemon(pokemon.name,false)
    })

    offset += limit +1
  }catch(error){
    console.log(error)
  }
}

