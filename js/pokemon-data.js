import  {setTypeBtnColor} from "./app.js"
let pokemonName = ""
let pokemonId;
 const resultsSection = document.getElementById('pokemon-results-section');



document.addEventListener('DOMContentLoaded', async () => {
  handleCardClickEvents();
});


// Handle card click events when a Pokemon card is clicked
async function handleCardClickEvents() {
  resultsSection.addEventListener('click', async (event) => {
    const card = event.target.closest('.pokemon-card-container');
    if (card) {
      const name = card.querySelector('.pkm-name').textContent;
      pokemonName = name;

      const data = await fetchPokemonData(name);
      await setUpCard(data)
    } 
  });
}

//renders template with data and sets up event listeners and button colors and
async function setUpCard(data){
  await renderTemplate(data);
  setTypeBtnColor();
  handleVersionClick();
  handleNextAndPreviousButtonClicks();  
}


// Handles the "next" button click event
async function handleNextAndPreviousButtonClicks() {
  const rightButton = document.getElementById('right-arrow');
  const leftButton = document.getElementById('left-arrow');

  rightButton.removeEventListener('click', handleNextAndPreviousButtonClicks); // Remove the event listener temporarily

  if(pokemonId == 1){
    let leftSide = document.getElementById("left-slider-bkg")
    leftSide.innerHTML = "<div></div>"
    leftSide.style.backgroundImage = "none"
  }else{
    leftButton.removeEventListener('click', handleNextAndPreviousButtonClicks);
  }

  
  rightButton.addEventListener('click', async () => {
    fetchNextOrPreviousPokemonData(1);
  });

  leftButton.addEventListener("click", async() => {
    fetchNextOrPreviousPokemonData(-1);
  })
}

//gets data for the next Pokemon and updates the current display
async function fetchNextOrPreviousPokemonData(int) {
  let newPokemonId = pokemonId + int;
  let newPokemonData = await fetchPokemonData(newPokemonId);
  await setUpCard(newPokemonData) // Reattach the "next" button event to prevent multiple clicks
}

// Fetches detailed data for a given Pokemon and format it
async function fetchPokemonData(name) {
  const pokemonData = new Map();

  // Fetch basic data for the Pokemon
  let data = await fetchResponseData(name);

  // get and set id
  pokemonId = data.id;
  pokemonName = data.name


  // Extract additional information
  let category = await getCategory(data)
  let weaknesses = await getWeaknesses(data);
  let types =  await getTypes(data);
  let ability = getAbility(data);
  let version = await getVersion(data);
  let image = data.sprites.other["official-artwork"].front_default;

  // Store Pokemon data in a map
  pokemonData.set("name", pokemonName);
  pokemonData.set("id", data.id.toString().padStart(4, '0'));
  pokemonData.set('category', category);
  pokemonData.set("height",data.height/100);
  pokemonData.set("weight",data.weight/1000);
  pokemonData.set("types",types);
  pokemonData.set("ability",ability)
  pokemonData.set("weaknesses",weaknesses);
  pokemonData.set("version",version);
  pokemonData.set("imageSrc",image)

  return convertMapToObject(pokemonData);
}

// Fetch data from a given URL and return it as JSON
async function fetchUrl(url) {
  const response = await fetch(url);
  const urlData = await response.json();
  return urlData;
}

// Gets an array of types for the given Pokemon 
let getTypes = async (data) => {
  let types = [];

  data.types.forEach(element => {
    types.push(element.type.name);
  });

  return types;
}



// Gets an array of weaknesses for the given Pokemon 
async function getWeaknesses(data){
  let weaknesses = [];

  let types = await getTypes(data)

  // Use Promise.all to fetch data for all types concurrently
  await Promise.all(types.map(async (type) => {
    const response = await fetchUrl(`https://pokeapi.co/api/v2/type/${type}`);
    const doubleDamageList = response.damage_relations.double_damage_from;

    doubleDamageList.forEach((object) => {
      weaknesses.push(object.name);
    });
  }));

  let noDuplicateList = [...new Set(weaknesses)];
  if(noDuplicateList.length>5){
    return noDuplicateList.slice(0,5);
  }
  return noDuplicateList;
}

// gets the ability for the given pokemon
let getAbility= (data)=>{
  let abilitiesData= data.abilities.find((object) => object.is_hidden == false)
  return abilitiesData.ability.name
}

// gets the category for the given pokemon
async function getCategory(data){
  let url = data.species.url;
  const speciesData = await fetchUrl(url);
  let category = speciesData.genera.find((genus) => genus.language.name === "en").genus;

  return category.split(" ")[0];
}



// Get version-specific text for a given Pokemon data
async function getVersion(data,color="blue"){
    let url = data.species.url;
    const speciesData = await fetchUrl(url);
    let flavorTexts = speciesData.flavor_text_entries;

    let obj;

    switch(color){
      case "blue":
        obj = flavorTexts.find((obj)=> obj.language.name == "en" && obj.version.name == "blue");
        break;
      case "emerald":
        obj = flavorTexts.find((obj)=> obj.language.name == "en" && obj.version.name == "emerald");
        break;
      case "yellow":
        obj = flavorTexts.find((obj)=> obj.language.name == "en" && obj.version.name == "yellow");
        break;
    }

    if (obj) {
      let text = obj.flavor_text;
      return text;
    } else {
      // Handles the case when obj is not found
      return "Flavor text not available for this version.";
    }
}

// Handle the click event on version elements
async function handleVersionClick() {
  const versionsContainer = document.getElementById("versions-container");
  const versionElements = versionsContainer.querySelectorAll(".version");

  versionElements.forEach(versionElement => {
      versionElement.addEventListener("click", async () => {
          const versionColor = versionElement.id.split("-")[0];
          const data = await fetchResponseData(pokemonName)
          const text = await getVersion(data, versionColor);
          const versionSection = document.querySelector("#about-pokemon p");
          versionSection.textContent = text;
      });
  });
}

// fetches pokemon data
async function fetchResponseData(name){
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

  if (!response.ok) {
      throw new Error("Pokemon does not exist");
  }

  const data = await response.json();
  return data
}


async function renderTemplate(data) {
  const mainContainer = document.body;

  const templateResponse = await fetch('templates/pokemon-template.hbs');

  if (!templateResponse.ok) {
      throw new Error('Failed to load template');
  }

  const templateSource = await templateResponse.text();
  const template = Handlebars.compile(templateSource);
  const renderedHtml = template(data);

  mainContainer.innerHTML = renderedHtml;
}

function convertMapToObject(map) {
  return Object.fromEntries(map);
}
