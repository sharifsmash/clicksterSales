import React from 'react';

interface MagicButtonProps {
  text: string;
}

export const MagicButton: React.FC<MagicButtonProps> = ({ text }) => {
  return (
    <button className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-800">
      {text}
    </button>
  );
};
