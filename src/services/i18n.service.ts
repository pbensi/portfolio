export class I18nService {
    private static cache: Record<string, any> = {};
    private static fetchQueue: Record<string, Promise<any>> = {};
    public static currentData: any = {};

    static async loadLanguage(lang: string) {
        if (this.cache[lang]) {
            this.currentData = this.cache[lang];
            return;
        }
        if (!this.fetchQueue[lang]) {
            this.fetchQueue[lang] = fetch(`/assets/locals/${lang}.json`).then(r => r.json());
        }
        this.currentData = await this.fetchQueue[lang];
        this.cache[lang] = this.currentData;
    }

    static translate(key: string, args: any[] = []) {
        let text = this.currentData[key] ?? key;
        args.forEach((val, i) => (text = text.replace(`{${i}}`, String(val))));
        return text;
    }
}
