import html from "./contact.html?raw";
import css from "./contact.css?raw";
import ContactDetail from "../contact-detail/contact-detail";
import { Component } from "../../core/component.decorator";
import BaseComponent from "../../core/component";

declare global {
    interface Window {
        google: any;
    }
}

@Component({
    tag: "app-contact",
    template: html,
    styles: css,
    components: [ContactDetail],
})
export default class Contact extends BaseComponent {
    private form!: HTMLFormElement;
    private company!: HTMLInputElement;
    private message!: HTMLTextAreaElement;
    private submitBtn!: HTMLButtonElement;

    private googleOverlay!: HTMLDivElement;
    private googleBtnContainer!: HTMLDivElement;

    private toast!: HTMLDivElement;
    private toastTitle!: HTMLHeadingElement;
    private toastMsg!: HTMLParagraphElement;

    private loggedIn = false;
    private credential: string | null = null;
    private isSending = false;
    private googleReady = false;

    private toastTimeout?: number;

    private readonly SESSION_KEY = "auth_session_token";
    private readonly GOOGLE_CLIENT_ID = "1021002728994-fhehncrl19bvlefvc92n0nhlrjt4mn6m.apps.googleusercontent.com";
    private readonly SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNhqpoVLzY5lGmBY3qSNjQaUYuPp4opiDvmWorx5NFWGFieCIMcJuyIOvrqknpl-vv/exec";

    public onInit(): void {
        this.cache(this.shadowRoot!);
        this.bind();
        this.checkSession();
        this.loadGoogleScript();
    }

    private cache(shadow: ShadowRoot) {
        this.form = shadow.querySelector("#contactForm")!;
        this.company = shadow.querySelector("#company")!;
        this.message = shadow.querySelector("#message")!;
        this.submitBtn = shadow.querySelector("#submitBtn")!;
        this.googleOverlay = shadow.querySelector("#googleOverlay")!;
        this.googleBtnContainer = shadow.querySelector("#googleBtnContainer")!;
        this.toast = shadow.querySelector("#statusToast")!;
        this.toastTitle = shadow.querySelector("#statusTitle")!;
        this.toastMsg = shadow.querySelector("#statusMsg")!;
    }

    private bind() {
        this.company.addEventListener("input", this.updateState);
        this.message.addEventListener("input", this.updateState);
        this.form.addEventListener("submit", this.handleSubmit);
    }

    private checkSession() {
        const token = sessionStorage.getItem(this.SESSION_KEY);
        if (token) {
            this.credential = token;
            this.loggedIn = true;
            this.hideOverlay();
        }
        this.updateState();
    }

    private loadGoogleScript() {
        if (window.google?.accounts?.id) {
            this.initGoogle();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => this.initGoogle();
        document.head.appendChild(script);
    }

    private initGoogle() {
        if (!window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
            client_id: this.GOOGLE_CLIENT_ID,
            callback: (res: any) => this.onGoogleLogin(res.credential),
        });

        this.googleReady = true;
        requestAnimationFrame(() => this.renderGoogleButton());
    }

    private renderGoogleButton() {
        if (!this.googleReady || !this.googleBtnContainer) return;

        this.googleBtnContainer.innerHTML = "";
        window.google.accounts.id.renderButton(this.googleBtnContainer, {
            theme: "outline",
            size: "large",
            shape: "pill",
        });
    }

    private onGoogleLogin(credential: string) {
        this.credential = credential;
        this.loggedIn = true;

        sessionStorage.setItem(this.SESSION_KEY, credential);
        this.hideOverlay();
        this.updateState();
    }

    private hideOverlay() {
        this.googleOverlay.classList.add("hidden");
    }

    private showOverlay() {
        this.googleOverlay.classList.remove("hidden");
        requestAnimationFrame(() => this.renderGoogleButton());
    }

    private updateState = () => {
        const valid =
            this.loggedIn &&
            this.company.value.trim().length > 0 &&
            this.message.value.trim().length > 0;

        this.submitBtn.disabled = !valid || this.isSending;
    };

    private handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (this.isSending) return;

        this.isSending = true;
        this.submitBtn.textContent = "Sending...";
        this.updateState();

        try {
            const formData = {
                token: this.credential,
                company: this.company.value.trim(),
                message: this.message.value.trim(),
                secret: "Frank-Site",
            };

            const response = await fetch(this.SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                this.toastShow("success", "Sent", result.message);
                this.form.reset();
            } else {
                this.toastShow("error", "Failed", result.message);
                this.form.reset();
            }
        } catch {
            this.toastShow("error", "Error", "Failed to send.");
        } finally {
            this.isSending = false;
            this.submitBtn.textContent = "Send Message";
            this.updateState();
        }
    };

    private toastShow(type: "success" | "error", title: string, msg: string) {
        this.toast.className = `status-toast ${type} active`;
        this.toastTitle.textContent = title;
        this.toastMsg.textContent = msg;

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = window.setTimeout(() => {
            this.toast.classList.remove("active");
            this.toastTimeout = undefined;
        }, 4000);
    }

    public onDestroy(): void {
        this.company.removeEventListener("input", this.updateState);
        this.message.removeEventListener("input", this.updateState);
        this.form.removeEventListener("submit", this.handleSubmit);

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = undefined;

        if (this.googleBtnContainer) this.googleBtnContainer.innerHTML = "";

        this.form = null!;
        this.company = null!;
        this.message = null!;
        this.submitBtn = null!;
        this.googleOverlay = null!;
        this.googleBtnContainer = null!;
        this.toast = null!;
        this.toastTitle = null!;
        this.toastMsg = null!;
    }
}
