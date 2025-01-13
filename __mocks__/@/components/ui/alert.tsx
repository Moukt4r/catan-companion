import React from 'react';

export const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div role="alert" className={className}>
    {children}
  </div>
);

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="alert-title">{children}</div>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="alert-description">{children}</div>
);

export const AlertDialog = Alert;
export const AlertDialogAction = Alert;