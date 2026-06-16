// Strings for authenticated user-facing portal pages (My Applications, Profile).
// Kept together because both pages live in the same nav group and share badges.

export const PORTAL_STRINGS = {
  en: {
    // Common
    cancel: "Cancel",

    // ── My Applications ────────────────────────────────────────────────────
    myAppsTitle: "My Applications",
    myAppsSub: "Track the status of applications you've submitted.",
    myAppsEmpty: "No applications yet",
    myAppsEmptySub:
      "Submit an application to upgrade your federation account.",
    applyCoachNav: "Apply as Coach",
    applyOfficialNav: "Apply as Official",
    applyAcademyNav: "Apply for Academy",
    appSubmitted: "Submitted",
    appReviewed: "Reviewed",
    viewAdminNotes: "View reviewer notes",
    hideAdminNotes: "Hide reviewer notes",
    rejectionReason: "Reason",
    withdraw: "Withdraw",
    withdrawTitle: "Withdraw application?",
    withdrawBody:
      "This will cancel your submission. You can re-apply later, but you'll need to upload documents again.",
    withdrawing: "Withdrawing…",
    withdrawDone: "Application withdrawn",
    withdrawFailed: "Could not withdraw the application. Please try again.",

    // Status badges
    statusPENDING: "Pending",
    statusUNDER_REVIEW: "Under review",
    statusAPPROVED: "Approved",
    statusREJECTED: "Rejected",
    statusWITHDRAWN: "Withdrawn",

    // Type badges
    typeCOACH: "Coach",
    typeOFFICIAL: "Official",
    typeACADEMY: "Academy",

    // ── Profile ────────────────────────────────────────────────────────────
    profileTitle: "Settings",
    profileSub: "Manage your federation profile and security.",
    yourPhoto: "Your photo",
    photoUpload: "Upload photo",
    photoChange: "Change photo",
    photoRemove: "Remove",
    photoUploading: "Uploading…",
    photoRemoving: "Removing…",
    photoUploadFailed: "Could not upload the photo. Please try again.",
    photoRemoveFailed: "Could not remove the photo. Please try again.",
    photoUploadedToast: "Photo updated",
    photoRemovedToast: "Photo removed",
    removePhotoTitle: "Remove your photo?",
    removePhotoBody:
      "Your account will fall back to your initials. You can upload a new one anytime.",
    photoDropPrompt: "Drag an image here or click to browse",
    photoConstraints: "JPG or PNG · square images look best · max 5MB",
    errPhotoSize: "Image is too large (max 5MB).",
    errPhotoType: "Only JPG or PNG images are allowed.",

    accountInfo: "Account information",
    fullName: "Full name",
    username: "Username",
    email: "Email",
    yourRoles: "Roles",
    accountStatus: "Account status",

    security: "Security",
    changePassword: "Change password",
    changePasswordHint:
      "We use our standard reset flow. We'll send a one-time link to your email.",
    sendResetLink: "Send reset link",
    resetLinkSent: "Reset link sent. Check your inbox.",
    resetLinkFailed: "Could not send the reset link. Please try again.",

    // Roles
    role_ROLE_VIEWER: "Viewer",
    role_ROLE_COACH: "Coach",
    role_ROLE_OFFICIAL: "Official",
    role_ROLE_PLAYER: "Player",
    role_ROLE_ADMIN: "Admin",
  },
  ar: {
    cancel: "إلغاء",

    myAppsTitle: "طلباتي",
    myAppsSub: "تابع حالة الطلبات التي قدّمتها.",
    myAppsEmpty: "لا توجد طلبات بعد",
    myAppsEmptySub: "قدّم طلباً لترقية حسابك في الاتحاد.",
    applyCoachNav: "تقديم كمدرّب",
    applyOfficialNav: "تقديم كحكم",
    applyAcademyNav: "تسجيل أكاديمية",
    appSubmitted: "تاريخ التقديم",
    appReviewed: "تاريخ المراجعة",
    viewAdminNotes: "عرض ملاحظات المراجع",
    hideAdminNotes: "إخفاء الملاحظات",
    rejectionReason: "السبب",
    withdraw: "سحب الطلب",
    withdrawTitle: "هل تريد سحب الطلب؟",
    withdrawBody:
      "سيتم إلغاء طلبك. يمكنك التقديم مجدداً لاحقاً، لكن ستحتاج إلى رفع المستندات مرة أخرى.",
    withdrawing: "جارٍ السحب…",
    withdrawDone: "تم سحب الطلب",
    withdrawFailed: "تعذر سحب الطلب. حاول مرة أخرى.",

    statusPENDING: "قيد الانتظار",
    statusUNDER_REVIEW: "قيد المراجعة",
    statusAPPROVED: "مقبول",
    statusREJECTED: "مرفوض",
    statusWITHDRAWN: "مسحوب",

    typeCOACH: "مدرّب",
    typeOFFICIAL: "حكم",
    typeACADEMY: "أكاديمية",

    profileTitle: "الإعدادات",
    profileSub: "إدارة ملفك في الاتحاد والإعدادات الأمنية.",
    yourPhoto: "صورتك",
    photoUpload: "رفع صورة",
    photoChange: "تغيير الصورة",
    photoRemove: "حذف",
    photoUploading: "جارٍ الرفع…",
    photoRemoving: "جارٍ الحذف…",
    photoUploadFailed: "تعذر رفع الصورة. حاول مرة أخرى.",
    photoRemoveFailed: "تعذر حذف الصورة. حاول مرة أخرى.",
    photoUploadedToast: "تم تحديث الصورة",
    photoRemovedToast: "تم حذف الصورة",
    removePhotoTitle: "حذف صورتك؟",
    removePhotoBody:
      "سيعود حسابك لاستخدام الأحرف الأولى. يمكنك رفع صورة جديدة في أي وقت.",
    photoDropPrompt: "اسحب صورة هنا أو انقر للتصفح",
    photoConstraints: "JPG أو PNG · الصور المربعة أفضل · حتى 5MB",
    errPhotoSize: "الصورة كبيرة (الحد 5MB).",
    errPhotoType: "يُسمح فقط بصور JPG أو PNG.",

    accountInfo: "بيانات الحساب",
    fullName: "الاسم الكامل",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    yourRoles: "الأدوار",
    accountStatus: "حالة الحساب",

    security: "الأمان",
    changePassword: "تغيير كلمة المرور",
    changePasswordHint:
      "نستخدم رابط إعادة تعيين قياسي. سنرسل رابطاً لمرة واحدة إلى بريدك.",
    sendResetLink: "إرسال رابط الإعادة",
    resetLinkSent: "تم إرسال الرابط. تحقق من بريدك.",
    resetLinkFailed: "تعذر إرسال الرابط. حاول مرة أخرى.",

    role_ROLE_VIEWER: "مشاهد",
    role_ROLE_COACH: "مدرّب",
    role_ROLE_OFFICIAL: "حكم",
    role_ROLE_PLAYER: "لاعب",
    role_ROLE_ADMIN: "مشرف",
  },
} as const;

export type PortalLang = "en" | "ar";
export type PortalStrings = (typeof PORTAL_STRINGS)["en"];
