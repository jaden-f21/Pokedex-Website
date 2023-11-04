let pokemonName = ""
document.addEventListener('DOMContentLoaded', async() => {
  await handleCardClickEvents()
});

async function handleCardClickEvents() {
  const resultsSection = document.getElementById('pokemon-results-section');

  resultsSection.addEventListener('click', async (event) => {
      const card = event.target.closest('.pokemon-card-container');
      if (card) {
          const name = card.querySelector('.pkm-name').textContent;
          pokemonName = name;
          const pokemonData = await fetchPokemonData(name);
          await renderTemplate(pokemonData); 
          
          handleVersionClick()
          
      }
  });
}

async function fetchPokemonData(name) {
  const pokemonData = new Map();

  let data = await fetchResponseData(name)

  let category = await getCategory(data)
  let weaknesses = await getWeaknesses(data);
  let types =  await getTypes(data);
  let ability = getAbility(data);
  let version = await getVersion(data);
  console.log(version)

  pokemonData.set("name", name);
  pokemonData.set("id", data.id.toString().padStart(4, '0'));
  pokemonData.set('category', category);
  pokemonData.set("height",data.height/100);
  pokemonData.set("weight",data.weight/1000);
  pokemonData.set("types",types);
  pokemonData.set("ability",ability)
  pokemonData.set("weaknesses",weaknesses);
  pokemonData.set("version",version)

  return convertMapToObject(pokemonData);
}

async function fetchUrl(url) {
  const response = await fetch(url);
  const urlData = await response.json();
  return urlData;
}

let getTypes = async (data) => {
  let types = [];

  data.types.forEach(element => {
    types.push(element.type.name);
  });

  return types;
}

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

  if(weaknesses.length>5){
    return weaknesses.slice(0,5);
  }
  return weaknesses;
}

let getAbility= (data)=>{
  let abilitiesData= data.abilities.find((object) => object.is_hidden == false)
  return abilitiesData.ability.name
}

async function getCategory(data){
  let url = data.species.url;
  const speciesData = await fetchUrl(url);
  let category = speciesData.genera.find((genus) => genus.language.name === "en").genus;

  return category.split(" ")[0];
}


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



async function fetchResponseData(name){
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

  if (!response.ok) {
      throw new Error("Pokemon does not exist");
  }

  const data = await response.json();
  return data
}


// async function getEvolveTo(data){
//   let speciesUrl = data.species.url
//   let speciesData = await fetch(speciesUrl)

//   let evolutionUrl = speciesData.evolution_chain.url
//   let evolutionData = await fetch(evolutionUrl);

//   // let evolvesTo = 
// }

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
