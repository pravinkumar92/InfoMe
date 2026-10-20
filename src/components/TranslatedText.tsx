"use client";
import { useState, useEffect } from "react";

interface TranslatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const translations: Record<string, Record<string, string>> = {
  // Dashboard labels
  "Overview": { hi: "अवलोकन", ur: "جائزہ", bn: "সংক্ষিপ্ত বিবরণ" },
  "Live Scraping": { hi: "लाइव स्क्रैपिंग", ur: "لائیو سکریپنگ", bn: "লাইভ স্ক্র্যাপিং" },
  "Calendar": { hi: "कैलेंडर", ur: "کیلنڈر", bn: "ক্যালেন্ডার" },
  "Smart Search": { hi: "स्मार्ट खोज", ur: "سمارٹ تلاش", bn: "স্মার্ট অনুসন্ধান" },
  "Notices": { hi: "सूचनाएं", ur: "نوٹس", bn: "বিজ্ঞপ্তি" },
  "Deadlines": { hi: "समय सीमा", ur: "آخری تاریخ", bn: "সময়সীমা" },
  "Alerts": { hi: "अलर्ट", ur: "الرٹ", bn: "সতর্কতা" },
  "Saved": { hi: "सहेजा गया", ur: "محفوظ", bn: "সংরক্ষিত" },
  "AI Assistant": { hi: "एआई सहायक", ur: "AI اسسٹنٹ", bn: "এআই সহায়ক" },
  "Analytics": { hi: "विश्लेषण", ur: "تجزیات", bn: "বিশ্লেষণ" },
  "Admin Panel": { hi: "व्यवस्थापक पैनल", ur: "ایڈمن پینل", bn: "অ্যাডমিন প্যানেল" },
  "Settings": { hi: "सेटिंग्स", ur: "ترتیبات", bn: "সেটিংস" },
  
  // Common words
  "Search": { hi: "खोजें", ur: "تلاش کریں", bn: "অনুসন্ধান করুন" },
  "Upload": { hi: "अपलोड करें", ur: "اپ لوڈ کریں", bn: "আপলোড করুন" },
  "Download": { hi: "डाउनलोड करें", ur: "ڈاؤن لوڈ کریں", bn: "ডাউনলোড করুন" },
  "Save": { hi: "सहेजें", ur: "محفوظ کریں", bn: "সংরক্ষণ করুন" },
  "Cancel": { hi: "रद्द करें", ur: "منسوخ کریں", bn: "বাতিল করুন" },
  "Delete": { hi: "हटाएं", ur: "حذف کریں", bn: "মুছুন" },
  "Edit": { hi: "संपादित करें", ur: "ترمیم کریں", bn: "সম্পাদনা করুন" },
  "View": { hi: "देखें", ur: "دیکھیں", bn: "দেখুন" },
  "Close": { hi: "बंद करें", ur: "بند کریں", bn: "বন্ধ করুন" },
  "Submit": { hi: "जमा करें", ur: "جمع کرائیں", bn: "জমা দিন" },
  
  // Calendar
  "Add Event": { hi: "इवेंट जोड़ें", ur: "ایونٹ شامل کریں", bn: "ইভেন্ট যোগ করুন" },
  "Today's Deadlines": { hi: "आज की समय सीमा", ur: "آج کی آخری تاریخیں", bn: "আজকের সময়সীমা" },
  "Upcoming Events": { hi: "आगामी कार्यक्रम", ur: "آنے والے واقعات", bn: "আসন্ন ইভেন্ট" },
  
  // AI Assistant
  "Ask me anything": { hi: "मुझसे कुछ भी पूछें", ur: "مجھ سے کچھ بھی پوچھیں", bn: "আমাকে যেকোনো কিছু জিজ্ঞাসা করুন" },
  "Send": { hi: "भेजें", ur: "بھیجیں", bn: "পাঠান" },
  "Clear": { hi: "साफ़ करें", ur: "صاف کریں", bn: "পরিষ্কার করুন" },
  "Export": { hi: "निर्यात करें", ur: "برآمد کریں", bn: "রপ্তানি করুন" }
};

export default function TranslatedText({ text, className, style }: TranslatedTextProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    // Get saved language
    const savedLang = localStorage.getItem("preferred_language") || "en";
    setCurrentLanguage(savedLang);
    updateTranslation(text, savedLang);

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail.language;
      setCurrentLanguage(newLang);
      updateTranslation(text, newLang);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [text]);

  const updateTranslation = (originalText: string, language: string) => {
    if (language === "en") {
      setTranslatedText(originalText);
      return;
    }

    // Check if we have a translation
    if (translations[originalText] && translations[originalText][language]) {
      setTranslatedText(translations[originalText][language]);
    } else {
      // Keep original if no translation available
      setTranslatedText(originalText);
    }
  };

  return <span className={className} style={style}>{translatedText}</span>;
}
