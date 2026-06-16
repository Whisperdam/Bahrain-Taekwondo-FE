export const APPLY_STRINGS = {
  en: {
    // Page titles & breadcrumbs
    applyCoachTitle: "Apply as Coach",
    applyOfficialTitle: "Apply as Official",
    applyAcademyTitle: "Apply for Academy",
    applyAcademySub: "Register a new academy under your coach profile.",
    backToDashboard: "Back to dashboard",
    backToMyApps: "My Applications",
    cancel: "Cancel",

    // Step labels
    sPersonal: "Personal",
    sCoaching: "Coaching",
    sOfficiating: "Officiating",
    sDocuments: "Documents",
    sReview: "Review",
    stepOf: (cur: number, total: number) => `Step ${cur} of ${total}`,

    // Personal fields
    firstName: "First name",
    lastName: "Last name",
    dob: "Date of birth",
    gender: "Gender",
    genderMALE: "Male",
    genderFEMALE: "Female",
    nationality: "Nationality",
    cpr: "CPR number",
    phone: "Phone",
    email: "Email",
    nationalityDefault: "Bahraini",

    // Coaching fields
    beltLevel: "Belt level",
    certLevel: "Certification level",
    certNumber: "Certification number",
    certDate: "Certification date",
    yearsExperience: "Years of experience",
    specialization: "Specialization",
    notes: "Notes",
    notesPh: "Anything else the federation should know…",
    optional: "Optional",
    coachCertExamplePh: "e.g. Kukkiwon 2nd Dan",
    coachSpecExamplePh: "e.g. Sparring",

    // Officiating
    certExpiry: "Certification expiry",
    badgeNATIONAL: "National",
    badgeREGIONAL: "Regional",
    badgeINTERNATIONAL: "International",
    spec_REFEREE: "Referee",
    spec_JUDGE: "Judge",
    spec_COACH_REFEREE: "Coach-Referee",

    // Belt levels
    belt_WHITE: "White",
    belt_YELLOW: "Yellow",
    belt_GREEN: "Green",
    belt_BLUE: "Blue",
    belt_RED: "Red",
    belt_BLACK_1: "Black — 1st Dan",
    belt_BLACK_2: "Black — 2nd Dan",
    belt_BLACK_3: "Black — 3rd Dan",
    belt_BLACK_4: "Black — 4th Dan",
    belt_BLACK_5: "Black — 5th Dan+",

    // Academy
    academyName: "Academy name",
    academyNamePh: "e.g. Manama TKD Academy",
    academyLocation: "Location",
    academyLocationPh: "City, district",
    academyPhone: "Academy phone",
    academyEmail: "Academy email",
    establishedDate: "Established date",
    academyDetails: "Academy details",
    documents: "Documents",
    coachOnly: "Coaches only",
    notACoach:
      "You need an approved coach profile before you can register an academy. Apply as a coach first.",

    // Documents
    docNationalId: "National ID",
    docCoachCert: "Coach certificate",
    docRefereeCert: "Referee certificate",
    docTradeLicense: "Trade license",
    docAcademyReg: "Academy registration",
    docInsurance: "Insurance",
    docRequired: "Required",
    docDropPrompt: "Drag a file here or click to browse",
    docConstraints: "PDF, JPG, or PNG · max 10MB",
    docChange: "Change",
    docRemove: "Remove",
    docUploading: "Uploading…",
    errFileTooLarge: "File is too large (max 10MB).",
    errFileType: "Unsupported file type.",
    errUploadFailed: "Upload failed. Please try again.",

    // Step nav
    back: "Back",
    next: "Next",
    submitApp: "Submit application",
    submitting: "Submitting…",

    // Submitted screen
    appPendingTitle: "Application submitted",
    appPendingSub:
      "Your application is now under review. We'll email you as soon as it's been processed.",
    viewMyApps: "View my applications",
    goToDashboard: "Go to dashboard",

    // Errors
    submitFailed:
      "We couldn't submit your application. Please check your details and try again.",
    docsRequired: "Please upload all required documents before submitting.",
  },
  ar: {
    applyCoachTitle: "تقديم كمدرّب",
    applyOfficialTitle: "تقديم كحكم",
    applyAcademyTitle: "تسجيل أكاديمية",
    applyAcademySub: "سجّل أكاديمية جديدة تحت ملفك كمدرّب.",
    backToDashboard: "العودة للرئيسية",
    backToMyApps: "طلباتي",
    cancel: "إلغاء",

    sPersonal: "البيانات الشخصية",
    sCoaching: "التدريب",
    sOfficiating: "التحكيم",
    sDocuments: "المستندات",
    sReview: "مراجعة",
    stepOf: (cur: number, total: number) => `الخطوة ${cur} من ${total}`,

    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    dob: "تاريخ الميلاد",
    gender: "الجنس",
    genderMALE: "ذكر",
    genderFEMALE: "أنثى",
    nationality: "الجنسية",
    cpr: "الرقم الشخصي",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    nationalityDefault: "بحريني",

    beltLevel: "المستوى (الحزام)",
    certLevel: "مستوى الشهادة",
    certNumber: "رقم الشهادة",
    certDate: "تاريخ الشهادة",
    yearsExperience: "سنوات الخبرة",
    specialization: "التخصص",
    notes: "ملاحظات",
    notesPh: "أي معلومات إضافية للاتحاد…",
    optional: "اختياري",
    coachCertExamplePh: "مثال: كوكيون — الدان الثاني",
    coachSpecExamplePh: "مثال: القتال",

    certExpiry: "انتهاء الشهادة",
    badgeNATIONAL: "محلي",
    badgeREGIONAL: "إقليمي",
    badgeINTERNATIONAL: "دولي",
    spec_REFEREE: "حكم",
    spec_JUDGE: "حكم جانبي",
    spec_COACH_REFEREE: "مدرب وحكم",

    belt_WHITE: "أبيض",
    belt_YELLOW: "أصفر",
    belt_GREEN: "أخضر",
    belt_BLUE: "أزرق",
    belt_RED: "أحمر",
    belt_BLACK_1: "أسود — الدان الأول",
    belt_BLACK_2: "أسود — الدان الثاني",
    belt_BLACK_3: "أسود — الدان الثالث",
    belt_BLACK_4: "أسود — الدان الرابع",
    belt_BLACK_5: "أسود — الدان الخامس+",

    academyName: "اسم الأكاديمية",
    academyNamePh: "مثال: أكاديمية المنامة",
    academyLocation: "الموقع",
    academyLocationPh: "المدينة، الحي",
    academyPhone: "هاتف الأكاديمية",
    academyEmail: "بريد الأكاديمية",
    establishedDate: "تاريخ التأسيس",
    academyDetails: "بيانات الأكاديمية",
    documents: "المستندات",
    coachOnly: "للمدربين فقط",
    notACoach:
      "تحتاج إلى ملف مدرب معتمد قبل تسجيل أكاديمية. قدّم كمدرب أولاً.",

    docNationalId: "البطاقة الذكية",
    docCoachCert: "شهادة المدرب",
    docRefereeCert: "شهادة الحكم",
    docTradeLicense: "السجل التجاري",
    docAcademyReg: "تسجيل الأكاديمية",
    docInsurance: "وثيقة التأمين",
    docRequired: "مطلوب",
    docDropPrompt: "اسحب ملفاً هنا أو انقر للتصفح",
    docConstraints: "PDF أو JPG أو PNG · حتى 10MB",
    docChange: "تغيير",
    docRemove: "حذف",
    docUploading: "جارٍ الرفع…",
    errFileTooLarge: "الملف كبير جداً (الحد 10MB).",
    errFileType: "نوع الملف غير مدعوم.",
    errUploadFailed: "فشل الرفع. حاول مرة أخرى.",

    back: "السابق",
    next: "التالي",
    submitApp: "إرسال الطلب",
    submitting: "جارٍ الإرسال…",

    appPendingTitle: "تم إرسال الطلب",
    appPendingSub:
      "طلبك قيد المراجعة الآن. سنرسل لك بريداً إلكترونياً فور معالجته.",
    viewMyApps: "عرض طلباتي",
    goToDashboard: "الذهاب للرئيسية",

    submitFailed: "تعذر إرسال الطلب. تحقق من البيانات وحاول مرة أخرى.",
    docsRequired: "يرجى رفع جميع المستندات المطلوبة قبل الإرسال.",
  },
} as const;

export type ApplyLang = "en" | "ar";
export type ApplyStrings = (typeof APPLY_STRINGS)["en"];

type BeltKey =
  | "belt_WHITE"
  | "belt_YELLOW"
  | "belt_GREEN"
  | "belt_BLUE"
  | "belt_RED"
  | "belt_BLACK_1"
  | "belt_BLACK_2"
  | "belt_BLACK_3"
  | "belt_BLACK_4"
  | "belt_BLACK_5";

export const BELT_OPTIONS: { value: string; key: BeltKey }[] = [
  { value: "WHITE", key: "belt_WHITE" },
  { value: "YELLOW", key: "belt_YELLOW" },
  { value: "GREEN", key: "belt_GREEN" },
  { value: "BLUE", key: "belt_BLUE" },
  { value: "RED", key: "belt_RED" },
  { value: "BLACK_1", key: "belt_BLACK_1" },
  { value: "BLACK_2", key: "belt_BLACK_2" },
  { value: "BLACK_3", key: "belt_BLACK_3" },
  { value: "BLACK_4", key: "belt_BLACK_4" },
  { value: "BLACK_5", key: "belt_BLACK_5" },
];
