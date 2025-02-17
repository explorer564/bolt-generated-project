import React from 'react';
import Tile from './Tile';

const GameBoard = ({ board, onTileClick, selectedTile }) => {
  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((tile, colIndex) => (
            <Tile
              key={colIndex}
              tile={tile}
              onClick={() => onTileClick(rowIndex, colIndex)}
              isSelected={selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
