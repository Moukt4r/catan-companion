import React, { memo } from 'react';
import type { SpecialDieFace } from '../types/diceTypes';
import {
  ShieldAlert,
  GalleryVerticalEnd,
  Building2,
  Lightbulb,
  ShoppingCart,
  Ban
} from 'lucide-react';

interface SpecialDieProps {
  face: SpecialDieFace;
  className?: string;
}

const getSpecialDieIcon = (face: SpecialDieFace): JSX.Element => {
  const iconProps = {
    className: "h-8 w-8 text-white",
    "aria-hidden": true
  };

  switch (face) {
    case 'barbarian': return <ShieldAlert {...iconProps} />;
    case 'merchant': return <GalleryVerticalEnd {...iconProps} />;
    case 'politics': return <Building2 {...iconProps} />;
    case 'science': return <Lightbulb {...iconProps} />;
    case 'trade': return <ShoppingCart {...iconProps} />;
    case 'none': return <Ban {...iconProps} />;
  }
};

const getBgColor = (face: SpecialDieFace): string => {
  switch (face) {
    case 'barbarian': return 'bg-red-600';
    case 'merchant': return 'bg-yellow-600';
    case 'politics': return 'bg-green-600';
    case 'science': return 'bg-blue-600';
    case 'trade': return 'bg-purple-600';
    case 'none': return 'bg-gray-400';
  }
};

const FACE_DESCRIPTIONS = {
  barbarian: 'Triggers barbarian movement on the Cities & Knights board',
  merchant: 'Allows moving the merchant piece',
  politics: 'Provides a politics card',
  science: 'Provides a science card',
  trade: 'Provides a trade card',
  none: 'No special action'
};

export const SpecialDie: React.FC<SpecialDieProps> = memo(({ face, className = '' }) => {
  return (
    <div 
      className={`w-16 h-16 rounded-lg flex items-center justify-center ${getBgColor(face)} ${className}`}
      role="img"
      aria-label={`Special die showing ${face}`}
      title={FACE_DESCRIPTIONS[face]}
    >
      {getSpecialDieIcon(face)}
      <span className="sr-only">{face} - {FACE_DESCRIPTIONS[face]}</span>
    </div>
  );
});