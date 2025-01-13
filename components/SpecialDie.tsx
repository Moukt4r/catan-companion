import React from 'react';
import type { SpecialDieFace } from '../types/diceTypes';
import { ShieldAlert, GalleryVerticalEnd, Building2, Lightbulb, ShoppingCart, Ban } from 'lucide-react';

interface SpecialDieProps {
  face: SpecialDieFace;
  className?: string;
}

const getSpecialDieIcon = (face: SpecialDieFace) => {
  switch (face) {
    case 'barbarian': return <ShieldAlert className="h-8 w-8 text-white" />;
    case 'merchant': return <GalleryVerticalEnd className="h-8 w-8 text-white" />;
    case 'politics': return <Building2 className="h-8 w-8 text-white" />;
    case 'science': return <Lightbulb className="h-8 w-8 text-white" />;
    case 'trade': return <ShoppingCart className="h-8 w-8 text-white" />;
    case 'none': return <Ban className="h-8 w-8 text-white" />;
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
      className={`w-16 h-16 rounded-lg flex items-center justify-center ${getBgColor()} ${className}`}
      role="img"
      aria-label={`Special die showing ${face}`}
    >
      {getSpecialDieIcon(face)}
      <span className="sr-only">{face}</span>
    </div>
  );
};