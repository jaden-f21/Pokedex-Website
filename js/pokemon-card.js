window.addEventListener('load', () => {
    let name = handlePokemonCardClick();

  });

// checks if the clicked element or its children have the class "pokemon-card-container."
//  If such an element is found, it retrieves the text content of an element with the class "pkm-name"
  let handlePokemonCardClick = () => {
    const resultsSection = document.getElementById("pokemon-results-section");
  
    resultsSection.addEventListener("click", (event) => {
      const card = event.target.closest(".pokemon-card-container");
      if (card) {
        const pokemonName = card.querySelector(".pkm-name").textContent;
        console.log(pokemonName)
        return pokemonName;
      }
    });
  };
  

async function fetchPokemonData(name){
    let pokemonData = {};

    // requests pokemon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

    if (!response.ok) {
      throw new Error("pokemon does not exist");
    }

    const data = await response.json();
    pokemonData[""]

}


async function fetchTemplate(data){
    let bodyElement = document.body

    // Fetch the Handlebars template file
    fetch('templates/pokemon-template.hbs')
        .then((response) => response.text())
        .then((templateSource) => {

            // Compile the Handlebars template
            const template = Handlebars.compile(templateSource);

            // Render the template with the data
            const renderedHtml = template(data);

            // Insert the rendered HTML into the container
            bodyElement.innerHTML = renderedHtml;
        })
        .catch((error) => {
            console.error('Error loading the Handlebars template:', error);
        });
}


    
