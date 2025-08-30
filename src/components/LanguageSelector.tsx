import React from 'react';
import { useTranslation } from 'react-i18next';
import { languages, isRTL } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'select' | 'dropdown';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'select', 
  className = '' 
}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Update document direction for RTL languages
    const currentLang = languages.find(lang => lang.code === languageCode);
    if (currentLang) {
      document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
    }
    
    // Save language preference
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <SelectValue>
                <span className="font-medium">{currentLanguage.nativeName}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {language.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {languages.map((language) => (
        <Button
          key={language.code}
          variant={currentLanguage.code === language.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange(language.code)}
          className="min-w-[60px] h-8 text-xs"
        >
          <span className="font-medium">{language.nativeName}</span>
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelector;
