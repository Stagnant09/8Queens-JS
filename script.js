let colors = ['rgb(128, 170, 255)', 'rgb(133, 224, 133)', 'rgb(255, 212, 128)', 'rgb(255, 128, 128)', 'rgb(223, 128, 255)', 'rgb(204, 204, 204)', 'rgb(194, 240, 240)', 'rgb(230, 255, 153)'];
let cells = [];
let resultLabel;
let playAgainButton;

function assignColors() {
    console.log(cells);
    /*Cell background color assignment algorithm*/
    /* Rules:
    * Cells of the same color have to appear in a continuous form - in other words, each cell of color C must have at least one neighbor of color C (vertically or horizontally).
    */
    let colorMap = {};
    // Re-arrange cells to a 8x8 array
    let grid = [];
    for (let i = 0; i < 8; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            row.push(cells[i * 8 + j]);
        }
        grid.push(row);
    } 
    //
    // Array [0, 1, 2, 3, 4, 5, 6, 7] shuffled randomly
    let indexes = [0, 1, 2, 3, 4, 5, 6, 7];
    indexes.sort(() => Math.random() - 0.5);
    let efforts = 0;

    for (let i = 0; i<8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = grid[indexes[i]][j];
            while (cell.style.backgroundColor == "rgb(255, 255, 255)" || !cell.style.backgroundColor) {
                efforts++;
                if (efforts > 1000) {
                    console.log("Failed to assign colors to cells");
                    return false;
                }
                let newColor = colors[Math.floor(Math.random() * colors.length)];
                while (colorMap[newColor] > 12) {
                    efforts++;
                    newColor = colors[Math.floor(Math.random() * colors.length)];
                }
                console.log("Assign color", newColor, "to", cell);
                if (!(newColor in colorMap)) {
                    cell.style.backgroundColor = newColor;
                    if (indexes[i] < 7 ) grid[indexes[i]+1][j].style.backgroundColor = newColor;
                    if (j < 7 ) grid[indexes[i]][j+1].style.backgroundColor = newColor;
                    if (j < 6 ) grid[indexes[i]][j+2].style.backgroundColor = newColor;
                    colorMap[newColor] = 3;  // Initialize count to 1
                }
                else {
                    // Check neighboring cells
                    let neighbors = getNeighbors(grid, indexes[i], j);
                    let hasMatchingColor = false;
                    for (let neighbor of neighbors) {
                        if (neighbor.style.backgroundColor == newColor) {
                            hasMatchingColor = true;
                            break;
                        }
                    }
                    if (hasMatchingColor) {
                        cell.style.backgroundColor = newColor;
                        colorMap[newColor]++;
                    }
                }
            }
        }
    }

    // Find all cells with white background
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = grid[i][j];
            if (cell.style.backgroundColor == "rgb(255, 255, 255)") {
                // Pick a random color from the neighbors
                let neighbors = getNeighbors(grid, i, j);
                let colors_ = [];
                for (let i = 0; i < neighbors.length; i++) {
                    if (neighbors[i].style.backgroundColor == "rgb(255, 255, 255)") continue;
                    colors_.push(neighbors[i].style.backgroundColor);
                }
                let color = colors_[Math.floor(Math.random() * colors_.length)];
                cell.style.backgroundColor = color;
            }
        }
    }
    return true;
}

function hasSolutionAndIsValid() {
    let n = 8;  // Size of the chessboard
    let colors = {};  // Track the colors where queens have been placed
    let cols = Array(n).fill(false);  // Track if a column has a queen
    let colorMap = {};  // Track if a color has a queen
    let grid = [];
    for (let i = 0; i < 8; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            row.push(cells[i * 8 + j]);
        }
        grid.push(row);
    } 

    // Helper function to get neighboring cells' coordinates
    function getNeighbors(i, j) {
        let neighbors = [];
        if (i > 0) neighbors.push([i - 1, j]); // Top
        if (i < 7) neighbors.push([i + 1, j]); // Bottom
        if (j > 0) neighbors.push([i, j - 1]); // Left
        if (j < 7) neighbors.push([i, j + 1]); // Right
        return neighbors; // Return as array of arrays
    }

    // Helper function to check if a cell has the same color in neighboring cells
    function isColorContinuous(i, j, visited) {
        let stack = [[i, j]];
        let color = grid[i][j].style.backgroundColor;
        visited[i][j] = true;

        while (stack.length > 0) {
            let [x, y] = stack.pop();
            let neighbors = getNeighbors(x, y);

            for (let neighbor of neighbors) { // Correct iteration over neighbors
                let [nx, ny] = neighbor;      // Decompose the neighbor pair
                if (!visited[nx][ny] && grid[nx][ny].style.backgroundColor === color) {
                    visited[nx][ny] = true;
                    stack.push([nx, ny]);      // Add to stack for further exploration
                }
            }
        }

        // Check if there are any unvisited cells of this color
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (grid[i][j].style.backgroundColor === color && !visited[i][j]) {
                    return false;  // If any cell with the same color is unvisited, return false
                }
            }
        }

        return true;  // If all connected cells of the same color are visited, the color is continuous
    }

    // Check if the grid satisfies the color contiguity rule
    function checkColorContiguity() {
        let visited = Array.from({ length: n }, () => Array(n).fill(false));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (!visited[i][j]) {
                    if (!isColorContinuous(i, j, visited)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // Main backtracking function
    function placeQueens(row) {
        if (row === n) {
            // If all queens are placed, return true (valid solution found)
            return true;
        }

        for (let col = 0; col < n; col++) {
            let color = grid[row][col].style.backgroundColor;

            // Check if the column or color has already been used
            if (!cols[col] && !colorMap[color]) {
                // Place a queen
                cols[col] = true;
                colorMap[color] = true;

                // Recur to place the next queen in the next row
                if (placeQueens(row + 1)) {
                    return true;
                }

                // Backtrack: remove the queen and try the next position
                cols[col] = false;
                colorMap[color] = false;
            }
        }

        // No valid placement found in this configuration
        return false;
    }

    // Step 1: Check if all colors are continuous
    if (!checkColorContiguity()) {
        return false;  // If colors are not continuous, there's no valid solution
    }

    // Step 2: Try placing queens
    return placeQueens(0);
}

function clearAllCellsBackground(){
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            cells[i * 8 + j].style.backgroundColor = "";
        }
    }
}


