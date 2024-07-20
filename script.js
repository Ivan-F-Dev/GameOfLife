const cnv = document.getElementById('canvas')
//controls
const ctrl1 = document.getElementById('ctrl1')
const ctrl2 = document.getElementById('ctrl2')
const input1 = document.getElementById('input1')
const input2 = document.getElementById('input2')
const input3 = document.getElementById('input3')
const input4 = document.getElementById('input4')
const info1 = document.getElementById('info1')
const info2 = document.getElementById('info2')
const info3 = document.getElementById('info3')
//vars
let grid = []
let size = 800
let gridSize = 100
let cellSize = cnv.width / gridSize
let cellsCount = gridSize**2
let densityGrid = 0.1
let speed = 100
let isPlay = false
let averageTime = 0
const ctx = cnv.getContext('2d')
//core
function setGrid() {
    const arr = new Array(gridSize);
    for (let i = 0; i < gridSize; i++) {
        arr[i] = new Array(gridSize).fill(0).map(() => Math.random() < densityGrid ? 1 : 0);
    }
    return arr;
}
function drawGrid() {
    ctx.fillStyle = "rgb(34 139 31)"
    ctx.clearRect(0, 0, size, size)
    for (let row = 0; row < gridSize; row++) {
        for (let column = 0; column < gridSize; column++) {
            if (grid[row][column] === 1) {
                ctx.fillRect(cellSize * column, cellSize * row, cellSize, cellSize)
            }
        }
    }
}
function createGrid() {
    const start = performance.now();
    grid = setGrid()
    drawGrid()
    const end = performance.now();
    info1.textContent = (Math.floor(end-start)).toString()
    info2.textContent = cellsCount
}
function getNeighbors() {
    let cellNeighbors = []
    for (let i = 0; i < grid.length; i++) {
        cellNeighbors[i] = []
        for (let k = 0; k < grid.length; k++) {
            let cells_around = [
                grid[getI(i - 1)][getI(k - 1)],
                grid[getI(i - 1)][getI(k)],
                grid[getI(i - 1)][getI(k + 1)],
                grid[getI(i)][getI(k - 1)],
                grid[getI(i)][getI(k + 1)],
                grid[getI(i + 1)][getI(k - 1)],
                grid[getI(i + 1)][getI(k)],
                grid[getI(i + 1)][getI(k + 1)],
            ]
            cellNeighbors[i][k] = cells_around.filter((el) => el === 1).length
        }
    }
    return cellNeighbors
}
function getI(i) {
    if (i < 0) return gridSize-1
    if (i === gridSize) return 0
    return i
}
function step(cb) {
    let start = performance.now()
    let cellNeighbors = getNeighbors()
    for (let i = 0; i < grid.length; i++) {
        for (let k = 0; k < grid.length; k++) {
            let cell = grid[i][k]
            let countNeighbors = cellNeighbors[i][k]
            if ( (cell === 0 && (countNeighbors === 3)) || (cell === 1 && (countNeighbors === 2 || countNeighbors === 3)) ) {
                grid[i][k] = 1
            } else {
                grid[i][k] = 0
            }
        }
    }
    drawGrid()
    let end = performance.now()
    cb(Math.floor(end-start))
}
function calcAverageTime() {
    let time = []
    return (t) => {
        time.push(t)
        if (time.length > 9) {
            averageTime = time.reduce((accumulator, currentValue) => accumulator + currentValue, 0)/10
            info3.textContent = Math.floor(averageTime).toString()
            time = []
        }
    }
}
// actions
function play() {
    if (!isPlay) {
        let cb = calcAverageTime()
        isPlay = setInterval(() => step(cb),speed)
        ctrl2.textContent = 'pause'
        ctrl1.disabled = true
    } else {
        clearInterval(isPlay)
        isPlay = false
        ctrl2.textContent = 'play'
        ctrl1.disabled = false
    }
}
function setSpeed(e) {
    if (+e.target.value < 10) return 10
    if (!e.target.value) return
    speed = +e.target.value
    if (isPlay) {
        clearInterval(isPlay)
        isPlay = setInterval(step,speed)
    }
}
function resize(e) {
    if (!e.target.value) return
    size = +e.target.value
    cellSize = size / gridSize
    cnv.height = size
    cnv.width = size
    // gridSize = size / cellSize
    cellsCount = gridSize**2
    if (isPlay) {
        clearInterval(isPlay)
        isPlay = false
        ctrl2.textContent = 'play'
        ctrl1.disabled = false
    }
    createGrid()
}
function setGridSize(e) {
    if (!e.target.value) return
    gridSize = +e.target.value
    cellSize = cnv.width / gridSize
    cellsCount = gridSize**2
    if (isPlay) {
        clearInterval(isPlay)
        isPlay = false
        ctrl2.textContent = 'play'
        ctrl1.disabled = false
    }
    createGrid()
}
function setDensity(e) {
    if (!e.target.value) return
    densityGrid = +e.target.value / 100
    if (!isPlay) {
        createGrid()
    }
}
function handleSetGrid(e) {
    let rect = e.target.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    let row = Math.floor(y / cellSize)
    let col = Math.floor(x / cellSize)
    if (grid.length > 0) {
        grid[row][col] = grid[row][col] ? 0 : 1
        drawGrid()
    }
}
//actions registration
cnv.addEventListener('click',handleSetGrid)
ctrl1.addEventListener('click',createGrid)
ctrl2.addEventListener('click',play)
input1.addEventListener('blur', resize)
input4.addEventListener('blur', setGridSize)
input2.addEventListener('blur', setDensity)
input3.addEventListener('blur', setSpeed)

createGrid()