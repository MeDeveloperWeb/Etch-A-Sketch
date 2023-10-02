const DEFAULT_GRID_SIZE = 50;

const sketchpad = document.querySelector(".sketchpad");
const slider = document.querySelector(".slider");

let currentGridSize;

let sketchPadPenColor = "#000000";
let sketchMode = "pen";
let pixelDrawn = 0;

// HTML has span first and Input later
const [gridColSizeSpan, gridRowSizeInput] = document.querySelectorAll(".grid-size");

// var to store if drawing is allowed on sketch board
let isDrawingEnabled = false;

/**
 * Sets the width of The sketchpad elements
 */
function setSketchPadDimensions() {
    const deviceHeight = window.innerHeight;
    const deviceWidth = window.innerWidth;

    const sketchpadToolCont = document.querySelector(".tools-container");

    sketchpad.style.width = sketchpad.style.height = sketchpadToolCont.style.width = Math.min(deviceHeight*8/10, deviceWidth*9/10, 960) + 'px';
}

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

/**
 * Changes the background color of provided Pixels
 * @param {HTMLElement} pixelDiv 
 * @param {string} mode {"pen", "brush", "eraser", "random"}
 */
function draw(pixelDiv, mode) {
    if (mode === "pen") pixelDiv.style.backgroundColor = sketchPadPenColor;

    else if (mode === "eraser") pixelDiv.style.removeProperty("background-color");

    // For selecting random colors.
    else if (mode === "random") pixelDiv.style.backgroundColor = '#' + Math.random().toString(16).slice(-6);

    else if (mode === "brush") {
        // Decreasing the opacity of the brush as soon as pixelDrawn Increases
        // Opacity decreases according to the currentGridSize
        // For pixelDrawn 0, Opacity is maximum, for pixelDrawn >= currentGridSize opacity is minimum
        // For the middle values we are getting the equivalent value of it, if it were divided in 256 intervals.
        let opacity = Math.floor(((currentGridSize) - pixelDrawn) * 255 / (currentGridSize));
        if (opacity < 50) opacity = 50

        if (pixelDiv.style.backgroundColor) {
            let currentRGB = pixelDiv.style.backgroundColor
            // We are getting opacity value in terms of RGB
            let currentOpacity = currentRGB.slice(currentRGB.lastIndexOf(',') + 2, -1);
            // If the pixel has already been drawn we don't want to overlay that with less opacity color
            opacity = Math.max(+currentOpacity*255, opacity);
            if (opacity > 256) opacity = 255;
        }

        let hexOpacity = opacity.toString(16);
        pixelDiv.style.backgroundColor = sketchPadPenColor + hexOpacity;
        pixelDrawn++;
    }
}

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
        createNewGrids(currentGridSize = +e.target.value);
    });

    // Toggle b/w showing and hiding grid lines
    document.querySelector("#grid-lines-checkbox").addEventListener("click", (e) => {
        sketchpad.classList.toggle("sketch-pad-with-grid");
        if (e.target.src.slice(-7) === "eye.svg") e.target.src = "media/eye-off.svg"
        else e.target.src = "media/eye.svg";
    })
}

/**
 * Handles all grid drawing event listeners
 */
function gridDrawingListeners() {
    // Enable Drawing, If clicked on sketch board
    sketchpad.addEventListener("mousedown", (e) => {
        /**
         * Why not pointer down?
         * To enable 2 finger pinch zoom.
         * How does it enable that?
         * For some reason this event triggers for short duration touches only
         * (?? It is the property maybe??)
         */
        if (e.target.className.includes("grid-cell")) draw(e.target, sketchMode);
        isDrawingEnabled = true;
    });

    // Disable Drawing if mouse or finger removed
    document.addEventListener("pointerup", (e) => {
        isDrawingEnabled = false;
        pixelDrawn = 0;
    });

    // Disable drawing in case of pointer cancel
    sketchpad.addEventListener("pointercancel", (e) => {
        isDrawingEnabled = false;
    });

    // Draw with touch
    sketchpad.addEventListener("touchmove", (e) => {
         /**
         * For mobile devices,
         * Not using pointer move as there is not a simple way of getting the no. of fingers (none that I can find)
         * I need finger count to enable two pinch zoom
         * I am getting the div.grid-cell from current finger position.
         * Thanks to this video: https://www.youtube.com/watch?v=MhUCYR9Tb9c (Used this originally for pointer, still it helped)
         */
        if (e.touches.length > 1) return;
        let touch = e.touches[0];
        let targetPixel = document.elementFromPoint(touch.pageX, touch.pageY);
        draw(targetPixel, sketchMode);

    })

    //Drawing when mouse moves
    sketchpad.addEventListener("mousemove", (e) => {
        if (isDrawingEnabled && e.target.className.includes("grid-cell")) draw(e.target, sketchMode);
    });
}

/**
 * Handles click on the sketchpad tools
 */
function sketchToolListeners() {
    /**
     * @param {string} hexColor hex value of color
     * @returns {boolean} true if color is dark else false
     */
    function isDarkHexColor(hexColor) {
        // Takes the 2nd character of hex color string if it's NaN it's already greater than 9
        // Red part of color tells enough about the darkness of color (at least for my case)
        if (hexColor[1] < "8") return true;
        return false;
    }

    const toolBar = document.querySelector(".tools-container");

    // Color of the pen or brush
    const colorPicker = toolBar.querySelector("#color-picker");
    const colorPickIcon = toolBar.querySelector("#color-select");

    // Background color of the sketchpad
    const bgColorPicker = toolBar.querySelector("#bg-color-picker");
    const bgColorPickIcon = toolBar.querySelector("#bg-color-select");

    // Binds Color Picker Icon to color Picker
    // We are using custom icons for  color pickers
    colorPickIcon.onclick = (e) => colorPicker.click();
    bgColorPickIcon.onclick = (e) => bgColorPicker.click();

    // Color picker to select the pen color
    colorPicker.addEventListener('change', () => {
        //Changing the Icon Color too along with the pen color
        colorPickIcon.style.backgroundColor = sketchPadPenColor = colorPicker.value;

        document.querySelector('body').style.backgroundColor = colorPicker.value + "80"

        // Change The value of logo if it's visible
        // Because Header is inheriting body's background color
        const header = document.querySelector('header');
        if (isDarkHexColor(colorPicker.value)) header.style.color = "white";
        else header.style.color = "rgba(64, 64, 64, 0.8)";

    });

    // Color Picker to select the Background color of sketch board
    bgColorPicker.addEventListener('change', () => {
        sketchpad.style.backgroundColor = bgColorPicker.value;

        // To make sure grid lines are visible
        if (isDarkHexColor(bgColorPicker.value)) sketchpad.classList.add("dark-bg");
        else sketchpad.classList.remove("dark-bg");
    });

    toolBar.querySelectorAll(".tool").forEach(el => {
        // I have used class names with length less than 7 for pen, brush, random color and eraser
        if (el.id.length < 7) el.onclick = () => sketchMode = el.id;
    });

    toolBar.querySelector("#delete-all").onclick = () => createNewGrids(slider.value);
}
/**
 * Set SketchPad Dimensions in Pixel
 * I know it's probably the bad idea to use this in js
 * But zoom does not work properly while using viewport sizes in css.
 */
setSketchPadDimensions();

// Create grids by default
createNewGrids(currentGridSize=DEFAULT_GRID_SIZE);

// Bind all required elements with event listeners
gridDrawingListeners();
gridManipulatorListeners();
sketchToolListeners();


