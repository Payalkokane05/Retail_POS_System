import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
];

const resources = {
  en: { translation: {
    nav: { dashboard: "Dashboard", products: "Products", customers: "Customers", bills: "Bills", operations: "Retail Operations", retailPos: "Retail POS", account: "Account", signedInAs: "Signed in as", logout: "Logout", chooseLanguage: "Choose language", clearChat: "Clear chat", clearChatConfirm: "Clear the chat and locally saved bills?", openMenu: "Open navigation menu" },
    common: { add: "Add", edit: "Edit", delete: "Delete", save: "Save Changes", cancel: "Cancel", close: "Close", loading: "Loading...", name: "Name", phone: "Phone", customer: "Customer", price: "Price", unit: "Unit", search: "Search", saved: "Saved", notSaved: "Not Saved", item: "Item", quantity: "Quantity", amount: "Amount", total: "Total", noRecords: "No records found", saveFailed: "Failed to save.", deleteConfirm: "Delete this record?" },
    auth: { loginTitle: "Smart Retail POS", loginSubtitle: "Sign in to continue", shopName: "Shop Name", email: "Email", password: "Password", enterShopName: "Enter your shop name", enterEmail: "Enter email", enterPassword: "Enter password", login: "Login", noAccount: "Don't have an account?", register: "Register", createAccount: "Create Account", registerSubtitle: "Create your Retail POS account", userName: "User Name", enterName: "Enter your name", createPassword: "Create password", hasAccount: "Already have an account?", registrationSuccess: "Registration successful! Please login.", fillAll: "Please fill all fields.", connectionError: "Could not reach the server. Please try again." },
    products: { title: "Products", subtitle: "Manage products used for billing.", addProduct: "Add Product", editProduct: "Edit Product", productName: "Product Name", exampleRice: "e.g. Rice", examplePrice: "e.g. 65", saveChanges: "Save Changes", noProducts: "No Products Added", firstProduct: "Add your first product to get started.", deleteProductConfirm: "Delete product \"{{name}}\"?" },
    customers: { title: "Customers", subtitle: "Customer records created from your billing conversations", search: "Search customer...", noCustomers: "No customer records found", noCustomersDesc: "Add a customer, or generate a bill from the Dashboard.", purchases: "Purchases", totalSpent: "Total Spent", bills: "Bills", lastPurchase: "Last Purchase", viewDetails: "View Details", customerDetails: "Customer Details", purchaseHistory: "Purchase History", invoice: "Invoice", noHistory: "No purchase history.", addCustomer: "Add Customer", editCustomer: "Edit Customer", enterName: "Enter customer name", enterPhone: "Enter phone number", namePhoneRequired: "Please enter customer name and phone number.", deleteConfirm: "Delete this customer?", unknownCustomer: "Unknown Customer" },
    bills: { title: "Bills", subtitle: "All saved bills from the database.", noBills: "No bills saved yet", editBill: "Edit Bill", walkIn: "Walk-in Customer", mustHaveItem: "A bill must contain at least one item." },
    dashboard: { welcome: "Welcome to {{shopName}}!", purchaseHistory: "Purchase history", bill: "Bill", billTotal: "Bill total", bills: "Bills", totalSpent: "Total spent", noPurchases: "No purchases found for this period.", shopSales: "Shop sales", totalSales: "Total sales", averageBill: "Average bill", dateUnavailable: "Date unavailable", send: "Send", uploadImage: "Upload image", imageAttached: "Image attached", removeImage: "Remove image", voiceCommand: "Voice command", stopListening: "Stop listening", example: "Example: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "Example: Rahul 2 kg Rice", readImage: "Reading the image...", imageReadFailed: "Sorry, I couldn't read that image. Please try again or type the items instead.", noImageItems: "I couldn't find any items in that image. Please try a clearer photo, or type the items.", voiceUnsupported: "Voice recognition is not supported in this browser. Please use Google Chrome.", voiceError: "Voice recognition error. Please try again.", pleaseAddItem: "Please add at least one item before saving.", savedLocally: "Warning: bill saved locally but failed to save to the database.", billCopied: "Bill copied.", customerRequired: "Please enter customer name.", itemQuantityRequired: "Please enter item and quantity.", quantityPositive: "Quantity must be greater than 0.", billNotFound: "Bill not found for {{customer}}.", itemNotFound: "Product not found.", itemAdded: "Item added successfully. Click Save to save the bill.", billNeedsItem: "Bill must contain at least one item.", billSaved: "Bill for {{customer}} saved successfully.", imagePreview: "Image preview" },
  } },
  hi: { translation: {
    nav: { dashboard: "डैशबोर्ड", products: "उत्पाद", customers: "ग्राहक", bills: "बिल", operations: "रिटेल संचालन", retailPos: "रिटेल POS", account: "खाता", signedInAs: "लॉग इन हैं", logout: "लॉग आउट", chooseLanguage: "भाषा चुनें", clearChat: "चैट साफ़ करें", clearChatConfirm: "चैट और स्थानीय रूप से सहेजे गए बिल हटाएँ?", openMenu: "नेविगेशन मेनू खोलें" },
    common: { add: "जोड़ें", edit: "संपादित करें", delete: "हटाएँ", save: "बदलाव सहेजें", cancel: "रद्द करें", close: "बंद करें", loading: "लोड हो रहा है...", name: "नाम", phone: "फ़ोन", customer: "ग्राहक", price: "कीमत", unit: "इकाई", search: "खोजें", saved: "सहेजा गया", notSaved: "सहेजा नहीं गया", item: "आइटम", quantity: "मात्रा", amount: "राशि", total: "कुल", noRecords: "कोई रिकॉर्ड नहीं मिला", saveFailed: "सहेजना विफल हुआ।", deleteConfirm: "यह रिकॉर्ड हटाएँ?" },
    auth: { loginTitle: "स्मार्ट रिटेल POS", loginSubtitle: "जारी रखने के लिए लॉग इन करें", shopName: "दुकान का नाम", email: "ईमेल", password: "पासवर्ड", enterShopName: "दुकान का नाम लिखें", enterEmail: "ईमेल लिखें", enterPassword: "पासवर्ड लिखें", login: "लॉग इन", noAccount: "खाता नहीं है?", register: "रजिस्टर करें", createAccount: "खाता बनाएँ", registerSubtitle: "अपना रिटेल POS खाता बनाएँ", userName: "उपयोगकर्ता का नाम", enterName: "अपना नाम लिखें", createPassword: "पासवर्ड बनाएँ", hasAccount: "पहले से खाता है?", registrationSuccess: "रजिस्ट्रेशन सफल हुआ! कृपया लॉग इन करें।", fillAll: "कृपया सभी फ़ील्ड भरें।", connectionError: "सर्वर से संपर्क नहीं हो पाया। फिर से प्रयास करें।" },
    products: { title: "उत्पाद", subtitle: "बिलिंग में उपयोग होने वाले उत्पादों का प्रबंधन करें।", addProduct: "उत्पाद जोड़ें", editProduct: "उत्पाद संपादित करें", productName: "उत्पाद का नाम", exampleRice: "जैसे चावल", examplePrice: "जैसे 65", saveChanges: "बदलाव सहेजें", noProducts: "अभी कोई उत्पाद नहीं", firstProduct: "शुरू करने के लिए पहला उत्पाद जोड़ें।", deleteProductConfirm: "उत्पाद \"{{name}}\" हटाएँ?" },
    customers: { title: "ग्राहक", subtitle: "आपकी बिलिंग बातचीत से बनाई गई ग्राहक जानकारी", search: "ग्राहक खोजें...", noCustomers: "ग्राहक रिकॉर्ड उपलब्ध नहीं है", noCustomersDesc: "ग्राहक जोड़ें या डैशबोर्ड से बिल बनाएँ।", purchases: "खरीदारी", totalSpent: "कुल खर्च", bills: "बिल", lastPurchase: "आखिरी खरीदारी", viewDetails: "विवरण देखें", customerDetails: "ग्राहक की जानकारी", purchaseHistory: "खरीदारी इतिहास", invoice: "बिल नंबर", noHistory: "खरीदारी इतिहास उपलब्ध नहीं है।", addCustomer: "ग्राहक जोड़ें", editCustomer: "ग्राहक संपादित करें", enterName: "ग्राहक का नाम लिखें", enterPhone: "फ़ोन नंबर लिखें", namePhoneRequired: "ग्राहक का नाम और फ़ोन नंबर लिखें।", deleteConfirm: "यह ग्राहक हटाएँ?", unknownCustomer: "अज्ञात ग्राहक" },
    bills: { title: "बिल", subtitle: "डेटाबेस में सहेजे गए सभी बिल।", noBills: "अभी कोई बिल सहेजा नहीं गया", editBill: "बिल संपादित करें", walkIn: "सामान्य ग्राहक", mustHaveItem: "बिल में कम से कम एक आइटम होना चाहिए।" },
    dashboard: { welcome: "{{shopName}} में आपका स्वागत है!", purchaseHistory: "खरीदारी इतिहास", bill: "बिल", billTotal: "बिल का कुल", bills: "बिल", totalSpent: "कुल खर्च", noPurchases: "इस अवधि में कोई खरीदारी नहीं मिली।", shopSales: "दुकान की बिक्री", totalSales: "कुल बिक्री", averageBill: "औसत बिल", dateUnavailable: "तारीख उपलब्ध नहीं", send: "भेजें", uploadImage: "तस्वीर अपलोड करें", imageAttached: "तस्वीर जोड़ी गई", removeImage: "तस्वीर हटाएँ", voiceCommand: "आवाज़ से बोलें", stopListening: "सुनना बंद करें", example: "उदाहरण: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "उदाहरण: Rahul 2 kg Rice", readImage: "तस्वीर पढ़ी जा रही है...", imageReadFailed: "तस्वीर पढ़ी नहीं जा सकी। फिर से प्रयास करें या आइटम लिखें।", noImageItems: "तस्वीर में कोई आइटम नहीं मिला। साफ़ तस्वीर लें या आइटम लिखें।", voiceUnsupported: "इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। Google Chrome उपयोग करें।", voiceError: "आवाज़ पहचान में त्रुटि हुई। फिर से प्रयास करें।", pleaseAddItem: "सहेजने से पहले कम से कम एक आइटम जोड़ें।", savedLocally: "चेतावनी: बिल स्थानीय रूप से सहेजा गया, लेकिन डेटाबेस में नहीं सहेजा जा सका।", billCopied: "बिल कॉपी किया गया।", customerRequired: "कृपया ग्राहक का नाम लिखें।", itemQuantityRequired: "कृपया आइटम और मात्रा लिखें।", quantityPositive: "मात्रा शून्य से अधिक होनी चाहिए।", billNotFound: "{{customer}} का बिल नहीं मिला।", itemNotFound: "उत्पाद नहीं मिला।", itemAdded: "आइटम जोड़ा गया। बिल सहेजने के लिए Save दबाएँ।", billNeedsItem: "बिल में कम से कम एक आइटम होना चाहिए।", billSaved: "{{customer}} का बिल सफलतापूर्वक सहेजा गया।", imagePreview: "तस्वीर का पूर्वावलोकन" },
  } },
  mr: { translation: {
    nav: { dashboard: "डॅशबोर्ड", products: "उत्पादने", customers: "ग्राहक", bills: "बिले", operations: "रिटेल ऑपरेशन्स", retailPos: "रिटेल POS", account: "खाते", signedInAs: "या नावाने लॉग इन", logout: "लॉग आउट", chooseLanguage: "भाषा निवडा", clearChat: "चॅट साफ करा", clearChatConfirm: "चॅट आणि स्थानिकरीत्या जतन केलेली बिले हटवायची?", openMenu: "नेव्हिगेशन मेनू उघडा" },
    common: { add: "जोडा", edit: "संपादित करा", delete: "हटवा", save: "बदल जतन करा", cancel: "रद्द करा", close: "बंद करा", loading: "लोड होत आहे...", name: "नाव", phone: "फोन", customer: "ग्राहक", price: "किंमत", unit: "एकक", search: "शोधा", saved: "जतन केले", notSaved: "जतन केले नाही", item: "वस्तू", quantity: "प्रमाण", amount: "रक्कम", total: "एकूण", noRecords: "कोणतीही नोंद आढळली नाही", saveFailed: "जतन करता आले नाही.", deleteConfirm: "ही नोंद हटवायची?" },
    auth: { loginTitle: "स्मार्ट रिटेल POS", loginSubtitle: "पुढे जाण्यासाठी लॉग इन करा", shopName: "दुकानाचे नाव", email: "ईमेल", password: "पासवर्ड", enterShopName: "दुकानाचे नाव लिहा", enterEmail: "ईमेल लिहा", enterPassword: "पासवर्ड लिहा", login: "लॉग इन", noAccount: "खाते नाही?", register: "नोंदणी करा", createAccount: "खाते तयार करा", registerSubtitle: "तुमचे रिटेल POS खाते तयार करा", userName: "वापरकर्त्याचे नाव", enterName: "तुमचे नाव लिहा", createPassword: "पासवर्ड तयार करा", hasAccount: "आधीच खाते आहे?", registrationSuccess: "नोंदणी यशस्वी! कृपया लॉग इन करा.", fillAll: "कृपया सर्व माहिती भरा.", connectionError: "सर्व्हरशी संपर्क झाला नाही. पुन्हा प्रयत्न करा." },
    products: { title: "उत्पादने", subtitle: "बिलिंगसाठी वापरल्या जाणाऱ्या उत्पादनांचे व्यवस्थापन करा.", addProduct: "उत्पादन जोडा", editProduct: "उत्पादन संपादित करा", productName: "उत्पादनाचे नाव", exampleRice: "उदा. तांदूळ", examplePrice: "उदा. ६५", saveChanges: "बदल जतन करा", noProducts: "अद्याप उत्पादने नाहीत", firstProduct: "सुरू करण्यासाठी पहिले उत्पादन जोडा.", deleteProductConfirm: "\"{{name}}\" उत्पादन हटवायचे?" },
    customers: { title: "ग्राहक", subtitle: "तुमच्या बिलिंग संभाषणातून तयार झालेली ग्राहक माहिती", search: "ग्राहक शोधा...", noCustomers: "ग्राहकांची माहिती उपलब्ध नाही", noCustomersDesc: "ग्राहक जोडा किंवा डॅशबोर्डमधून बिल तयार करा.", purchases: "खरेदी", totalSpent: "एकूण खर्च", bills: "बिले", lastPurchase: "शेवटची खरेदी", viewDetails: "माहिती पहा", customerDetails: "ग्राहकाची माहिती", purchaseHistory: "खरेदी इतिहास", invoice: "बिल क्रमांक", noHistory: "खरेदी इतिहास उपलब्ध नाही.", addCustomer: "ग्राहक जोडा", editCustomer: "ग्राहक संपादित करा", enterName: "ग्राहकाचे नाव लिहा", enterPhone: "फोन नंबर लिहा", namePhoneRequired: "कृपया ग्राहकाचे नाव आणि फोन नंबर लिहा.", deleteConfirm: "हा ग्राहक हटवायचा?", unknownCustomer: "अनोळखी ग्राहक" },
    bills: { title: "बिले", subtitle: "डेटाबेसमध्ये जतन केलेली सर्व बिले.", noBills: "अद्याप कोणतेही बिल जतन केलेले नाही", editBill: "बिल संपादित करा", walkIn: "सामान्य ग्राहक", mustHaveItem: "बिलामध्ये किमान एक वस्तू असणे आवश्यक आहे." },
    dashboard: { welcome: "{{shopName}} मध्ये आपले स्वागत आहे!", purchaseHistory: "खरेदी इतिहास", bill: "बिल", billTotal: "बिलाची एकूण रक्कम", bills: "बिले", totalSpent: "एकूण खर्च", noPurchases: "या कालावधीत खरेदी आढळली नाही.", shopSales: "दुकानाची विक्री", totalSales: "एकूण विक्री", averageBill: "सरासरी बिल", dateUnavailable: "तारीख उपलब्ध नाही", send: "पाठवा", uploadImage: "प्रतिमा अपलोड करा", imageAttached: "प्रतिमा जोडली", removeImage: "प्रतिमा काढा", voiceCommand: "आवाज आदेश", stopListening: "ऐकणे थांबवा", example: "उदा.: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "उदा. Rahul 2 kg Rice", readImage: "प्रतिमा वाचत आहे...", imageReadFailed: "प्रतिमा वाचता आली नाही. पुन्हा प्रयत्न करा किंवा वस्तू टाइप करा.", noImageItems: "प्रतिमेत वस्तू सापडल्या नाहीत. स्पष्ट फोटो वापरा किंवा वस्तू टाइप करा.", voiceUnsupported: "या ब्राउझरमध्ये आवाज ओळख उपलब्ध नाही. Google Chrome वापरा.", voiceError: "आवाज ओळखण्यात त्रुटी. पुन्हा प्रयत्न करा.", pleaseAddItem: "जतन करण्यापूर्वी किमान एक वस्तू जोडा.", savedLocally: "सूचना: बिल स्थानिकरीत्या जतन झाले, पण डेटाबेसमध्ये जतन झाले नाही.", billCopied: "बिल कॉपी केले.", customerRequired: "कृपया ग्राहकाचे नाव लिहा.", itemQuantityRequired: "कृपया वस्तू आणि प्रमाण लिहा.", quantityPositive: "प्रमाण शून्यापेक्षा जास्त असावे.", billNotFound: "{{customer}} यांचे बिल आढळले नाही.", itemNotFound: "उत्पादन आढळले नाही.", itemAdded: "वस्तू जोडली. बिल जतन करण्यासाठी Save दाबा.", billNeedsItem: "बिलामध्ये किमान एक वस्तू असणे आवश्यक आहे.", billSaved: "{{customer}} यांचे बिल जतन झाले.", imagePreview: "प्रतिमा पूर्वावलोकन" },
  } },
  ta: { translation: {
    nav: { dashboard: "டாஷ்போர்டு", products: "பொருட்கள்", customers: "வாடிக்கையாளர்கள்", bills: "பில்கள்", operations: "சில்லறை செயல்பாடுகள்", retailPos: "சில்லறை POS", account: "கணக்கு", signedInAs: "உள்நுழைந்தவர்", logout: "வெளியேறு", chooseLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்", clearChat: "உரையாடலை அழிக்கவும்", clearChatConfirm: "உரையாடலையும் உள்ளூரில் சேமித்த பில்களையும் அழிக்கவா?", openMenu: "வழிசெலுத்தல் பட்டியைத் திற" },
    common: { add: "சேர்", edit: "திருத்து", delete: "நீக்கு", save: "மாற்றங்களைச் சேமி", cancel: "ரத்து", close: "மூடு", loading: "ஏற்றுகிறது...", name: "பெயர்", phone: "தொலைபேசி", customer: "வாடிக்கையாளர்", price: "விலை", unit: "அலகு", search: "தேடு", saved: "சேமிக்கப்பட்டது", notSaved: "சேமிக்கப்படவில்லை", item: "பொருள்", quantity: "அளவு", amount: "தொகை", total: "மொத்தம்", noRecords: "பதிவுகள் இல்லை", saveFailed: "சேமிக்க முடியவில்லை.", deleteConfirm: "இந்த பதிவை நீக்கவா?" },
    auth: { loginTitle: "ஸ்மார்ட் சில்லறை POS", loginSubtitle: "தொடர உள்நுழையவும்", shopName: "கடை பெயர்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்", enterShopName: "கடை பெயரை உள்ளிடவும்", enterEmail: "மின்னஞ்சலை உள்ளிடவும்", enterPassword: "கடவுச்சொல்லை உள்ளிடவும்", login: "உள்நுழை", noAccount: "கணக்கு இல்லையா?", register: "பதிவு செய்க", createAccount: "கணக்கை உருவாக்கு", registerSubtitle: "சில்லறை POS கணக்கை உருவாக்கவும்", userName: "பயனர் பெயர்", enterName: "உங்கள் பெயரை உள்ளிடவும்", createPassword: "கடவுச்சொல்லை உருவாக்கவும்", hasAccount: "ஏற்கனவே கணக்கு உள்ளதா?", registrationSuccess: "பதிவு வெற்றி! உள்நுழையவும்.", fillAll: "அனைத்து புலங்களையும் நிரப்பவும்.", connectionError: "சேவையகத்தை அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்." },
    products: { title: "பொருட்கள்", subtitle: "பில்லிங்கிற்குப் பயன்படுத்தும் பொருட்களை நிர்வகிக்கவும்.", addProduct: "பொருளைச் சேர்", editProduct: "பொருளைத் திருத்து", productName: "பொருள் பெயர்", exampleRice: "எ.கா. அரிசி", examplePrice: "எ.கா. 65", saveChanges: "மாற்றங்களைச் சேமி", noProducts: "பொருட்கள் இன்னும் சேர்க்கப்படவில்லை", firstProduct: "தொடங்க முதல் பொருளைச் சேர்க்கவும்.", deleteProductConfirm: "\"{{name}}\" பொருளை நீக்கவா?" },
    customers: { title: "வாடிக்கையாளர்கள்", subtitle: "பில்லிங் உரையாடல்களில் உருவாக்கப்பட்ட வாடிக்கையாளர் பதிவுகள்", search: "வாடிக்கையாளரைத் தேடு...", noCustomers: "வாடிக்கையாளர் பதிவுகள் இல்லை", noCustomersDesc: "வாடிக்கையாளரைச் சேர்க்கவும் அல்லது டாஷ்போர்டில் பில் உருவாக்கவும்.", purchases: "கொள்முதல்கள்", totalSpent: "மொத்தச் செலவு", bills: "பில்கள்", lastPurchase: "கடைசி கொள்முதல்", viewDetails: "விவரங்களைக் காண்க", customerDetails: "வாடிக்கையாளர் விவரங்கள்", purchaseHistory: "கொள்முதல் வரலாறு", invoice: "விலைப்பட்டியல்", noHistory: "கொள்முதல் வரலாறு இல்லை.", addCustomer: "வாடிக்கையாளரைச் சேர்", editCustomer: "வாடிக்கையாளரைத் திருத்து", enterName: "வாடிக்கையாளர் பெயரை உள்ளிடவும்", enterPhone: "தொலைபேசி எண்ணை உள்ளிடவும்", namePhoneRequired: "வாடிக்கையாளர் பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும்.", deleteConfirm: "இந்த வாடிக்கையாளரை நீக்கவா?", unknownCustomer: "தெரியாத வாடிக்கையாளர்" },
    bills: { title: "பில்கள்", subtitle: "தரவுத்தளத்தில் சேமிக்கப்பட்ட அனைத்து பில்களும்.", noBills: "பில்கள் இன்னும் சேமிக்கப்படவில்லை", editBill: "பில்லைத் திருத்து", walkIn: "நேரடி வாடிக்கையாளர்", mustHaveItem: "ஒரு பில்லில் குறைந்தது ஒரு பொருள் இருக்க வேண்டும்." },
    dashboard: { welcome: "{{shopName}}-க்கு வரவேற்கிறோம்!", purchaseHistory: "கொள்முதல் வரலாறு", bill: "பில்", billTotal: "பில் மொத்தம்", bills: "பில்கள்", totalSpent: "மொத்தச் செலவு", noPurchases: "இந்த காலத்தில் கொள்முதல்கள் இல்லை.", shopSales: "கடை விற்பனை", totalSales: "மொத்த விற்பனை", averageBill: "சராசரி பில்", dateUnavailable: "தேதி இல்லை", send: "அனுப்பு", uploadImage: "படத்தைப் பதிவேற்று", imageAttached: "படம் இணைக்கப்பட்டது", removeImage: "படத்தை அகற்று", voiceCommand: "குரல் கட்டளை", stopListening: "கேட்பதை நிறுத்து", example: "எடுத்துக்காட்டு: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "எ.கா. Rahul 2 kg Rice", readImage: "படத்தைப் படிக்கிறது...", imageReadFailed: "படத்தைப் படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது பொருட்களை உள்ளிடவும்.", noImageItems: "படத்தில் பொருட்கள் இல்லை. தெளிவான படத்தைப் பயன்படுத்தவும் அல்லது உள்ளிடவும்.", voiceUnsupported: "இந்த உலாவியில் குரல் அடையாளம் காணுதல் இல்லை. Google Chrome பயன்படுத்தவும்.", voiceError: "குரல் அடையாளப் பிழை. மீண்டும் முயற்சிக்கவும்.", pleaseAddItem: "சேமிக்கும் முன் குறைந்தது ஒரு பொருளைச் சேர்க்கவும்.", savedLocally: "எச்சரிக்கை: பில் உள்ளூரில் சேமிக்கப்பட்டது; தரவுத்தளத்தில் சேமிக்கப்படவில்லை.", billCopied: "பில் நகலெடுக்கப்பட்டது.", customerRequired: "வாடிக்கையாளர் பெயரை உள்ளிடவும்.", itemQuantityRequired: "பொருளையும் அளவையும் உள்ளிடவும்.", quantityPositive: "அளவு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.", billNotFound: "{{customer}}-க்கான பில் இல்லை.", itemNotFound: "பொருள் இல்லை.", itemAdded: "பொருள் சேர்க்கப்பட்டது. பில்லைச் சேமிக்க Save அழுத்தவும்.", billNeedsItem: "ஒரு பில்லில் குறைந்தது ஒரு பொருள் இருக்க வேண்டும்.", billSaved: "{{customer}}-க்கான பில் சேமிக்கப்பட்டது.", imagePreview: "பட முன்னோட்டம்" },
  } },
  bn: { translation: {
    nav: { dashboard: "ড্যাশবোর্ড", products: "পণ্য", customers: "গ্রাহক", bills: "বিল", operations: "রিটেল পরিচালনা", retailPos: "রিটেল POS", account: "অ্যাকাউন্ট", signedInAs: "লগ ইন করেছেন", logout: "লগ আউট", chooseLanguage: "ভাষা বেছে নিন", clearChat: "চ্যাট মুছুন", clearChatConfirm: "চ্যাট ও স্থানীয়ভাবে সংরক্ষিত বিল মুছবেন?", openMenu: "নেভিগেশন মেনু খুলুন" },
    common: { add: "যোগ করুন", edit: "সম্পাদনা", delete: "মুছুন", save: "পরিবর্তন সংরক্ষণ", cancel: "বাতিল", close: "বন্ধ", loading: "লোড হচ্ছে...", name: "নাম", phone: "ফোন", customer: "গ্রাহক", price: "দাম", unit: "একক", search: "খুঁজুন", saved: "সংরক্ষিত", notSaved: "সংরক্ষিত নয়", item: "পণ্য", quantity: "পরিমাণ", amount: "টাকা", total: "মোট", noRecords: "কোনো রেকর্ড পাওয়া যায়নি", saveFailed: "সংরক্ষণ করা যায়নি।", deleteConfirm: "এই রেকর্ড মুছবেন?" },
    auth: { loginTitle: "স্মার্ট রিটেল POS", loginSubtitle: "চালিয়ে যেতে লগ ইন করুন", shopName: "দোকানের নাম", email: "ইমেল", password: "পাসওয়ার্ড", enterShopName: "দোকানের নাম লিখুন", enterEmail: "ইমেল লিখুন", enterPassword: "পাসওয়ার্ড লিখুন", login: "লগ ইন", noAccount: "অ্যাকাউন্ট নেই?", register: "নিবন্ধন করুন", createAccount: "অ্যাকাউন্ট তৈরি করুন", registerSubtitle: "আপনার রিটেল POS অ্যাকাউন্ট তৈরি করুন", userName: "ব্যবহারকারীর নাম", enterName: "আপনার নাম লিখুন", createPassword: "পাসওয়ার্ড তৈরি করুন", hasAccount: "আগে থেকেই অ্যাকাউন্ট আছে?", registrationSuccess: "নিবন্ধন সফল! লগ ইন করুন।", fillAll: "সব ঘর পূরণ করুন।", connectionError: "সার্ভারে সংযোগ করা যায়নি। আবার চেষ্টা করুন।" },
    products: { title: "পণ্য", subtitle: "বিলিংয়ে ব্যবহৃত পণ্য পরিচালনা করুন।", addProduct: "পণ্য যোগ করুন", editProduct: "পণ্য সম্পাদনা", productName: "পণ্যের নাম", exampleRice: "যেমন চাল", examplePrice: "যেমন ৬৫", saveChanges: "পরিবর্তন সংরক্ষণ", noProducts: "এখনও কোনো পণ্য যোগ করা হয়নি", firstProduct: "শুরু করতে প্রথম পণ্য যোগ করুন।", deleteProductConfirm: "\"{{name}}\" পণ্যটি মুছবেন?" },
    customers: { title: "গ্রাহক", subtitle: "আপনার বিলিং কথোপকথন থেকে তৈরি গ্রাহকের তথ্য", search: "গ্রাহক খুঁজুন...", noCustomers: "কোনো গ্রাহকের তথ্য নেই", noCustomersDesc: "গ্রাহক যোগ করুন বা ড্যাশবোর্ড থেকে বিল তৈরি করুন।", purchases: "কেনাকাটা", totalSpent: "মোট খরচ", bills: "বিল", lastPurchase: "শেষ কেনাকাটা", viewDetails: "বিস্তারিত দেখুন", customerDetails: "গ্রাহকের তথ্য", purchaseHistory: "কেনাকাটার ইতিহাস", invoice: "চালান", noHistory: "কেনাকাটার ইতিহাস নেই।", addCustomer: "গ্রাহক যোগ করুন", editCustomer: "গ্রাহক সম্পাদনা", enterName: "গ্রাহকের নাম লিখুন", enterPhone: "ফোন নম্বর লিখুন", namePhoneRequired: "গ্রাহকের নাম ও ফোন নম্বর লিখুন।", deleteConfirm: "এই গ্রাহককে মুছবেন?", unknownCustomer: "অজানা গ্রাহক" },
    bills: { title: "বিল", subtitle: "ডেটাবেসে সংরক্ষিত সব বিল।", noBills: "এখনও কোনো বিল সংরক্ষিত হয়নি", editBill: "বিল সম্পাদনা", walkIn: "সাধারণ গ্রাহক", mustHaveItem: "একটি বিলে অন্তত একটি পণ্য থাকতে হবে।" },
    dashboard: { welcome: "{{shopName}}-তে স্বাগতম!", purchaseHistory: "কেনাকাটার ইতিহাস", bill: "বিল", billTotal: "বিলের মোট", bills: "বিল", totalSpent: "মোট খরচ", noPurchases: "এই সময়ে কোনো কেনাকাটা পাওয়া যায়নি।", shopSales: "দোকানের বিক্রি", totalSales: "মোট বিক্রি", averageBill: "গড় বিল", dateUnavailable: "তারিখ নেই", send: "পাঠান", uploadImage: "ছবি আপলোড করুন", imageAttached: "ছবি যুক্ত হয়েছে", removeImage: "ছবি সরান", voiceCommand: "ভয়েস কমান্ড", stopListening: "শোনা বন্ধ করুন", example: "উদাহরণ: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "উদাহরণ: Rahul 2 kg Rice", readImage: "ছবি পড়া হচ্ছে...", imageReadFailed: "ছবি পড়া যায়নি। আবার চেষ্টা করুন বা পণ্যের নাম লিখুন।", noImageItems: "ছবিতে কোনো পণ্য পাওয়া যায়নি। পরিষ্কার ছবি দিন বা পণ্যের নাম লিখুন।", voiceUnsupported: "এই ব্রাউজারে ভয়েস শনাক্তকরণ নেই। Google Chrome ব্যবহার করুন।", voiceError: "ভয়েস শনাক্তকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।", pleaseAddItem: "সংরক্ষণের আগে অন্তত একটি পণ্য যোগ করুন।", savedLocally: "সতর্কতা: বিল স্থানীয়ভাবে সংরক্ষিত, কিন্তু ডেটাবেসে সংরক্ষিত হয়নি।", billCopied: "বিল কপি করা হয়েছে।", customerRequired: "গ্রাহকের নাম লিখুন।", itemQuantityRequired: "পণ্য ও পরিমাণ লিখুন।", quantityPositive: "পরিমাণ শূন্যের বেশি হতে হবে।", billNotFound: "{{customer}}-এর বিল পাওয়া যায়নি।", itemNotFound: "পণ্য পাওয়া যায়নি।", itemAdded: "পণ্য যোগ হয়েছে। বিল সংরক্ষণ করতে Save চাপুন।", billNeedsItem: "একটি বিলে অন্তত একটি পণ্য থাকতে হবে।", billSaved: "{{customer}}-এর বিল সংরক্ষিত হয়েছে।", imagePreview: "ছবির প্রিভিউ" },
  } },
  te: { translation: {
    nav: { dashboard: "డాష్‌బోర్డ్", products: "ఉత్పత్తులు", customers: "కస్టమర్లు", bills: "బిల్లులు", operations: "రిటైల్ కార్యకలాపాలు", retailPos: "రిటైల్ POS", account: "ఖాతా", signedInAs: "లాగిన్ అయినవారు", logout: "లాగ్ అవుట్", chooseLanguage: "భాషను ఎంచుకోండి", clearChat: "చాట్‌ను తొలగించండి", clearChatConfirm: "చాట్ మరియు స్థానికంగా సేవ్ చేసిన బిల్లులను తొలగించాలా?", openMenu: "నావిగేషన్ మెనూను తెరవండి" },
    common: { add: "జోడించు", edit: "సవరించు", delete: "తొలగించు", save: "మార్పులను సేవ్ చేయి", cancel: "రద్దు", close: "మూసివేయి", loading: "లోడ్ అవుతోంది...", name: "పేరు", phone: "ఫోన్", customer: "కస్టమర్", price: "ధర", unit: "యూనిట్", search: "వెతకండి", saved: "సేవ్ చేయబడింది", notSaved: "సేవ్ కాలేదు", item: "వస్తువు", quantity: "పరిమాణం", amount: "మొత్తం", total: "మొత్తం", noRecords: "రికార్డులు కనబడలేదు", saveFailed: "సేవ్ చేయడం విఫలమైంది.", deleteConfirm: "ఈ రికార్డును తొలగించాలా?" },
    auth: { loginTitle: "స్మార్ట్ రిటైల్ POS", loginSubtitle: "కొనసాగించడానికి లాగిన్ అవ్వండి", shopName: "షాపు పేరు", email: "ఇమెయిల్", password: "పాస్‌వర్డ్", enterShopName: "షాపు పేరు నమోదు చేయండి", enterEmail: "ఇమెయిల్ నమోదు చేయండి", enterPassword: "పాస్‌వర్డ్ నమోదు చేయండి", login: "లాగిన్", noAccount: "ఖాతా లేదా?", register: "నమోదు", createAccount: "ఖాతా సృష్టించండి", registerSubtitle: "మీ రిటైల్ POS ఖాతాను సృష్టించండి", userName: "వినియోగదారు పేరు", enterName: "మీ పేరు నమోదు చేయండి", createPassword: "పాస్‌వర్డ్ సృష్టించండి", hasAccount: "ఇప్పటికే ఖాతా ఉందా?", registrationSuccess: "నమోదు విజయవంతం! దయచేసి లాగిన్ అవ్వండి.", fillAll: "అన్ని వివరాలను నమోదు చేయండి.", connectionError: "సర్వర్‌ను చేరుకోలేకపోయాం. మళ్లీ ప్రయత్నించండి." },
    products: { title: "ఉత్పత్తులు", subtitle: "బిల్లింగ్‌లో ఉపయోగించే ఉత్పత్తులను నిర్వహించండి.", addProduct: "ఉత్పత్తిని జోడించు", editProduct: "ఉత్పత్తిని సవరించు", productName: "ఉత్పత్తి పేరు", exampleRice: "ఉదా. బియ్యం", examplePrice: "ఉదా. 65", saveChanges: "మార్పులను సేవ్ చేయి", noProducts: "ఇంకా ఉత్పత్తులు లేవు", firstProduct: "ప్రారంభించడానికి మొదటి ఉత్పత్తిని జోడించండి.", deleteProductConfirm: "\"{{name}}\" ఉత్పత్తిని తొలగించాలా?" },
    customers: { title: "కస్టమర్లు", subtitle: "మీ బిల్లింగ్ సంభాషణల నుంచి సృష్టించిన కస్టమర్ వివరాలు", search: "కస్టమర్‌ను వెతకండి...", noCustomers: "కస్టమర్ రికార్డులు లేవు", noCustomersDesc: "కస్టమర్‌ను జోడించండి లేదా డాష్‌బోర్డ్‌లో బిల్లు సృష్టించండి.", purchases: "కొనుగోళ్లు", totalSpent: "మొత్తం ఖర్చు", bills: "బిల్లులు", lastPurchase: "చివరి కొనుగోలు", viewDetails: "వివరాలు చూడండి", customerDetails: "కస్టమర్ వివరాలు", purchaseHistory: "కొనుగోలు చరిత్ర", invoice: "ఇన్వాయిస్", noHistory: "కొనుగోలు చరిత్ర లేదు.", addCustomer: "కస్టమర్‌ను జోడించు", editCustomer: "కస్టమర్‌ను సవరించు", enterName: "కస్టమర్ పేరు నమోదు చేయండి", enterPhone: "ఫోన్ నంబర్ నమోదు చేయండి", namePhoneRequired: "కస్టమర్ పేరు మరియు ఫోన్ నంబర్ నమోదు చేయండి.", deleteConfirm: "ఈ కస్టమర్‌ను తొలగించాలా?", unknownCustomer: "తెలియని కస్టమర్" },
    bills: { title: "బిల్లులు", subtitle: "డేటాబేస్‌లో సేవ్ చేసిన అన్ని బిల్లులు.", noBills: "ఇంకా బిల్లులు సేవ్ చేయలేదు", editBill: "బిల్లును సవరించు", walkIn: "సాధారణ కస్టమర్", mustHaveItem: "బిల్లులో కనీసం ఒక వస్తువు ఉండాలి." },
    dashboard: { welcome: "{{shopName}}కు స్వాగతం!", purchaseHistory: "కొనుగోలు చరిత్ర", bill: "బిల్లు", billTotal: "బిల్లు మొత్తం", bills: "బిల్లులు", totalSpent: "మొత్తం ఖర్చు", noPurchases: "ఈ కాలానికి కొనుగోళ్లు లేవు.", shopSales: "షాపు అమ్మకాలు", totalSales: "మొత్తం అమ్మకాలు", averageBill: "సగటు బిల్లు", dateUnavailable: "తేదీ అందుబాటులో లేదు", send: "పంపు", uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి", imageAttached: "చిత్రం జోడించబడింది", removeImage: "చిత్రాన్ని తొలగించు", voiceCommand: "వాయిస్ కమాండ్", stopListening: "వినడం ఆపు", example: "ఉదాహరణ: {{name}} 2 kg Rice | {{edit}}", editExample: "{{name}} edit Rice to 5 kg", placeholder: "ఉదా. Rahul 2 kg Rice", readImage: "చిత్రాన్ని చదువుతోంది...", imageReadFailed: "చిత్రాన్ని చదవలేకపోయాం. మళ్లీ ప్రయత్నించండి లేదా వస్తువులను టైప్ చేయండి.", noImageItems: "చిత్రంలో వస్తువులు కనిపించలేదు. స్పష్టమైన ఫోటోను ప్రయత్నించండి లేదా టైప్ చేయండి.", voiceUnsupported: "ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు లేదు. Google Chrome ఉపయోగించండి.", voiceError: "వాయిస్ గుర్తింపులో లోపం. మళ్లీ ప్రయత్నించండి.", pleaseAddItem: "సేవ్ చేయడానికి ముందు కనీసం ఒక వస్తువును జోడించండి.", savedLocally: "హెచ్చరిక: బిల్లు స్థానికంగా సేవ్ అయింది, కానీ డేటాబేస్‌లో సేవ్ కాలేదు.", billCopied: "బిల్లు కాపీ చేయబడింది.", customerRequired: "కస్టమర్ పేరు నమోదు చేయండి.", itemQuantityRequired: "వస్తువు మరియు పరిమాణాన్ని నమోదు చేయండి.", quantityPositive: "పరిమాణం సున్నా కంటే ఎక్కువగా ఉండాలి.", billNotFound: "{{customer}} బిల్లు కనబడలేదు.", itemNotFound: "ఉత్పత్తి కనబడలేదు.", itemAdded: "వస్తువు జోడించబడింది. బిల్లు సేవ్ చేయడానికి Save నొక్కండి.", billNeedsItem: "బిల్లులో కనీసం ఒక వస్తువు ఉండాలి.", billSaved: "{{customer}} బిల్లు విజయవంతంగా సేవ్ అయింది.", imagePreview: "చిత్ర ప్రివ్యూ" },
  } },
};

const supplementalTranslations = {
  en: {
    nav: {
      clearChatConfirm: "Clear only chat history? Saved bills, products, and customers will stay.",
      clearChatFailed: "Chat history could not be cleared. Please try again.",
    },
    auth: { loginFailed: "Login failed.", registrationFailed: "Registration failed." },
    products: { requiredFields: "Please enter product name and price." },
    dashboard: {
      saveBill: "Save",
      productChanged: "{{product}} changed to {{quantity}}. Save the bill to keep this change.",
      itemRemoved: "{{product}} removed. Save the bill to keep this change.",
      productsNotFound: "Product(s) not found: {{products}}",
      processingError: "Something went wrong processing that. Please try again.",
    },
  },
  hi: {
    nav: {
      clearChatConfirm: "केवल चैट इतिहास साफ़ करें? सहेजे गए बिल, उत्पाद और ग्राहक सुरक्षित रहेंगे।",
      clearChatFailed: "चैट इतिहास साफ़ नहीं हो पाया। फिर से प्रयास करें।",
    },
    auth: { loginFailed: "लॉग इन विफल हुआ।", registrationFailed: "रजिस्ट्रेशन विफल हुआ।" },
    products: { requiredFields: "कृपया उत्पाद का नाम और कीमत लिखें।" },
    dashboard: {
      saveBill: "बिल सहेजें",
      productChanged: "{{product}} की मात्रा {{quantity}} कर दी गई। बदलाव रखने के लिए बिल सहेजें।",
      itemRemoved: "{{product}} हटाया गया। बदलाव रखने के लिए बिल सहेजें।",
      productsNotFound: "उत्पाद नहीं मिले: {{products}}",
      processingError: "अनुरोध पूरा नहीं हो पाया। फिर से प्रयास करें।",
    },
  },
  mr: {
    nav: {
      clearChatConfirm: "फक्त चॅट इतिहास साफ करायचा? जतन केलेली बिले, उत्पादने आणि ग्राहक तसेच राहतील.",
      clearChatFailed: "चॅट इतिहास साफ करता आला नाही. पुन्हा प्रयत्न करा.",
    },
    auth: { loginFailed: "लॉग इन अयशस्वी झाले.", registrationFailed: "नोंदणी अयशस्वी झाली." },
    products: { requiredFields: "कृपया उत्पादनाचे नाव आणि किंमत लिहा." },
    dashboard: {
      saveBill: "बिल जतन करा",
      productChanged: "{{product}} चे प्रमाण {{quantity}} केले. बदल ठेवण्यासाठी बिल जतन करा.",
      itemRemoved: "{{product}} काढले. बदल ठेवण्यासाठी बिल जतन करा.",
      productsNotFound: "उत्पादने आढळली नाहीत: {{products}}",
      processingError: "विनंती पूर्ण करता आली नाही. पुन्हा प्रयत्न करा.",
    },
  },
  ta: {
    nav: {
      clearChatConfirm: "அரட்டை வரலாற்றை மட்டும் அழிக்கவா? சேமித்த பில்கள், பொருட்கள், வாடிக்கையாளர்கள் நீக்கப்படமாட்டார்கள்.",
      clearChatFailed: "அரட்டை வரலாற்றை அழிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    },
    auth: { loginFailed: "உள்நுழைவு தோல்வியடைந்தது.", registrationFailed: "பதிவு தோல்வியடைந்தது." },
    products: { requiredFields: "பொருளின் பெயரையும் விலையையும் உள்ளிடவும்." },
    dashboard: {
      saveBill: "பில்லைச் சேமி",
      productChanged: "{{product}} அளவு {{quantity}} ஆக மாற்றப்பட்டது. மாற்றத்தை வைத்திருக்க பில்லைச் சேமிக்கவும்.",
      itemRemoved: "{{product}} நீக்கப்பட்டது. மாற்றத்தை வைத்திருக்க பில்லைச் சேமிக்கவும்.",
      productsNotFound: "பொருட்கள் கிடைக்கவில்லை: {{products}}",
      processingError: "கோரிக்கையைச் செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    },
  },
  bn: {
    nav: {
      clearChatConfirm: "শুধু চ্যাটের ইতিহাস মুছবেন? সংরক্ষিত বিল, পণ্য ও গ্রাহক থাকবে।",
      clearChatFailed: "চ্যাটের ইতিহাস মুছতে পারেনি। আবার চেষ্টা করুন।",
    },
    auth: { loginFailed: "লগ ইন ব্যর্থ হয়েছে।", registrationFailed: "নিবন্ধন ব্যর্থ হয়েছে।" },
    products: { requiredFields: "পণ্যের নাম ও দাম লিখুন।" },
    dashboard: {
      saveBill: "বিল সংরক্ষণ করুন",
      productChanged: "{{product}}-এর পরিমাণ {{quantity}} করা হয়েছে। পরিবর্তন রাখতে বিল সংরক্ষণ করুন।",
      itemRemoved: "{{product}} সরানো হয়েছে। পরিবর্তন রাখতে বিল সংরক্ষণ করুন।",
      productsNotFound: "পণ্য পাওয়া যায়নি: {{products}}",
      processingError: "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।",
    },
  },
  te: {
    nav: {
      clearChatConfirm: "చాట్ చరిత్రను మాత్రమే తొలగించాలా? సేవ్ చేసిన బిల్లులు, ఉత్పత్తులు, కస్టమర్లు అలాగే ఉంటాయి.",
      clearChatFailed: "చాట్ చరిత్రను తొలగించలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    },
    auth: { loginFailed: "లాగిన్ విఫలమైంది.", registrationFailed: "నమోదు విఫలమైంది." },
    products: { requiredFields: "ఉత్పత్తి పేరు మరియు ధర నమోదు చేయండి." },
    dashboard: {
      saveBill: "బిల్లును సేవ్ చేయి",
      productChanged: "{{product}} పరిమాణం {{quantity}}గా మార్చబడింది. మార్పు ఉంచడానికి బిల్లును సేవ్ చేయండి.",
      itemRemoved: "{{product}} తొలగించబడింది. మార్పు ఉంచడానికి బిల్లును సేవ్ చేయండి.",
      productsNotFound: "ఉత్పత్తులు కనబడలేదు: {{products}}",
      processingError: "అభ్యర్థనను పూర్తి చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    },
  },
};

Object.entries(supplementalTranslations).forEach(([language, namespaces]) => {
  Object.entries(namespaces).forEach(([namespace, translations]) => {
    Object.assign(resources[language].translation[namespace], translations);
  });
});

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("posLanguage") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;