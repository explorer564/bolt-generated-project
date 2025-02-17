import React from 'react';

const Tile = ({ tile, onClick, isSelected }) => {
  return (
    <div
      className={`tile ${tile.category.toLowerCase()} ${isSelected ? 'selected' : ''} ${tile.matched ? 'matched' : ''}`}
      onClick={onClick}
    >
      {tile.category}
    </div>
  );
};

export default Tile;
