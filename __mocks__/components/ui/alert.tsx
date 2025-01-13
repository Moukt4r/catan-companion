import React from 'react';

export const Alert = ({ children, className = '', ...props }: any) => (
  <div role="alert" className={className} {...props}>
    {children}
  </div>
);

export const AlertTitle = ({ children, className = '', ...props }: any) => (
  <h4 className={`alert-title ${className}`} {...props}>
    {children}
  </h4>
);

export const AlertDescription = ({ children, className = '', ...props }: any) => (
  <div className={`alert-description ${className}`} {...props}>
    {children}
  </div>
);

export default Alert;