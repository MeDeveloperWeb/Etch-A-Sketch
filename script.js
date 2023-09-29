const sketchpad = document.querySelector(".sketchpad");

function createGrids(size) {
    const gridRow = document.createElement('div');
    gridRow.setAttribute("class", "grid-row");

    const gridCell = document.createElement('div');
    gridCell.setAttribute("class", "grid-cell");

    for (let i=0; i < size; i++) {
        gridRow.appendChild(gridCell.cloneNode(true)); 
    }
    for (let i=0; i < size; i++) {
        sketchpad.appendChild(gridRow.cloneNode(true));
    }
}

document.querySelector("button").onclick = () => {
    sketchpad.replaceChildren();
    createGrids(+prompt("grid"));
}