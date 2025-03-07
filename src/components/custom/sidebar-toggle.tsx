import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface SidebarToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

export function SidebarToggle({ onClick, isOpen }: SidebarToggleProps) {
  if (isOpen) return null;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-4 z-50"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
