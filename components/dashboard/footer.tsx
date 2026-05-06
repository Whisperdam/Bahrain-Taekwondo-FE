import { ShieldLogo } from "@/components/ui/shield-logo";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";

function SocialButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-9 h-9 rounded-full bg-ink-700 border border-ink-600 text-slate-400 hover:text-white hover:border-flag/50 transition-colors flex items-center justify-center"
    >
      {children}
    </a>
  );
}

export function Footer({ lang }: { lang: DashLang }) {
  const t = DASH_STRINGS[lang];

  return (
    <footer className="mt-20 border-t border-ink-600/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Brand */}
        <div className="flex items-start gap-3">
          <ShieldLogo size={32} />
          <div className="text-sm leading-relaxed">
            <div className="font-semibold text-white">{DASH_STRINGS.en.fedFull}</div>
            <div className="font-arabic font-semibold text-white" dir="rtl">
              {DASH_STRINGS.ar.fedFull}
            </div>
            <div className="text-slate-500 text-xs mt-1">{t.address}</div>
          </div>
        </div>

        {/* Links + socials */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <nav className="flex items-center gap-5 text-sm">
            <a href="#" className="text-slate-400 hover:text-flag transition-colors">{t.privacy}</a>
            <a href="#" className="text-slate-400 hover:text-flag transition-colors">{t.terms}</a>
            <a href="#" className="text-slate-400 hover:text-flag transition-colors">{t.contactLink}</a>
          </nav>
          <div className="flex items-center gap-2">
            {/* X / Twitter */}
            <SocialButton>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 5.8a8.4 8.4 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.3 8.3 0 0 1-2.6 1A4.1 4.1 0 0 0 12 9a11.7 11.7 0 0 1-8.5-4.3 4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.5 11.7 11.7 0 0 0 8.3 20c7.5 0 11.6-6.2 11.6-11.6v-.5A8.3 8.3 0 0 0 22 5.8Z" />
              </svg>
            </SocialButton>
            {/* Facebook */}
            <SocialButton>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.2 19.5v-6.9H6.4v-2.6h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.6h-2.2V21.5A10 10 0 0 0 12 2Z" />
              </svg>
            </SocialButton>
            {/* Instagram */}
            <SocialButton>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.5 2C4.5 2 2 4.5 2 7.5v9C2 19.5 4.5 22 7.5 22h9c3 0 5.5-2.5 5.5-5.5v-9C22 4.5 19.5 2 16.5 2h-9Zm9.5 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 6.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
              </svg>
            </SocialButton>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-600/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex justify-between items-center">
          <span>© 2026 {DASH_STRINGS.en.fedFull}. {t.rights}</span>
          <span className="font-arabic" dir="rtl">© ٢٠٢٦</span>
        </div>
      </div>
    </footer>
  );
}
