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
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronDown, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LanguageSelectorProps {
  variant?: 'select' | 'dropdown' | 'button';
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'select', 
  className = '',
  showLabel = false,
  compact = false
}) => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();

  const handleLanguageChange = (languageCode: string) => {
    const previousLang = i18n.language;
    
    i18n.changeLanguage(languageCode);
    
    // Update document direction for RTL languages
    const currentLang = languages.find(lang => lang.code === languageCode);
    if (currentLang) {
      document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
      // Add smooth transition for RTL changes
      if (currentLang.rtl !== (languages.find(lang => lang.code === previousLang)?.rtl || false)) {
        document.body.style.transition = 'all 0.3s ease-in-out';
        setTimeout(() => {
          document.body.style.transition = '';
        }, 300);
      }
    }
    
    // Save language preference
    localStorage.setItem('preferredLanguage', languageCode);
    
    // Show success message
    toast({
      title: t('success.languageChanged'),
      description: `${t('common.language')}: ${currentLang?.nativeName || languageCode}`,
    });
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
          <SelectTrigger className={`${compact ? 'w-[140px]' : 'w-[180px]'} bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg`}>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <SelectValue>
                <span className="font-medium">{compact ? currentLanguage.code.toUpperCase() : currentLanguage.nativeName}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-2 border-primary/20 shadow-xl">
            {languages.map((language) => (
              <SelectItem 
                key={language.code} 
                value={language.code}
                className="hover:bg-primary/10 focus:bg-primary/10"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{language.nativeName}</span>
                    {language.rtl && (
                      <Badge variant="outline" className="text-xs px-1 py-0">RTL</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {language.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showLabel && (
          <span className="text-xs text-muted-foreground mt-1 block text-center">
            {t('common.translate')}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={() => {
          const currentIndex = languages.findIndex(lang => lang.code === currentLanguage.code);
          const nextIndex = (currentIndex + 1) % languages.length;
          handleLanguageChange(languages[nextIndex].code);
        }}
        className={`${className} bg-gradient-to-r from-emerald-500 to-blue-600 text-white border-0 hover:from-emerald-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
      >
        <Globe className="h-4 w-4 mr-2" />
        <span className="font-medium">
          {compact ? currentLanguage.code.toUpperCase() : currentLanguage.nativeName}
        </span>
        {showLabel && (
          <span className="ml-2 text-xs opacity-80">
            {t('common.translate')}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {languages.map((language) => (
        <Button
          key={language.code}
          variant={currentLanguage.code === language.code ? 'default' : 'outline'}
          size={compact ? "sm" : "default"}
          onClick={() => handleLanguageChange(language.code)}
          className={`min-w-[60px] h-8 text-xs transition-all duration-200 ${
            currentLanguage.code === language.code 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
              : 'hover:bg-primary/10 hover:border-primary/50'
          }`}
        >
          <span className="font-medium">{language.nativeName}</span>
          {language.rtl && (
            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">RTL</Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelector;

// Enhanced translation hook for better full-page translation support
export const usePageTranslation = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const translatePage = (languageCode: string) => {
    const targetLang = languages.find(lang => lang.code === languageCode);
    if (targetLang) {
      i18n.changeLanguage(languageCode);
      document.documentElement.dir = targetLang.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      localStorage.setItem('preferredLanguage', languageCode);
      
      // Force re-render of all translated content
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: targetLang } }));
    }
  };
  
  return {
    t,
    currentLanguage,
    translatePage,
    isRTL: currentLanguage.rtl
  };
};
