/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Search, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'tl', name: 'Filipino', nativeName: 'Tagalog' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'fy', name: 'Frisian', nativeName: 'Frysk' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hmn', name: 'Hmong', nativeName: 'Hmong' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'jw', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Fiteny Malagasy' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'mi', name: 'Maori', nativeName: 'Māori' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'my', name: 'Myanmar (Burmese)', nativeName: 'မြန်မာစာ' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'or', name: 'Odia (Oriya)', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'gd', name: 'Scots Gaelic', nativeName: 'Gàidhlig' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho' },
  { code: 'sn', name: 'Shona', nativeName: 'ChiShona' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaaliga' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچه' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִديש' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' }
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState('en');
  const dropdownRef = useRef(null);

  // Helper to get active language code from cookies or localStorage
  useEffect(() => {
    const getSavedLang = () => {
      const saved = localStorage.getItem('medcore_lang');
      if (saved) return saved;
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      return match ? match[1] : 'en';
    };
    setActiveLang(getSavedLang());
  }, []);

  // Sync Google Translate Combo box periodically to make sure translation matches
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        const expectedValue = activeLang === 'en' ? '' : activeLang;
        if (selectEl.value !== expectedValue) {
          selectEl.value = expectedValue;
          selectEl.dispatchEvent(new Event('change'));
        }
        clearInterval(interval);
      }
      if (count >= 50) { // Check for up to 10 seconds on page mount / transition
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [activeLang]);

  // Initialize official hidden google translate elements dynamically
  useEffect(() => {
    // Define the initiator BEFORE script tags are loaded/appended to guarantee execution.
    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      } catch (err) {
        console.warn("Google translate element registration error:", err);
      }
    };

    // Ensure container exists
    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      document.body.appendChild(container);
    }

    // Embed bypass/hide global CSS using off-screen placement instead of display none to preserve events flow
    const styleId = 'google-translate-hide-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        body {
          top: 0px !important;
          position: static !important;
        }
        .skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
        }
        #google_translate_element {
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
        }
        iframe.goog-te-menu-frame {
          display: none !important;
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Append script elements to body structure with secure protocols
    const scriptId = 'google-translate-script';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'text/javascript';
      scriptEl.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(scriptEl);
    } else {
      // If already loaded, trigger init manually to handle any reactive route re-mounts
      if (window.googleTranslateElementInit) {
        window.googleTranslateElementInit();
      }
    }

    // Add click outside handler to close dropdown popover
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Set local state, backup translation cookies, and trigger translation event
  const handleSelectLanguage = (langCode) => {
    localStorage.setItem('medcore_lang', langCode);
    setActiveLang(langCode);
    setIsOpen(false);

    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`
    ];
    
    // Add base domain if applicable
    const parts = window.location.hostname.split('.');
    if (parts.length >= 2) {
      domains.push('.' + parts.slice(-2).join('.'));
    }

    // Set cookie on default path for maximum compatibility across preview iframes
    const secureSuffix = "; path=/; SameSite=None; Secure";

    if (langCode === 'en') {
      const delVal = "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = `googtrans${delVal}${secureSuffix}`;
      domains.forEach(d => {
        document.cookie = `googtrans${delVal}; domain=${d}${secureSuffix}`;
      });
    } else {
      const cookieValue = `/en/${langCode}`;
      document.cookie = `googtrans=${cookieValue}${secureSuffix}`;
      domains.forEach(d => {
        document.cookie = `googtrans=${cookieValue}; domain=${d}${secureSuffix}`;
      });
    }

    // Fire actual translation change event directly to the combo box immediately
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = langCode === 'en' ? '' : langCode;
      selectEl.dispatchEvent(new Event('change'));
      
      // Slight delay reload to make sure cookie values are registered by engine on browser thread
      setTimeout(() => {
        window.location.reload();
      }, 350);
    } else {
      window.location.reload();
    }
  };

  const selectedLangObj = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];

  // Filter languages list based on search term
  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="website-language-selector">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all"
        id="btn-lang-selector-toggle"
      >
        <Globe className="w-3.5 h-3.5 text-blue-505 dark:text-teal-400 shrink-0" />
        <span className="truncate max-w-[90px]">{selectedLangObj.nativeName} ({selectedLangObj.code.toUpperCase()})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-100 flex flex-col overflow-hidden animate-fade-in">
          {/* Search bar inside popover */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 border-none outline-none focus:ring-0 placeholder-slate-400 p-0.5"
              autoFocus
              id="lang-search-input"
            />
          </div>

          {/* Languages selection list */}
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/65 transition-colors cursor-pointer ${activeLang === lang.code ? 'bg-blue-50/55 dark:bg-teal-950/25 font-bold text-blue-600 dark:text-teal-400' : ''}`}
                  id={`lang-option-${lang.code}`}
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="truncate leading-none">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-450 mt-0.5 truncate">{lang.name}</span>
                  </div>
                  {activeLang === lang.code && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-teal-400 shrink-0 ml-1" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
