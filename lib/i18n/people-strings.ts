// Strings for the player page (/players/[id]) and the person page (/users/[id]).

export const PEOPLE_STRINGS = {
  en: {
    back: "Back",
    loadFailed: "Couldn't load this page. Please try again.",
    retry: "Retry",

    // ── Player page
    playerNotFound: "Player not found",
    playerNotFoundBody: "This player doesn't exist or isn't available.",
    academy: "Academy",
    belt: "Belt",
    rankingPoints: "Ranking points",
    medals: "Medals",
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze",
    noMedals: "No medals yet.",

    // ── Private details (admin or the player's coach)
    privateTitle: "Private details",
    privateNoteAdmin: "Only admins and this player's coach can see this section.",
    privateNoteCoach: "Only you and the federation can see this section.",
    privateLoadFailed: "Couldn't load the private details.",
    dob: "Date of birth",
    age: (age: number) => `${age} years old this year`,
    gender: "Gender",
    genderMALE: "Male",
    genderFEMALE: "Female",
    nationality: "Nationality",
    nationalId: "National ID",
    phone: "Phone",
    email: "Email",
    emergencyContact: "Emergency contact",
    weight: "Weight",
    height: "Height",
    bloodType: "Blood type",
    status: "Status",
    registeredOn: "Registered on",
    account: "Account",
    openReview: "Open the application review",

    noAcademy: "No academy — free to join",
    releasedBadge: "Released",
    releaseAction: "Release from academy",
    releaseTitle: "Release this player?",
    releaseBody: (name: string) =>
      `${name} leaves the academy and loses the player role, but keeps their record, points and medals. Any academy can then add them. Do this only after agreeing it with the other coach.`,
    released: "Player released.",
    releaseFailed: "Couldn't release. Please try again.",
    cancel: "Cancel",
    working: "Working…",

    // ── History (admins)
    historyTitle: "Academy history",
    historyEmpty: "Nothing recorded yet.",
    byActor: (name: string) => `by ${name}`,
    event: (kind: string, academy: string | null) => {
      const where = academy ?? "an academy";
      switch (kind) {
        case "PLAYER_RELEASED": return `Released from ${where}`;
        case "PLAYER_CLAIMED": return `Joined ${where}`;
        case "COACH_INVITED": return `Invited to ${where}`;
        case "COACH_JOINED": return `Joined ${where} as a coach`;
        case "COACH_DECLINED": return `Declined the invitation to ${where}`;
        case "COACH_INVITE_CANCELLED": return `Invitation to ${where} cancelled`;
        case "COACH_RELEASED": return `Released from ${where}`;
        case "COACH_LEFT": return `Left ${where}`;
        case "COACH_ACCESS_CHANGED": return `Access in ${where} changed`;
        default: return kind;
      }
    },
    releaseCoachAdmin: "Release from their academy",
    coachReleasedAdmin: "Coach released.",

    // ── Person page
    userNotFound: "Page not found",
    userNotFoundBody: "This person doesn't exist or doesn't have a public page.",
    coachBadge: "Coach",
    officialBadge: "Official",
    playerBadge: "Player",
    ownedAcademies: "Academies",
    noAcademies: "No active academies.",
    officialDetails: "Official",
    specialization: "Specialization",
    certification: "Certification level",
    viewPlayer: "View player page",
    accountTitle: "Account",
    accountNote: "Only admins can see this section.",
    username: "Username",
    roles: "Roles",
    accountStatus: "Account status",
    lastLogin: "Last sign-in",
    never: "Never",
  },
  ar: {
    back: "رجوع",
    loadFailed: "تعذر تحميل هذه الصفحة. حاول مرة أخرى.",
    retry: "إعادة المحاولة",

    playerNotFound: "اللاعب غير موجود",
    playerNotFoundBody: "هذا اللاعب غير موجود أو غير متاح.",
    academy: "الأكاديمية",
    belt: "الحزام",
    rankingPoints: "نقاط التصنيف",
    medals: "الميداليات",
    gold: "ذهبية",
    silver: "فضية",
    bronze: "برونزية",
    noMedals: "لا توجد ميداليات بعد.",

    privateTitle: "التفاصيل الخاصة",
    privateNoteAdmin: "هذا القسم يراه المشرفون ومدرب اللاعب فقط.",
    privateNoteCoach: "هذا القسم تراه أنت والاتحاد فقط.",
    privateLoadFailed: "تعذر تحميل التفاصيل الخاصة.",
    dob: "تاريخ الميلاد",
    age: (age: number) => `العمر ${age} سنة هذا العام`,
    gender: "الجنس",
    genderMALE: "ذكر",
    genderFEMALE: "أنثى",
    nationality: "الجنسية",
    nationalId: "الرقم الشخصي",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    emergencyContact: "جهة الاتصال في الطوارئ",
    weight: "الوزن",
    height: "الطول",
    bloodType: "فصيلة الدم",
    status: "الحالة",
    registeredOn: "تاريخ التسجيل",
    account: "الحساب",
    openReview: "فتح مراجعة الطلب",

    noAcademy: "بلا أكاديمية — متاح للانضمام",
    releasedBadge: "محرَّر",
    releaseAction: "تحرير من الأكاديمية",
    releaseTitle: "تحرير هذا اللاعب؟",
    releaseBody: (name: string) =>
      `يغادر ${name} الأكاديمية ويفقد دور اللاعب، لكنه يحتفظ بسجله ونقاطه وميدالياته. بعدها يمكن لأي أكاديمية إضافته. افعل ذلك فقط بعد الاتفاق مع المدرب الآخر.`,
    released: "تم تحرير اللاعب.",
    releaseFailed: "تعذّر التحرير. حاول مرة أخرى.",
    cancel: "إلغاء",
    working: "جارٍ التنفيذ…",

    historyTitle: "سجل الأكاديميات",
    historyEmpty: "لا يوجد شيء مسجّل بعد.",
    byActor: (name: string) => `بواسطة ${name}`,
    event: (kind: string, academy: string | null) => {
      const where = academy ?? "أكاديمية";
      switch (kind) {
        case "PLAYER_RELEASED": return `تحرير من ${where}`;
        case "PLAYER_CLAIMED": return `انضمام إلى ${where}`;
        case "COACH_INVITED": return `دعوة إلى ${where}`;
        case "COACH_JOINED": return `انضمام إلى ${where} كمدرب`;
        case "COACH_DECLINED": return `رفض الدعوة إلى ${where}`;
        case "COACH_INVITE_CANCELLED": return `إلغاء الدعوة إلى ${where}`;
        case "COACH_RELEASED": return `تحرير من ${where}`;
        case "COACH_LEFT": return `مغادرة ${where}`;
        case "COACH_ACCESS_CHANGED": return `تغيير الصلاحية في ${where}`;
        default: return kind;
      }
    },
    releaseCoachAdmin: "تحريره من أكاديميته",
    coachReleasedAdmin: "تم تحرير المدرب.",

    userNotFound: "الصفحة غير موجودة",
    userNotFoundBody: "هذا الشخص غير موجود أو ليست له صفحة عامة.",
    coachBadge: "مدرب",
    officialBadge: "حكم",
    playerBadge: "لاعب",
    ownedAcademies: "الأكاديميات",
    noAcademies: "لا توجد أكاديميات نشطة.",
    officialDetails: "الحكم",
    specialization: "التخصص",
    certification: "مستوى الاعتماد",
    viewPlayer: "عرض صفحة اللاعب",
    accountTitle: "الحساب",
    accountNote: "هذا القسم يراه المشرفون فقط.",
    username: "اسم المستخدم",
    roles: "الأدوار",
    accountStatus: "حالة الحساب",
    lastLogin: "آخر تسجيل دخول",
    never: "أبدًا",
  },
} as const;

export type PeopleStrings = (typeof PEOPLE_STRINGS)[keyof typeof PEOPLE_STRINGS];
