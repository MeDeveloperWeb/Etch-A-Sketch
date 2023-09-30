const DEFAULT_GRID_SIZE = 50;

const sketchpad = document.querySelector(".sketchpad");
const slider = document.querySelector(".slider");

// HTML has span first and Input later
const [gridColSizeSpan, gridRowSizeInput] = document.querySelectorAll(".grid-size");

/**
 * Creates grid on chosen size
 * @param {number} gridSize
 * @argument e.target.value
 */
function createGrids(gridSize) {

    const gridRow = document.createElement('div');
    gridRow.setAttribute("class", "grid-row");

    const gridCell = document.createElement('div');
    gridCell.setAttribute("class", "grid-cell");

    for (let i=0; i < gridSize; i++) {
        gridRow.appendChild(gridCell.cloneNode(true)); 
    }
    for (let i=0; i < gridSize; i++) {
        sketchpad.appendChild(gridRow.cloneNode(true));
    }
}

/**
 * Changes value of span.grid-size and slider so that they all are in sync
 * Dispatches change event in slider
 */
gridRowSizeInput.addEventListener("input", () => {

    if (gridRowSizeInput.value >= 100) gridRowSizeInput.value = 100;

    if (!gridRowSizeInput.checkValidity()) {
        return gridRowSizeInput.reportValidity();
    }
    // Changes value of span and slider so that they are in sync
    gridColSizeSpan.textContent = slider.value = gridRowSizeInput.value;
    //
    slider.dispatchEvent(new Event('change')); 
});

/**
 * Keeps Input box and slider in Sync
 */
slider.addEventListener("input", () => 
    gridColSizeSpan.textContent = gridRowSizeInput.value = slider.value
);

/**
 * Creates grid when value of slider changes.
 */
slider.addEventListener("change", (e) => {
    sketchpad.replaceChildren();
    createGrids(+e.target.value);
});

// Create grids by default
createGrids(DEFAULT_GRID_SIZE);