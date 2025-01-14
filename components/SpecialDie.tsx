import React from 'react';
import { ShieldAlert, GalleryVerticalEnd, Building2, Lightbulb, ShoppingCart, Ban } from 'lucide-react';
import type { SpecialDieFace } from '../types/diceTypes';

interface SpecialDieProps {
  face: SpecialDieFace;
  className?: string;
}

const getSpecialDieIcon = (face: SpecialDieFace) => {
  const props = { 
    className: "h-8 w-8 text-white",
    'aria-hidden': "true",
    'data-testid': `${face}-icon`
  };

  switch (face) {
    case 'barbarian': return <ShieldAlert {...props} />;
    case 'merchant': return <GalleryVerticalEnd {...props} />;
    case 'politics': return <Building2 {...props} />;
    case 'science': return <Lightbulb {...props} />;
    case 'trade': return <ShoppingCart {...props} />;
    case 'none': return <Ban {...props} />;
  }
};

export const SpecialDie: React.FC<SpecialDieProps> = ({ face, className = '' }) => {
  const getBgColor = () => {
    switch (face) {
      case 'barbarian': return 'bg-red-600';
      case 'merchant': return 'bg-yellow-600';
      case 'politics': return 'bg-green-600';
      case 'science': return 'bg-blue-600';
      case 'trade': return 'bg-purple-600';
      case 'none': return 'bg-gray-400';
    }
  };

  return (
    <div 
      data-testid="special-die"
      className={`w-16 h-16 rounded-lg flex items-center justify-center ${getBgColor()} ${className}`}
      role="img"
      aria-label={`Special die showing ${face}`}
    >
      {getSpecialDieIcon(face)}
    </div>
  );
};