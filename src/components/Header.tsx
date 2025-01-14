import React from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Catan Companion',
  className = '' 
}) => {
  return (
    <header className={`p-4 bg-blue-600 text-white ${className}`} role="banner">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
};

export default Header;