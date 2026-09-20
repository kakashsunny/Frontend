import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name?: string;
  fallback?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, fallback = 'CircleDollarSign', ...props }) => {
  const iconName = name || fallback;
  // @ts-ignore
  const IconComponent = Icons[iconName] || Icons[fallback] || Icons.CircleDollarSign;
  return <IconComponent {...props} />;
};
