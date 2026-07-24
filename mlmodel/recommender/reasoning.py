"""
Translated reasoning phrases for stock recommendations.

Provides localized explanations in English, Hindi, Gujarati, and Punjabi
for the fiduciary scoring engine's decisions.
"""

REASONING = {
    'en': {
        'conservative_low_beta': "This is a low-risk, steady stock — perfect for your safety-first approach.",
        'conservative_other': "A stable choice that balances safety with modest growth potential.",
        'aggressive_high_beta': "Strong growth potential — ideal for your high-growth strategy.",
        'aggressive_other': "A solid performer with room for upside, complementing your wealth-building approach.",
        'moderate': "A well-balanced stock offering steady growth without excessive risk.",
        'news_positive': "Recent news is positive, showing strong market confidence.",
        'news_cautious': "Some recent news is cautious, but the fundamentals remain solid.",
        'news_neutral': "Market news is currently stable with no major concerns.",
        'value_low': "Currently trading near its yearly low — could be a good entry point.",
        'value_high': "Trading near its yearly high, showing strong momentum.",
    },
    'hi': {
        'conservative_low_beta': "यह कम जोखिम वाला, स्थिर स्टॉक है — सुरक्षा-प्रथम दृष्टिकोण के लिए उत्तम।",
        'conservative_other': "एक स्थिर विकल्प जो सुरक्षा और मध्यम वृद्धि का संतुलन करता है।",
        'aggressive_high_beta': "मजबूत वृद्धि क्षमता — आपकी उच्च-वृद्धि रणनीति के लिए आदर्श।",
        'aggressive_other': "ऊपर की ओर जाने की गुंजाइश के साथ एक ठोस प्रदर्शनकर्ता।",
        'moderate': "अत्यधिक जोखिम के बिना स्थिर वृद्धि प्रदान करने वाला संतुलित स्टॉक।",
        'news_positive': "हालिया समाचार सकारात्मक हैं, बाजार में मजबूत विश्वास दिखा रहे हैं।",
        'news_cautious': "कुछ समाचार सतर्क हैं, लेकिन बुनियादी बातें मजबूत हैं।",
        'news_neutral': "बाजार समाचार वर्तमान में स्थिर हैं।",
        'value_low': "अपने वार्षिक निचले स्तर के पास कारोबार कर रहा है — अच्छा प्रवेश बिंदु हो सकता है।",
        'value_high': "वार्षिक उच्च स्तर के पास, मजबूत गति दिखा रहा है।",
    },
    'gu': {
        'conservative_low_beta': "આ ઓછા જોખમવાળો, સ્થિર સ્ટોક છે — સુરક્ષા-પ્રથમ અભિગમ માટે ઉત્તમ.",
        'conservative_other': "એક સ્થિર પસંદગી જે સુરક્ષા અને મધ્યમ વૃદ્ધિનું સંતુલન કરે છે.",
        'aggressive_high_beta': "મજબૂત વૃદ્ધિ ક્ષમતા — તમારી ઉચ્ચ-વૃદ્ધિ વ્યૂહરચના માટે આદર્શ.",
        'aggressive_other': "ઉપરની તરફ જવાની ગુંજાઈશ સાથે એક ઠોસ કામગીરી.",
        'moderate': "વધુ પડતા જોખમ વિના સ્થિર વૃદ્ધિ આપતો સંતુલિત સ્ટોક.",
        'news_positive': "તાજેતરના સમાચાર સકારાત્મક છે.",
        'news_cautious': "કેટલાક સમાચાર સાવચેત છે, પરંતુ મૂળભૂત બાબતો મજબૂત છે.",
        'news_neutral': "બજારના સમાચાર હાલમાં સ્થિર છે.",
        'value_low': "તેના વાર્ષિક નીચલા સ્તર પાસે — સારો પ્રવેશ બિંદુ હોઈ શકે.",
        'value_high': "વાર્ષિક ઉચ્ચ સ્તર પાસે, મજબૂત ગતિ દર્શાવે છે.",
    },
    'pa': {
        'conservative_low_beta': "ਇਹ ਘੱਟ ਜੋਖਮ ਵਾਲਾ, ਸਥਿਰ ਸਟਾਕ ਹੈ — ਸੁਰੱਖਿਆ-ਪਹਿਲਾਂ ਪਹੁੰਚ ਲਈ ਸੰਪੂਰਨ.",
        'conservative_other': "ਇੱਕ ਸਥਿਰ ਚੋਣ ਜੋ ਸੁਰੱਖਿਆ ਅਤੇ ਮੱਧਮ ਵਿਕਾਸ ਦਾ ਸੰਤੁਲਨ ਕਰਦੀ ਹੈ.",
        'aggressive_high_beta': "ਮਜ਼ਬੂਤ ​​ਵਿਕਾਸ ਸੰਭਾਵਨਾ — ਤੁਹਾਡੀ ਉੱਚ-ਵਿਕਾਸ ਰਣਨੀਤੀ ਲਈ ਆਦਰਸ਼.",
        'aggressive_other': "ਉੱਪਰ ਵੱਲ ਜਾਣ ਦੀ ਗੁੰਜਾਇਸ਼ ਵਾਲਾ ਇੱਕ ਠੋਸ ਪ੍ਰਦਰਸ਼ਨਕਾਰ.",
        'moderate': "ਬਹੁਤ ਜ਼ਿਆਦਾ ਜੋਖਮ ਤੋਂ ਬਿਨਾਂ ਸਥਿਰ ਵਿਕਾਸ ਪੇਸ਼ ਕਰਨ ਵਾਲਾ ਸੰਤੁਲਿਤ ਸਟਾਕ.",
        'news_positive': "ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ ਸਕਾਰਾਤਮਕ ਹਨ.",
        'news_cautious': "ਕੁਝ ਖ਼ਬਰਾਂ ਸਾਵਧਾਨ ਹਨ, ਪਰ ਬੁਨਿਆਦ ਮਜ਼ਬੂਤ ​​ਹੈ.",
        'news_neutral': "ਮਾਰਕੀਟ ਖ਼ਬਰਾਂ ਹਾਲ ਹੀ ਵਿੱਚ ਸਥਿਰ ਹਨ.",
        'value_low': "ਆਪਣੇ ਸਾਲਾਨਾ ਹੇਠਲੇ ਪੱਧਰ ਦੇ ਨੇੜੇ — ਚੰਗਾ ਦਾਖ਼ਲਾ ਬਿੰਦੂ ਹੋ ਸਕਦਾ ਹੈ.",
        'value_high': "ਸਾਲਾਨਾ ਉੱਚ ਪੱਧਰ ਦੇ ਨੇੜੇ, ਮਜ਼ਬੂਤ ​​ਗਤੀ ਦਿਖਾ ਰਿਹਾ ਹੈ.",
    },
}
