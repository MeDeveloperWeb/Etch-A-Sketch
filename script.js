const DEFAULT_GRID_SIZE = 50;

const sketchpad = document.querySelector(".sketchpad");
const slider = document.querySelector(".slider");

let sketchPadColor = "#ffffff"; 
let sketchPadPenColor = "#000000";
let sketchMode = "pen";
let pixelDrawn = 0;

// HTML has span first and Input later
const [gridColSizeSpan, gridRowSizeInput] = document.querySelectorAll(".grid-size");

// var to store if drawing is allowed on sketch board
let isDrawingEnabled = false;

/**
 * Creates grid on chosen size
 * @param {number} gridSize
 * @argument e.target.value
 */
function createNewGrids(gridSize) {
    //Remove previous Grids
    sketchpad.replaceChildren();

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

function draw(pixelDiv, mode) {
    if (mode === "pen") pixelDiv.style.backgroundColor = sketchPadPenColor;
    else if (mode === "eraser") pixelDiv.style.removeProperty("background-color");
    else if (mode === "random") pixelDiv.style.backgroundColor = '#' + Math.random().toString(16).slice(-6);
    else if (mode === "brush") {

        let opacity = pixelDrawn < 200 ? 255 - pixelDrawn : 55;

        if (pixelDiv.style.backgroundColor) {
            let currentRGB = pixelDiv.style.backgroundColor
            let currentOpacity = currentRGB.slice(currentRGB.lastIndexOf(',')+2, -1);

            opacity += Math.round(+currentOpacity * 255);
            console.log(opacity);
            if (opacity > 256) opacity = 255;
        }

        let hexOpacity = opacity.toString(16);
        pixelDiv.style.backgroundColor = sketchPadPenColor + hexOpacity;
        pixelDrawn++;
    }
    else if (mode = "move") return;
}

// Create grids by default
createNewGrids(DEFAULT_GRID_SIZE);

/**
 * Handles all grid manipulation event listeners
 */
function gridManipulatorListeners() {
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
        createNewGrids(+e.target.value);
    });

    // Toggle b/w showing and hiding grid lines
    document.querySelector("#grid-lines-checkbox").addEventListener("change", (e) => {
        sketchpad.classList.toggle("sketch-pad-with-grid")
    })
}

gridManipulatorListeners();


function gridDrawingListeners() {
    // Enable Drawing, If clicked on sketch board
    sketchpad.addEventListener("pointerdown", (e) => {
        if (e.target.className.includes("grid-cell")) draw(e.target, sketchMode)
        isDrawingEnabled = true;
    });

    // Disable Drawing if mouse or finger removed
    document.addEventListener("pointerup", () => {
        isDrawingEnabled = false;
        pixelDrawn = 0;
    });

    // Drawing when pointer moves
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

        if (isDrawingEnabled && targetPixel.className.includes("grid-cell")) draw(targetPixel, sketchMode)
    });
}

gridDrawingListeners();

function sketchToolListeners() {
    /**
     * @param {string} hexColor hex value of color
     * @returns {boolean} true if color is dark else false
     */
    function isDarkHexColor(hexColor) {
        // Takes the 2nd character of hex color string if it's NaN it's already greater than 9
        // Red part of color tells enough about the darkness of color (at least for my case)
        if (+hexColor[1] !== NaN && +hexColor[1] < 5) return true;
        return false;
    }

    const toolBar = document.querySelector(".tools-container");

    const colorPicker = toolBar.querySelector("#color-picker");
    const colorPickIcon = toolBar.querySelector("#color-select");

    const bgColorPicker = toolBar.querySelector("#bg-color-picker");
    const bgColorPickIcon = toolBar.querySelector("#bg-color-select");

    // Binds Color Picker Icon to color Picker
    // We are using custom icons for  color pickers
    colorPickIcon.onclick = (e) => colorPicker.click();
    bgColorPickIcon.onclick = (e) => bgColorPicker.click();

    // Color picker to select the pen color
    colorPicker.addEventListener('change', (e) => {
        colorPickIcon.style.backgroundColor = colorPicker.value;
        sketchPadPenColor = colorPicker.value;
    });

    // Color Picker to select the Background color of sketch board
    bgColorPicker.addEventListener('change', (e) => {
        sketchPadColor = bgColorPicker.value;
        sketchpad.style.backgroundColor = sketchPadColor;

        // To make sure grid lines are visible
        if (isDarkHexColor(sketchPadColor)) sketchpad.classList.add("dark-bg");
        else sketchpad.classList.remove("dark-bg");
    });

    toolBar.querySelectorAll(".tool").forEach(el => {
        if (el.id.length < 7) el.onclick = () => {
            sketchMode = el.id;
            if (el.id === "move") sketchpad.style.touchAction = "auto";
            else sketchpad.style.touchAction = "pinch-zoom";
        }
    });

    toolBar.querySelector("#delete-all").onclick = () => createNewGrids(slider.value);
}

sketchToolListeners();