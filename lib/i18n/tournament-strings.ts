// Strings for the tournament details page (/tournaments/[id]) and the
// register-a-player dialog. Status / type labels are shared with the browse
// pages and live in BROWSE_STRINGS.

export const TOURNAMENT_STRINGS = {
  en: {
    backToTournaments: "Tournaments",
    notFound: "Tournament not found",
    notFoundBody: "This tournament doesn't exist or is no longer available.",
    loadFailed: "Couldn't load data. Please try again.",
    retry: "Retry",

    // ── Summary card
    details: "Details",
    dates: "Dates",
    venue: "Venue",
    regDeadline: "Registration deadline",
    capacity: "Capacity",
    capacityOf: (taken: number, max: number) => `${taken} of ${max} places taken`,
    capacityOpen: (taken: number) => `${taken} registered · no limit`,
    rankingPoints: "Ranking points",
    pointsPending: (date: string) => `Published on ${date}. Results can be corrected until then.`,
    pointsPublished: "Published",
    about: "About this tournament",
    noDescription: "No description has been added yet.",

    // ── Registration banner
    regOpen: "Registration is open",
    regOpenUntil: (date: string) => `Open until ${date}.`,
    regClosed: "Registration is closed",
    closedNOT_UPCOMING: "Registration is only open for upcoming tournaments.",
    closedDEADLINE_PASSED: "The registration deadline has passed.",
    closedFULL: "This tournament is full.",
    registerPlayers: "Register players",

    // ── Roster
    participants: "Participants",
    participantsCount: (n: number) => `${n} ${n === 1 ? "participant" : "participants"}`,
    noParticipants: "No one has registered yet.",
    colPlayer: "Player",
    colAcademy: "Academy",
    colBelt: "Belt",
    genderMALE: "Male",
    genderFEMALE: "Female",
    genderMIXED: "Mixed",
    statusREGISTERED: "Registered",
    statusCONFIRMED: "Confirmed",
    statusDISQUALIFIED: "Disqualified",
    statusNO_SHOW: "No-show",
    entriesCount: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,

    // ── Withdraw
    withdraw: "Withdraw",
    withdrawTitle: "Withdraw this player?",
    withdrawBody: (name: string) =>
      `${name} will be removed from this tournament. You can register them again while registration is open.`,
    withdrawConfirm: "Withdraw",
    withdrawing: "Withdrawing…",
    cancel: "Cancel",
    withdrawSuccess: "Player withdrawn.",
    withdrawFailed: "Couldn't withdraw this player. Please try again.",

    // ── Register dialog
    registerTitle: "Register a player",
    academy: "Academy",
    player: "Player",
    selectPlayer: "Select a player…",
    weightClass: "Weight class",
    selectClass: "Select a weight class…",
    suggestedClass: "Suggested from the player's recorded weight.",
    loadingPlayers: "Loading players…",
    noEligiblePlayers:
      "No eligible players. Only active players who aren't already registered can be entered.",
    noClasses: "No weight classes are set up for this division yet.",
    register: "Register",
    registering: "Registering…",
    registerSuccess: (name: string) => `${name} registered.`,
    registerFailed: "Couldn't register this player. Please try again.",
    classesLoadFailed: "Couldn't load this tournament's weight classes.",
    playerAge: (age: number) => `age ${age}`,
    ageNotAccepted: "age not accepted",
    ageNotOpen: (age: number, year: number, groups: string) =>
      `This tournament is open to ages ${groups}, counted by year of birth. This player is ${age} in ${year}.`,
    noClassesForPlayer: "This tournament has no weight class for this player's age and gender.",

    // ── Summary card
    openToAges: "Open to ages",
  },
  ar: {
    backToTournaments: "البطولات",
    notFound: "البطولة غير موجودة",
    notFoundBody: "هذه البطولة غير موجودة أو لم تعد متاحة.",
    loadFailed: "تعذر تحميل البيانات. حاول مرة أخرى.",
    retry: "إعادة المحاولة",

    details: "التفاصيل",
    dates: "التواريخ",
    venue: "المكان",
    regDeadline: "آخر موعد للتسجيل",
    capacity: "السعة",
    capacityOf: (taken: number, max: number) => `${taken} من ${max} مقعدًا محجوزًا`,
    capacityOpen: (taken: number) => `${taken} مسجّل · بلا حد أقصى`,
    rankingPoints: "نقاط التصنيف",
    pointsPending: (date: string) => `تُنشر في ${date}. يمكن تصحيح النتائج حتى ذلك الحين.`,
    pointsPublished: "تم النشر",
    about: "عن البطولة",
    noDescription: "لم تتم إضافة وصف بعد.",

    regOpen: "التسجيل مفتوح",
    regOpenUntil: (date: string) => `مفتوح حتى ${date}.`,
    regClosed: "التسجيل مغلق",
    closedNOT_UPCOMING: "التسجيل متاح فقط للبطولات القادمة.",
    closedDEADLINE_PASSED: "انتهى الموعد النهائي للتسجيل.",
    closedFULL: "اكتمل عدد المشاركين في هذه البطولة.",
    registerPlayers: "تسجيل لاعبين",

    participants: "المشاركون",
    participantsCount: (n: number) => `${n} ${n === 1 ? "مشارك" : "مشاركين"}`,
    noParticipants: "لم يسجّل أحد بعد.",
    colPlayer: "اللاعب",
    colAcademy: "الأكاديمية",
    colBelt: "الحزام",
    genderMALE: "رجال",
    genderFEMALE: "سيدات",
    genderMIXED: "مختلط",
    statusREGISTERED: "مسجّل",
    statusCONFIRMED: "مؤكّد",
    statusDISQUALIFIED: "مستبعد",
    statusNO_SHOW: "لم يحضر",
    entriesCount: (n: number) => `${n} ${n === 1 ? "مشاركة" : "مشاركات"}`,

    withdraw: "سحب",
    withdrawTitle: "سحب هذا اللاعب؟",
    withdrawBody: (name: string) =>
      `سيتم إزالة ${name} من هذه البطولة. يمكنك تسجيله مجددًا ما دام التسجيل مفتوحًا.`,
    withdrawConfirm: "سحب",
    withdrawing: "جارٍ السحب…",
    cancel: "إلغاء",
    withdrawSuccess: "تم سحب اللاعب.",
    withdrawFailed: "تعذر سحب هذا اللاعب. حاول مرة أخرى.",

    registerTitle: "تسجيل لاعب",
    academy: "الأكاديمية",
    player: "اللاعب",
    selectPlayer: "اختر لاعبًا…",
    weightClass: "فئة الوزن",
    selectClass: "اختر فئة الوزن…",
    suggestedClass: "مقترحة بناءً على وزن اللاعب المسجّل.",
    loadingPlayers: "جارٍ تحميل اللاعبين…",
    noEligiblePlayers:
      "لا يوجد لاعبون مؤهلون. يمكن تسجيل اللاعبين النشطين فقط ممن لم يتم تسجيلهم مسبقًا.",
    noClasses: "لم يتم إعداد فئات وزن لهذه الفئة بعد.",
    register: "تسجيل",
    registering: "جارٍ التسجيل…",
    registerSuccess: (name: string) => `تم تسجيل ${name}.`,
    registerFailed: "تعذر تسجيل هذا اللاعب. حاول مرة أخرى.",
    classesLoadFailed: "تعذر تحميل فئات الوزن لهذه البطولة.",
    playerAge: (age: number) => `العمر ${age}`,
    ageNotAccepted: "العمر غير مقبول",
    ageNotOpen: (age: number, year: number, groups: string) =>
      `هذه البطولة مفتوحة للأعمار ${groups}، وتُحسب بسنة الميلاد. عمر هذا اللاعب ${age} في ${year}.`,
    noClassesForPlayer: "لا توجد في هذه البطولة فئة وزن تناسب عمر هذا اللاعب وجنسه.",

    // ── Summary card
    openToAges: "مفتوحة للأعمار",
  },
} as const;

export type TournamentStrings =
  (typeof TOURNAMENT_STRINGS)[keyof typeof TOURNAMENT_STRINGS];
