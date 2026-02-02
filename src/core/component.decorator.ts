export interface ComponentConfig {
    tag: string;
    template?: string;
    styles?: string;
    components?: Array<typeof HTMLElement>;
}

export function Component(config: ComponentConfig) {
    return function (Target: typeof HTMLElement) {
        (Target as any).__tag = config.tag.toLowerCase();
        (Target as any).__template = config.template || "";
        (Target as any).__styles = config.styles || "";
        (Target as any).__components = config.components || [];

        if (!customElements.get((Target as any).__tag)) {
            customElements.define((Target as any).__tag, Target);
        }
    };
}
