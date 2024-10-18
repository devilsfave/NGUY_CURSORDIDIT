import React from 'react';

interface ButtonStylingProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  component?: 'button' | 'span';
}

const ButtonStyling: React.FC<ButtonStylingProps> = ({
  text,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  component = 'button'
}) => {
  const baseStyle = 'px-4 py-2 rounded-md font-semibold transition-colors duration-200 ease-in-out';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  };
  const disabledStyle = 'opacity-50 cursor-not-allowed';

  const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${disabled ? disabledStyle : ''} ${className}`;

  const ButtonComponent = component as any;

  return (
    <ButtonComponent
      onClick={onClick}
      className={buttonStyle}
      disabled={disabled}
    >
      {text}
    </ButtonComponent>
  );
};

export default ButtonStyling;