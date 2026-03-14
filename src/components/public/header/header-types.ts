
import { Language } from "@/modules/shared/lib/i18n-constants";

export interface HeaderProps {
  // Add props if needed in the future
}

export interface NavMenuProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  language: Language;
}
