import { EmailJs } from './export-js/email-js.js';

const email = new EmailJs();
email.init();

const btnEmail = document.querySelector('#btn-email');
btnEmail.addEventListener('click', () => {
    email.sendEmail('btn-email', 'company', 'email', 'message', 'alerto');
});
