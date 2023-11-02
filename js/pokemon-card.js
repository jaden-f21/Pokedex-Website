let id = 0;

window.addEventListener('load', () => {
    handlePokemonCardClick();

  });

// checks if the clicked element or its children have the class "pokemon-card-container."
//  If such an element is found, it retrieves the text content of an element with the class "pkm-name"
  let handlePokemonCardClick = () => {
    const resultsSection = document.getElementById("pokemon-results-section");
    resultsSection.addEventListener("click", (event) => {
      const card = event.target.closest(".pokemon-card-container");
      let pokemonName = card.querySelector(".pkm-name").textContent;
      let data = fetchPokemonData(pokemonName);
      console.log(data)
      fetchTemplate(data)
  });

};
  

async function fetchPokemonData(name){
    let pokemonData = new Map();

    // requests pokemon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

    if (!response.ok) {
      throw new Error("pokemon does not exist");
    }

    const data = await response.json();
    pokemonData.set("name",name)
    pokemonData.set("id",data.id)
    id=data.id
    pokemonData.set("category",fetchCategory(data.species.url));
    return pokemonData
   
}

async function fetchCategory(url){
  const response = await fetch(url);
  let categoryData = await response.json();
  let category = categoryData.genera.find((genus)=> genus.language.name =="en").genus
  return category.split(" ")[0]

  
}


async function fetchTemplate(data){
    let mainContainer = document.body

    // Fetch the Handlebars template file
    const templateResponse = await fetch('pokemon-template.hbs');

    if (!templateResponse.ok) {
        throw new Error('Failed to load template');
    }

    const templateSource = await templateResponse.text()

    // Compile the Handlebars template
    const template = Handlebars.compile(templateSource);

    // Render the template with the data
    const renderedHtml = template(data);

    // Insert the rendered HTML into the container
    mainContainer.innerHTML = renderedHtml;

}


    
