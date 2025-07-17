import React from 'react';

// List of RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// List of supported languages with their codes and names
const LANGUAGES = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'am', name: 'Amharic' },
    { code: 'ar', name: 'Arabic' },
    { code: 'as', name: 'Assamese' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'ba', name: 'Bashkir' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bo', name: 'Tibetan' },
    { code: 'br', name: 'Breton' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'cs', name: 'Czech' },
    { code: 'cy', name: 'Welsh' },
    { code: 'da', name: 'Danish' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'et', name: 'Estonian' },
    { code: 'eu', name: 'Basque' },
    { code: 'fa', name: 'Persian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fo', name: 'Faroese' },
    { code: 'fr', name: 'French' },
    { code: 'gl', name: 'Galician' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ha', name: 'Hausa' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hr', name: 'Croatian' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'hy', name: 'Armenian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'jw', name: 'Javanese' },
    { code: 'ka', name: 'Georgian' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Khmer' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ko', name: 'Korean' },
    { code: 'la', name: 'Latin' },
    { code: 'lb', name: 'Luxembourgish' },
    { code: 'ln', name: 'Lingala' },
    { code: 'lo', name: 'Lao' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'mi', name: 'Maori' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ms', name: 'Malay' },
    { code: 'mt', name: 'Maltese' },
    { code: 'my', name: 'Myanmar' },
    { code: 'ne', name: 'Nepali' },
    { code: 'nl', name: 'Dutch' },
    { code: 'nn', name: 'Norwegian Nynorsk' },
    { code: 'no', name: 'Norwegian' },
    { code: 'oc', name: 'Occitan' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'pl', name: 'Polish' },
    { code: 'ps', name: 'Pashto' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'si', name: 'Sinhala' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'sn', name: 'Shona' },
    { code: 'so', name: 'Somali' },
    { code: 'sq', name: 'Albanian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sv', name: 'Swedish' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'tg', name: 'Tajik' },
    { code: 'th', name: 'Thai' },
    { code: 'tk', name: 'Turkmen' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'tr', name: 'Turkish' },
    { code: 'tt', name: 'Tatar' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'yi', name: 'Yiddish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'zh', name: 'Chinese' }
];

interface LanguageSelectorProps {
    value: string;
    onChange: (language: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function LanguageSelector({
    value,
    onChange,
    disabled = false,
    className = ''
}: LanguageSelectorProps) {
    const isRTL = RTL_LANGUAGES.includes(value);

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className={className}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
            >
                {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                        {language.name}
                    </option>
                ))}
            </select>
        </div>
    );
} 