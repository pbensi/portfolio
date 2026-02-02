type StateChangeType = "theme" | "language";

export const AppState = {
    language: localStorage.getItem("app_lang") || "en",
    theme: localStorage.getItem("app_theme") || "default",

    setLanguage(lang: string) {
        if (this.language === lang) return;
        this.language = lang;
        localStorage.setItem("app_lang", lang);
        document.documentElement.lang = lang;
        window.dispatchEvent(new CustomEvent("state-change", { detail: { type: "language" as StateChangeType } }));
    },

    setTheme(theme: string) {
        if (this.theme === theme) return;
        this.theme = theme;
        localStorage.setItem("app_theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        window.dispatchEvent(new CustomEvent("state-change", { detail: { type: "theme" as StateChangeType } }));
    }
};
