import React, { ReactNode } from 'react';

interface ButtonStylingProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

const ButtonStyling: React.FC<ButtonStylingProps> = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  icon
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary'
          ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
          : variant === 'secondary'
          ? 'bg-[#374151] hover:bg-[#4B5563] text-[#9CA3AF]'
          : variant === 'success'
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-red-500 hover:bg-red-600 text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

export default ButtonStyling;