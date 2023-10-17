const originalButtonStyles = new Map();
let selectedBtns = [];

var userAdvanceSeachData = {
  "gen":"",
  "types":[],
  "range": 0
}


window.addEventListener('load', () => {
  storeOriginalButtonStyles();
  listenFordAdvanceSearchEvents()
  
});


let storeOriginalButtonStyles = () =>{
  const buttons = document.querySelectorAll('#types-container .type-btn');
  buttons.forEach(button =>{
    originalButtonStyles.set(button, {
      background: getComputedStyle(button).backgroundColor,
      color: getComputedStyle(button).color,
      borderColor: getComputedStyle(button).borderColor,
      });
})

}

// handles type button clicks
let handleTypeButtonClick = () => {
  const buttons = document.querySelectorAll('#types-container .type-btn');
 
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // check if user selected the same button
      if(selectedBtns.includes(button)){
        // deselect the btn
        selectedBtns = selectedBtns.filter(selectedBtn => selectedBtn !== button);

        // Restore the original styling
        buttons.forEach(otherButton => {
          if (!selectedBtns.includes(otherButton)) {
            const originalStyle = originalButtonStyles.get(otherButton);
            otherButton.style.color = originalStyle.color;
            otherButton.style.borderColor = originalStyle.borderColor;
            button.style.background = originalStyle.background;
          }
        });

      } else if(selectedBtns.length < 2){
        // Select the btn
        const btnColor = getComputedStyle(button).color;
        button.style.background = btnColor;
        button.style.color = 'black';

        selectedBtns.push(button);
      }

      // check if user reached max amount of choices
      if(selectedBtns.length == 2){
        // Fade out all buttons except the selected ones
        buttons.forEach(otherButton => {
          if (!selectedBtns.includes(otherButton)) {
            otherButton.style.color = 'grey';
            otherButton.style.borderColor = 'grey';
          }
        });
      }

       // Get the text content of selected buttons
      const textBtns = selectedBtns.map(btn => btn.textContent);
      userAdvanceSeachData["types"] = textBtns
      // console.log(userAdvanceSeachData)
    });
    
})

}


// handles the range input change
let handleRangeInputChange = () => {
  const slider = document.getElementById('range-input');

  const maxValue = document.getElementById('max-value');

  // event listener for the 'input' event, which triggers while the user is dragging the slider
  slider.addEventListener("input", () => {
      const value = parseInt(slider.value);
      // Update the text content of the 'maxValue' to reflect the current value
      maxValue.textContent = value;
  });

  // event listener for the 'change' event, which triggers when the user releases the slider handle
  slider.addEventListener("change", () => {
      const value = parseInt(slider.value);
      // Update the text content of the 'maxValue' element to reflect the final selected value
      maxValue.textContent = value;
      
      // Updates 'userAdvanceSeachData' with the selected range value
      userAdvanceSeachData["range"] = value;
  });
}


// handles generation button clicks
let handleGenButtonClick = () => {
  let generations = document.querySelectorAll("#gen-container .gen-btn");

  generations.forEach(gen => {
      gen.addEventListener("click", () => {
          // Remove the 'active' class from all generation buttons
          generations.forEach(btn => {
              btn.classList.remove('active');
          });
          
          // Add the 'active' class to the clicked generation button
          gen.classList.add('active');

          // Updates 'userAdvanceSeachData' with the selected generation text
          userAdvanceSeachData["gen"] = gen.textContent;
      });
  });
}


// listen for click events for hiding or showing advance searches
let listenFordAdvanceSearchEvents= () => {
  const advanceSearchOpen = document.getElementById("advance-search-open-section");
  const advanceSearchClose = document.getElementById("advance-search-close-section");

  // show advance search results
  advanceSearchOpen.addEventListener("click",() => {
    console.log("button workd")
    advanceSearchClose.style.display = "flex";
    advanceSearchOpen.style.display = "none";

    handleRangeInputChange();
    handleGenButtonClick();
    handleTypeButtonClick()
    handleResetButtonClick();
  })

  // hide advance search results
  const hideAdvanceSearchBtn = document.getElementById("hide-search-container");
  hideAdvanceSearchBtn.addEventListener("click",() => {
    advanceSearchClose.style.display = "none";
    advanceSearchOpen.style.display = "flex";
  })
}

// resets advance search selections
let handleResetButtonClick = () => {
  let reset = document.getElementById("reset-btn");
  reset.addEventListener("click", ()=>{
    resetTypeButtons();
    resetGenButtons();
    resetNumberRange();
  })
 
}

// resets type buttons
function resetTypeButtons(){
  const buttons = document.querySelectorAll('#types-container .type-btn');

  buttons.forEach(button => {
    const originalStyle = originalButtonStyles.get(button); 
    button.style.color = originalStyle.color;
    button.style.borderColor = originalStyle.borderColor;
    button.style.background = originalStyle.background;
  })
  
  selectedBtns = [];
  userAdvanceSeachData["types"] = [];
}

// resets generation buttons
function resetGenButtons(){
  let generations = document.querySelectorAll("#gen-container .gen-btn");

  generations.forEach(gen => {
    gen.classList.remove("active");
  })
 userAdvanceSeachData["gen"] = [];
}

// resets range input
function resetNumberRange(){
  const slider = document.getElementById('range-input');
  const maxValue = document.getElementById('max-value');
  slider.value = 50;
  maxValue.textContent = '1010'; 
  userAdvanceSeachData["range"] = 0; 
  console.log(userAdvanceSeachData)
}

