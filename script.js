const DEFAULT_GRID_SIZE = 50;

const sketchpad = document.querySelector(".sketchpad");
const slider = document.querySelector(".slider");

// HTML has span first and Input later
const [gridColSizeSpan, gridRowSizeInput] = document.querySelectorAll(".grid-size");

// var to store if brush mouse is clicked then dragged on sketch board
let isBrushEnabled = false;

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

// Create grids by default
createGrids(DEFAULT_GRID_SIZE);


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

// Enable Brush, If clicked on sketch board
sketchpad.addEventListener("pointerdown", (e) => {
    if (e.target.className.includes("grid-cell")) e.target.style.backgroundColor = "black";
    isBrushEnabled = true;
});

// Disable brush if mouse or finger removed
document.addEventListener("pointerup", () => isBrushEnabled = false);

// Draw when pointer moves
sketchpad.addEventListener("pointermove", (e) => {
    let targetPixel;

    /**
     * For mobile devices
     * Mobile pointer event don't exactly work like computer's. When using pointer over 
     * I was able to get only that div.grid-cell where I touched in the beginning in e.target
     * To solve this, I am getting the div.grid-cell from current finger position.
     * Thanks to this video: https://www.youtube.com/watch?v=MhUCYR9Tb9c
     */
    if (e.pointerType === "touch") targetPixel = document.elementFromPoint(e.pageX, e.pageY);
    /**
     * Else for computer devices, 
     * e.target works completely fine.
     */
    else targetPixel = e.target;

    if (isBrushEnabled && targetPixel.className.includes("grid-cell")) targetPixel.style.backgroundColor = "black";
});