function solutionHasAppeared() {
    let n = 8; // Size of the chessboard
    let rows = Array(n).fill(0); // Track number of crowns in each row
    let cols = Array(n).fill(0); // Track number of crowns in each column
    let colorMap = {};           // Track number of crowns per color
    let grid = [];
    for (let i = 0; i < 8; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            row.push(cells[i * 8 + j]);
        }
        grid.push(row);
    } 

    let totalCrowns = 0;         // Track the total number of crowns

    // Iterate over the grid and look for cells with a crown
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let cell = grid[i][j];
            
            // Check if the cell contains a crown
            if (cell.style.backgroundImage === 'url("crown.png")') {
                // Count the crown in the current row and column
                rows[i]++;
                cols[j]++;

                // Get the color of the cell
                let color = cell.style.backgroundColor;

                // Count the crown in the current color
                if (color in colorMap) {
                    colorMap[color]++;
                } else {
                    colorMap[color] = 1;
                }

                // Increase total crown count
                totalCrowns++;

                // If more than one crown is placed in the same row, column, or color, return false
                if (rows[i] > 1 || cols[j] > 1 || colorMap[color] > 1) {
                    return false;
                }
            }
        }
    }

    // After the loop, check if exactly 8 crowns have been placed
    if (totalCrowns !== 8) {
        return false; // If there aren't exactly 8 crowns, return false
    }

    return true; // If all checks pass, return true
}



// Helper function to get neighboring cells
function getNeighbors(grid, i, j) {
    let neighbors = [];
    if (i > 0) neighbors.push(grid[i-1][j]); // Top
    if (i < 7) neighbors.push(grid[i+1][j]); // Bottom
    if (j > 0) neighbors.push(grid[i][j-1]); // Left
    if (j < 7) neighbors.push(grid[i][j+1]); // Right
    return neighbors;
}

window.onload = () => {
    console.log('loaded');
    cells = document.querySelectorAll('.cell');
    resultLabel = document.querySelectorAll('.result')[0];
    playAgainButton = document.querySelectorAll('#playAgain')[0];

    let validity = false;
    let assignment = false;
    let efforts = 0;
    while (!validity && efforts < 15000) {
        // Sleep for 1 second
        efforts++;
        new Promise(resolve => setTimeout(resolve, 100));
        clearAllCellsBackground();
        assignment = assignColors();
        while (!assignment) {
            clearAllCellsBackground();
            assignment = assignColors();
        }
        validity = hasSolutionAndIsValid();
    }
    console.log(assignment);
    console.log(validity);
    console.log(efforts);

    cells.forEach((cell) => {
        cell.addEventListener('click', () => {


            if (cell.style.backgroundImage == 'url("x-symbol.png")') {
                cell.style.backgroundImage = 'url("crown.png")';
                cell.style.backgroundSize = '2.5em 2.5em';
                cell.style.backgroundRepeat = 'no-repeat';
                cell.style.backgroundPosition = 'center center';
                if (solutionHasAppeared()) {
                    console.log('Congratulations!');
                    resultLabel.innerHTML = 'Congratulations! You found the solution!';
                    playAgainButton.style.display = 'block'; // Activate the button
                }
                return;
            }
            else if (cell.style.backgroundImage == 'url("crown.png")') {
                cell.style.backgroundImage = '';
                cell.style.backgroundSize = '0';
                cell.style.backgroundRepeat = 'no-repeat';
                cell.style.backgroundPosition = 'center center';
                if (solutionHasAppeared()) {
                    console.log('Congratulations!');
                    resultLabel.innerHTML = 'Congratulations! You found the solution!';
                    playAgainButton.style.display = 'block'; // Activate the button
                }
                return;
            }
            else {
                cell.style.backgroundImage = 'url("x-symbol.png")';
                cell.style.backgroundSize = '0.6em 0.6em';
                cell.style.backgroundRepeat = 'no-repeat';
                cell.style.backgroundPosition = 'center center';
            }

            if (solutionHasAppeared()) {
                resultLabel.innerHTML = 'Congratulations! You found the solution!';
                console.log('Congratulations!');
                playAgainButton.style.display = 'block'; // Activate the button
            }

        })
    })

    playAgainButton.addEventListener('click', () => {
        location.reload(); // Reload the page
    })
    
}