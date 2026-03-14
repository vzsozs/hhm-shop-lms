
import { Language } from "@/modules/shared/lib/i18n-constants";

export interface NavMenuProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  language: Language;
}
