// Strings for editing your own profile (name, username, email, password, player details)
// and for an admin correcting someone else's account.

export const PROFILE_STRINGS = {
  en: {
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    englishOnly: "English letters only.",
    currentPassword: "Current password",
    currentPasswordHint: "We ask again to make sure it's really you.",
    loadFailed: "Couldn't load your profile.",
    retry: "Retry",

    changesLeft: (n: number) =>
      n === 0 ? "No changes left" : n === 1 ? "1 change left" : `${n} changes left`,
    noChangesLeft:
      "You have used all your changes. Contact the federation if this has to be corrected.",

    // ── Name
    nameTitle: "Change your name",
    firstName: "First name",
    lastName: "Last name",
    nameHint: (left: number) =>
      `Use your real name in English letters. It also updates your player and coach records. You can change it ${left} more ${left === 1 ? "time" : "times"}.`,
    nameSaved: "Name updated",

    // ── Username
    usernameTitle: "Change your username",
    newUsername: "New username",
    usernameHint: (left: number) =>
      `3 to 50 characters: English letters, numbers, dots, dashes and underscores. You can change it ${left} more ${left === 1 ? "time" : "times"}. You stay signed in.`,
    usernameSaved: "Username updated",

    // ── Email
    emailTitle: "Change your email",
    newEmail: "New email address",
    emailHint: (left: number) =>
      `We'll send a confirmation link to the new address. Your email only changes once you open it. You can change it ${left} more ${left === 1 ? "time" : "times"}.`,
    emailPending: (email: string) => `Waiting for you to confirm ${email}. Check that inbox.`,
    emailRequested: "Confirmation link sent",

    // ── Password
    passwordTitle: "Change your password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    passwordHint: "At least 8 characters, with a letter, a number and a symbol.",
    passwordMismatch: "The two passwords don't match.",
    passwordSaved: "Password changed",
    forgotInstead: "Forgot it? Email me a reset link",
    resetSent: "Reset link sent to your email",

    // ── Player details
    detailsTitle: "My player details",
    detailsSub: "How the federation and your coach can reach you, and your measurements.",
    phone: "Phone",
    emergencyName: "Emergency contact",
    emergencyPhone: "Emergency phone",
    weightKg: "Weight (kg)",
    heightCm: "Height (cm)",
    bloodType: "Blood type",
    notSet: "Not set",
    detailsEdit: "Edit details",
    detailsHint: (left: number, max: number, days: number) =>
      `You can update these ${max} times every ${days} days (${left} left).`,
    detailsWait: (date: string) => `You can edit them again on ${date}.`,
    detailsSaved: "Details updated",
    nothingChanged: "Change something first.",
    academy: "Academy",
    belt: "Belt",
    status: "Status",
    rankingPoints: "Ranking points",
    nationalId: "National ID",
    dob: "Date of birth",
    federationOnly: "Name, date of birth, belt and academy are managed by the federation.",

    // ── Admin
    adminEditTitle: "Edit account details",
    adminEditHint:
      "Corrections made here are not counted against the person's own limit, and the new email takes effect straight away.",
    email: "Email",
    username: "Username",
    adminSaved: "Details updated",
  },
  ar: {
    edit: "تعديل",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    englishOnly: "حروف إنجليزية فقط.",
    currentPassword: "كلمة المرور الحالية",
    currentPasswordHint: "نطلبها مرة أخرى للتأكد أنك أنت.",
    loadFailed: "تعذّر تحميل ملفك الشخصي.",
    retry: "إعادة المحاولة",

    changesLeft: (n: number) =>
      n === 0 ? "لا توجد تعديلات متبقية" : n === 1 ? "تعديل واحد متبقٍ" : `${n} تعديلات متبقية`,
    noChangesLeft: "استنفدت جميع تعديلاتك. تواصل مع الاتحاد إن كان يجب تصحيح ذلك.",

    nameTitle: "تغيير الاسم",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    nameHint: (left: number) =>
      `استخدم اسمك الحقيقي بحروف إنجليزية. يتم تحديث سجلات اللاعب والمدرب أيضًا. يمكنك تغييره ${left} مرة أخرى.`,
    nameSaved: "تم تحديث الاسم",

    usernameTitle: "تغيير اسم المستخدم",
    newUsername: "اسم المستخدم الجديد",
    usernameHint: (left: number) =>
      `من 3 إلى 50 حرفًا: حروف إنجليزية وأرقام ونقاط وشرطات وشرطات سفلية. يمكنك تغييره ${left} مرة أخرى. ستبقى مسجّل الدخول.`,
    usernameSaved: "تم تحديث اسم المستخدم",

    emailTitle: "تغيير البريد الإلكتروني",
    newEmail: "البريد الإلكتروني الجديد",
    emailHint: (left: number) =>
      `سنرسل رابط تأكيد إلى العنوان الجديد. لا يتغير بريدك إلا بعد فتح الرابط. يمكنك تغييره ${left} مرة أخرى.`,
    emailPending: (email: string) => `بانتظار تأكيدك لـ ${email}. تحقق من ذلك البريد.`,
    emailRequested: "تم إرسال رابط التأكيد",

    passwordTitle: "تغيير كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    passwordHint: "8 أحرف على الأقل، مع حرف ورقم ورمز.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    passwordSaved: "تم تغيير كلمة المرور",
    forgotInstead: "نسيتها؟ أرسل لي رابط إعادة التعيين",
    resetSent: "تم إرسال رابط إعادة التعيين إلى بريدك",

    detailsTitle: "بيانات اللاعب",
    detailsSub: "كيف يمكن للاتحاد ومدربك التواصل معك، وقياساتك.",
    phone: "الهاتف",
    emergencyName: "جهة الاتصال للطوارئ",
    emergencyPhone: "هاتف الطوارئ",
    weightKg: "الوزن (كغ)",
    heightCm: "الطول (سم)",
    bloodType: "فصيلة الدم",
    notSet: "غير محدد",
    detailsEdit: "تعديل البيانات",
    detailsHint: (left: number, max: number, days: number) =>
      `يمكنك تحديث هذه البيانات ${max} مرات كل ${days} يومًا (متبقٍ ${left}).`,
    detailsWait: (date: string) => `يمكنك تعديلها مرة أخرى في ${date}.`,
    detailsSaved: "تم تحديث البيانات",
    nothingChanged: "غيّر شيئًا أولًا.",
    academy: "الأكاديمية",
    belt: "الحزام",
    status: "الحالة",
    rankingPoints: "نقاط التصنيف",
    nationalId: "الرقم الشخصي",
    dob: "تاريخ الميلاد",
    federationOnly: "الاسم وتاريخ الميلاد والحزام والأكاديمية يديرها الاتحاد.",

    adminEditTitle: "تعديل بيانات الحساب",
    adminEditHint:
      "التصحيحات هنا لا تُحسب من حدود التعديل الخاصة بالشخص، ويسري البريد الجديد فورًا.",
    email: "البريد الإلكتروني",
    username: "اسم المستخدم",
    adminSaved: "تم تحديث البيانات",
  },
} as const;

export type ProfileStrings = (typeof PROFILE_STRINGS)[keyof typeof PROFILE_STRINGS];
