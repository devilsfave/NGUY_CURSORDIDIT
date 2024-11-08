import React from 'react';
import { motion } from 'framer-motion';
import ButtonStyling from '../../ButtonStyling';
import { useRouter } from 'next/navigation';

interface Action {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface ActionButtonsProps {
  actions: Action[];
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, className = '' }) => {
  const router = useRouter();

  const handleClick = (action: Action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <motion.div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {actions.map((action, index) => (
        <ButtonStyling
          key={index}
          text={action.text}
          onClick={() => handleClick(action)}
          variant={action.variant || 'secondary'}
        />
      ))}
    </motion.div>
  );
};

export default ActionButtons;