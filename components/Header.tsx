import React from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

export const Header = ({ title = 'Catan Companion', className = '' }: HeaderProps) => {
  return (
    <header className={`p-4 bg-blue-600 text-white ${className}`}>
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
};