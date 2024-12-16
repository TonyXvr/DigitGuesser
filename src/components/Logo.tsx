import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/50 to-primary animate-pulse">
        ∑
      </div>
      <div className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        DigitGuesser
      </div>
    </div>
  );
};

export default Logo;