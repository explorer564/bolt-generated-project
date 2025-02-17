import React, { useState, useEffect } from 'react';
import './App.css';

const tileColors = ['red', 'blue', 'green', 'yellow'];
const gridSize = 8;
const levelTime = 20; // seconds

function App() {
  const [grid, setGrid] = useState(createGrid());
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(levelTime);
  const [gameOver, setGameOver] = useState(false);

  function createGrid() {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
      newGrid.push(Array(gridSize).fill(null).map(() => ({
        color: tileColors[Math.floor(Math.random() * tileColors.length)],
        matched: false,
      })));
    }
    return newGrid;
  }

  function handleTileClick(row, col) {
    if (gameOver) return; // Prevent clicks after game over

    if (selectedTile) {
      const [selRow, selCol] = selectedTile;
      if (Math.abs(row - selRow) + Math.abs(col - selCol) === 1) {
        // Swap tiles
        const newGrid = grid.map(rowArr => [...rowArr]);
        [newGrid[row][col], newGrid[selRow][selCol]] = [newGrid[selRow][selCol], newGrid[row][col]];
        setGrid(newGrid);
        setSelectedTile(null);

        // Check for matches after the swap
        setTimeout(() => handleMatches(newGrid), 200);
      } else {
        setSelectedTile([row, col]);
      }
    } else {
      setSelectedTile([row, col]);
    }
  }

  function handleMatches(currentGrid) {
    if (gameOver) return; // Prevent matches after game over

    let newGrid = currentGrid.map(rowArr => [...rowArr]);
    const matches = [];

    // Check rows
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize - 2; j++) {
        if (newGrid[i][j].color && newGrid[i][j].color === newGrid[i][j + 1].color && newGrid[i][j].color === newGrid[i][j + 2].color) {
          let k = j + 3;
          while (k < gridSize && newGrid[i][j].color === newGrid[i][k].color) {
            k++;
          }
          for (let l = j; l < k; l++) {
            matches.push([i, l]);
          }
          j = k - 1; // Skip the matched tiles
        }
      }
    }

    // Check columns
    for (let j = 0; j < gridSize; j++) {
      for (let i = 0; i < gridSize - 2; i++) {
        if (newGrid[i][j].color && newGrid[i][j].color === newGrid[i + 1][j].color && newGrid[i][j].color === newGrid[i + 2][j].color) {
          let k = i + 3;
          while (k < gridSize && newGrid[i][j].color === newGrid[k][j].color) {
            k++;
          }
          for (let l = i; l < k; l++) {
            matches.push([l, j]);
          }
          i = k - 1; // Skip the matched tiles
        }
      }
    }

    // Calculate score and add 'matched' class to matched tiles
    if (matches.length > 0) {
      let uniqueMatches = [];
      matches.forEach(([row, col]) => {
        if (!uniqueMatches.find(m => m[0] === row && m[1] === col)) {
          uniqueMatches.push([row, col]);
        }
      });

      uniqueMatches.forEach(([row, col]) => {
        newGrid[row][col] = { ...newGrid[row][col], matched: true };
      });

      let matchScore = uniqueMatches.length * 10; // Base score
      if (uniqueMatches.length >= 5) {
        matchScore += 50; // Bonus for larger matches
      }
      setScore(prevScore => prevScore + matchScore);

      setGrid(newGrid);

      // Capture uniqueMatches for use in setTimeout
      const capturedUniqueMatches = uniqueMatches;

      // Remove matches after the animation
      setTimeout(() => {
        let cleanGrid = newGrid.map(rowArr => [...rowArr]);
        capturedUniqueMatches.forEach(([row, col]) => {
          cleanGrid[row][col] = null;
        });
        // Shift down tiles
        for (let j = 0; j < gridSize; j++) {
          let emptyRows = 0;
          for (let i = gridSize - 1; i >= 0; i--) {
            if (cleanGrid[i][j] === null) {
              emptyRows++;
            } else if (emptyRows > 0) {
              cleanGrid[i + emptyRows][j] = cleanGrid[i][j];
              cleanGrid[i][j] = null;
            }
          }

          // Fill top rows with new tiles
          for (let i = 0; i < emptyRows; i++) {
            cleanGrid[i][j] = {
              color: tileColors[Math.floor(Math.random() * tileColors.length)],
              matched: false,
            };
          }
        }
        setGrid(cleanGrid);
      }, 500); // Delay to allow animation to complete
    } else {
      setGrid(newGrid); // Ensure grid is updated even when no matches are found
    }
  }

  useEffect(() => {
    let timerInterval;

    if (!gameOver) {
      timerInterval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timerInterval);
            setGameOver(true);
            return 0;
          } else {
            return prevTime - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval); // Cleanup on unmount or gameOver
  }, [gameOver]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="App">
      <h1>Match 3 Game</h1>
      <div className="score">Score: {score}</div>
      <div className="timer">Time: {minutes}:{seconds < 10 ? '0' : ''}{seconds}</div>
      {!gameOver ? (
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((tile, colIndex) => (
                <div
                  key={colIndex}
                  className={`tile ${tile ? tile.color : ''} ${selectedTile && selectedTile[0] === rowIndex && selectedTile[1] === colIndex ? 'selected' : ''} ${tile && tile.matched ? 'matched' : ''}`}
                  style={{ backgroundColor: tile ? tile.color : '' }}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                >
                  {tile && tile.matched && (
                    <div className="particles">
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="gameOverScreen">
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <button onClick={() => {
            setGrid(createGrid());
            setScore(0);
            setTimeRemaining(levelTime);
            setGameOver(false);
          }}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
