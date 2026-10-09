// Messages for errors raised outside React components (the axios interceptor).

export const ERROR_STRINGS = {
  en: {
    tooManyRequests: (seconds: number | null) =>
      seconds
        ? `Too many requests. Please try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`
        : "Too many requests. Please wait a moment and try again.",
  },
  ar: {
    tooManyRequests: (seconds: number | null) =>
      seconds
        ? `عدد الطلبات كبير جدًا. حاول مرة أخرى بعد ${seconds} ثانية.`
        : "عدد الطلبات كبير جدًا. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.",
  },
} as const;
