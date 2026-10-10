export const CLASSES_STRINGS = {
  en: {
    // ── Page
    title: "Age groups & weight classes",
    subtitle: "The standard classes used by every tournament.",
    info: "When you create a tournament you choose which of these it accepts. Ages are counted by year of birth: the year the tournament starts minus the year the player was born.",
    newGroup: "New age group",
    showArchived: "Show archived",
    emptyTitle: "No age groups yet",
    emptyBody: "Create the first age group, then add its weight classes.",
    loadFailed: "Couldn't load the age groups.",
    retry: "Try again",
    ages: (min: number, max: number) => `Ages ${min}–${max}`,
    archivedBadge: "Archived",
    inUseBadge: "Fixed: used by a started tournament",
    usedBy: (n: number) => (n === 1 ? "1 tournament" : `${n} tournaments`),
    noClassesYet: "No classes yet.",
    addClass: "Add class",
    addSeveral: "Add several",
    editGroup: "Edit",
    removeGroup: "Remove",
    restore: "Restore",
    male: "Male",
    female: "Female",
    mixed: "Mixed",
    upTo: (kg: string) => `Up to ${kg} kg`,
    over: (kg: string) => `Over ${kg} kg`,
    anyWeight: "Any weight",
    editClass: "Edit limit",
    removeClass: "Remove class",

    // ── Age group form
    groupNewTitle: "New age group",
    groupEditTitle: "Edit age group",
    nameLabel: "Name",
    namePh: "e.g. Kids",
    minAge: "From age",
    maxAge: "To age",
    agesHint: "Counted by year of birth. Age groups can't overlap.",
    lockedAgesHint:
      "A tournament that has started or finished used this age group, so its ages can't change. You can still rename it.",
    errName: "Enter a name of 2 to 40 characters.",
    errAges: "Enter ages from 0 to 120, with the first not above the last.",

    // ── Class form
    classAddTitle: "Add a weight class",
    classEditTitle: "Edit weight class",
    genderLabel: "Gender",
    limitLabel: "Upper limit (kg)",
    limitPh: "e.g. 35",
    openEnded: "No upper limit (the top class)",
    openEndedHint: "Takes everyone above the limit of the class below it.",
    lockedLimitHint:
      "A tournament that has started or finished used this class, so its limit can't change. Remove it and add a new class instead.",
    errLimit: "Enter a weight above 0 and up to 300 kg, with at most 2 decimals.",

    // ── Several at once
    ladderTitle: "Add several classes",
    ladderHint:
      "Type the upper limits separated by commas, e.g. 28, 35, 41. Limits that already exist are skipped.",
    limitsLabel: "Upper limits (kg)",
    limitsPh: "28, 35, 41",
    addTopClass: "Also add a top class above the highest limit",
    errLimits: "Enter at least one weight, separated by commas.",
    add: "Add",
    adding: "Adding…",

    // ── Removing
    removeGroupTitle: "Remove this age group?",
    removeGroupBody:
      "If tournaments, entries or results already use it, it is archived instead: it disappears from new tournaments but old results keep it. Otherwise it is deleted.",
    removeClassTitle: "Remove this weight class?",
    removeClassBody:
      "If tournaments, entries or results already use it, it is archived instead: it disappears from new tournaments but old results keep it. Otherwise it is deleted.",
    remove: "Remove",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",

    // ── Toasts
    groupCreated: "Age group created.",
    groupUpdated: "Age group updated.",
    groupDeleted: "Age group deleted.",
    groupArchived: "Age group archived.",
    groupRestored: "Age group restored.",
    classAdded: "Weight class added.",
    classesAdded: "Weight classes added.",
    classUpdated: "Weight class updated.",
    classDeleted: "Weight class deleted.",
    classArchived: "Weight class archived.",
    classRestored: "Weight class restored.",
    actionFailed: "That didn't work. Please try again.",

    // ── Class picker (tournament form)
    pickerTitle: "Eligible classes",
    pickerHint:
      "Choose the weight classes this tournament accepts. Players can only be entered in these, and only if their age fits.",
    selectAll: "Select all",
    clearAll: "Clear",
    selectedCount: (n: number, total: number) => `${n} of ${total} selected`,
    pickerEmpty: "No age groups are set up yet. Create them under Age groups & weight classes first.",
    pickerRequired: "Choose at least one class.",
    pickerLocked: "The classes can only be changed before the tournament starts.",
    pickerLoadFailed: "Couldn't load the classes.",
    manageClasses: "Manage age groups & classes",
  },
  ar: {
    // ── Page
    title: "الفئات العمرية وفئات الوزن",
    subtitle: "الفئات القياسية التي تعتمدها جميع البطولات.",
    info: "عند إنشاء بطولة تختار أيًّا من هذه الفئات تقبلها. يُحسب العمر بسنة الميلاد: سنة بدء البطولة ناقص سنة ميلاد اللاعب.",
    newGroup: "فئة عمرية جديدة",
    showArchived: "إظهار المؤرشفة",
    emptyTitle: "لا توجد فئات عمرية بعد",
    emptyBody: "أنشئ أول فئة عمرية ثم أضف إليها فئات الوزن.",
    loadFailed: "تعذّر تحميل الفئات العمرية.",
    retry: "حاول مجددًا",
    ages: (min: number, max: number) => `الأعمار ${min}–${max}`,
    archivedBadge: "مؤرشفة",
    inUseBadge: "ثابتة: استخدمتها بطولة بدأت",
    usedBy: (n: number) => (n === 1 ? "بطولة واحدة" : `${n} بطولات`),
    noClassesYet: "لا توجد فئات وزن بعد.",
    addClass: "إضافة فئة",
    addSeveral: "إضافة عدة فئات",
    editGroup: "تعديل",
    removeGroup: "حذف",
    restore: "استعادة",
    male: "ذكور",
    female: "إناث",
    mixed: "مختلطة",
    upTo: (kg: string) => `حتى ${kg} كغ`,
    over: (kg: string) => `أكثر من ${kg} كغ`,
    anyWeight: "أي وزن",
    editClass: "تعديل الحد",
    removeClass: "حذف الفئة",

    // ── Age group form
    groupNewTitle: "فئة عمرية جديدة",
    groupEditTitle: "تعديل الفئة العمرية",
    nameLabel: "الاسم",
    namePh: "مثال: Kids",
    minAge: "من عمر",
    maxAge: "إلى عمر",
    agesHint: "يُحسب العمر بسنة الميلاد. لا يجوز أن تتداخل الفئات العمرية.",
    lockedAgesHint:
      "استخدمت هذه الفئة بطولة بدأت أو انتهت، لذا لا يمكن تغيير أعمارها. يمكنك إعادة تسميتها.",
    errName: "أدخل اسمًا من 2 إلى 40 حرفًا.",
    errAges: "أدخل أعمارًا بين 0 و120 بحيث لا يزيد الأول عن الأخير.",

    // ── Class form
    classAddTitle: "إضافة فئة وزن",
    classEditTitle: "تعديل فئة الوزن",
    genderLabel: "الجنس",
    limitLabel: "الحد الأعلى (كغ)",
    limitPh: "مثال: 35",
    openEnded: "بلا حد أعلى (الفئة الأثقل)",
    openEndedHint: "تضم كل من يزيد وزنه عن حد الفئة التي تحتها.",
    lockedLimitHint:
      "استخدمت هذه الفئة بطولة بدأت أو انتهت، لذا لا يمكن تغيير حدها. احذفها وأضف فئة جديدة بدلًا منها.",
    errLimit: "أدخل وزنًا أكبر من 0 وحتى 300 كغ، بخانتين عشريتين كحد أقصى.",

    // ── Several at once
    ladderTitle: "إضافة عدة فئات",
    ladderHint:
      "اكتب الحدود العليا مفصولة بفواصل، مثل 28, 35, 41. الحدود الموجودة مسبقًا تُتجاهل.",
    limitsLabel: "الحدود العليا (كغ)",
    limitsPh: "28, 35, 41",
    addTopClass: "أضف أيضًا فئة أثقل فوق أعلى حد",
    errLimits: "أدخل وزنًا واحدًا على الأقل، مفصولًا بفواصل.",
    add: "إضافة",
    adding: "جارٍ الإضافة…",

    // ── Removing
    removeGroupTitle: "حذف هذه الفئة العمرية؟",
    removeGroupBody:
      "إذا كانت بطولات أو تسجيلات أو نتائج تستخدمها فستُؤرشف بدل حذفها: تختفي من البطولات الجديدة وتحتفظ بها النتائج القديمة. وإلا فتُحذف.",
    removeClassTitle: "حذف فئة الوزن هذه؟",
    removeClassBody:
      "إذا كانت بطولات أو تسجيلات أو نتائج تستخدمها فستُؤرشف بدل حذفها: تختفي من البطولات الجديدة وتحتفظ بها النتائج القديمة. وإلا فتُحذف.",
    remove: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جارٍ الحفظ…",

    // ── Toasts
    groupCreated: "تم إنشاء الفئة العمرية.",
    groupUpdated: "تم تحديث الفئة العمرية.",
    groupDeleted: "تم حذف الفئة العمرية.",
    groupArchived: "تمت أرشفة الفئة العمرية.",
    groupRestored: "تمت استعادة الفئة العمرية.",
    classAdded: "تمت إضافة فئة الوزن.",
    classesAdded: "تمت إضافة فئات الوزن.",
    classUpdated: "تم تحديث فئة الوزن.",
    classDeleted: "تم حذف فئة الوزن.",
    classArchived: "تمت أرشفة فئة الوزن.",
    classRestored: "تمت استعادة فئة الوزن.",
    actionFailed: "لم تنجح العملية. حاول مرة أخرى.",

    // ── Class picker (tournament form)
    pickerTitle: "الفئات المقبولة",
    pickerHint:
      "اختر فئات الوزن التي تقبلها هذه البطولة. لا يمكن تسجيل اللاعبين إلا فيها، وبشرط أن يناسب عمرهم الفئة.",
    selectAll: "تحديد الكل",
    clearAll: "مسح",
    selectedCount: (n: number, total: number) => `تم تحديد ${n} من ${total}`,
    pickerEmpty: "لم يتم إعداد أي فئة عمرية بعد. أنشئها أولًا من صفحة الفئات العمرية وفئات الوزن.",
    pickerRequired: "اختر فئة واحدة على الأقل.",
    pickerLocked: "لا يمكن تغيير الفئات إلا قبل بدء البطولة.",
    pickerLoadFailed: "تعذّر تحميل الفئات.",
    manageClasses: "إدارة الفئات العمرية وفئات الوزن",
  },
} as const;

export type ClassesStrings = (typeof CLASSES_STRINGS)[keyof typeof CLASSES_STRINGS];
