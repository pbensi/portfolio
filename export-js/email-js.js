export class EmailJs {
    constructor() {
        this.isSubmitting = false;
    }

    init() {
        (function () {
            emailjs.init({
                publicKey: "udi6m4ontdyTBDWOD",
            });
        })();
    }

    sendEmail(btnEmailId, companyId, emailId, messageId, alertoId) {

        if (this.isSubmitting || sessionStorage.getItem('isSubmitting') === 'true') {
            this.#alertMessage('Please wait', alertoId, 'wait-mark');
            return;
        }

        const company = document.querySelector(`#${companyId}`).value.trim();
        const email = document.querySelector(`#${emailId}`).value.trim();
        const message = document.querySelector(`#${messageId}`).value.trim();

        if (!company || !email || !message) {
            this.#alertMessage('All fields are required.', alertoId, 'failed-mark');
            return;
        }

        if (!this.#validateEmail(email)) {
            this.#alertMessage('Invalid email', alertoId, 'failed-mark');
            return;
        }

        this.isSubmitting = true;
        sessionStorage.setItem('isSubmitting', 'true');

        document.querySelector(`#${btnEmailId}`).disabled = true;

        let params = {
            company: company,
            email: email,
            message: message,
        }

        emailjs.send('service_atr3mdm', 'template_2ar7qqd', params).then(
            (response) => {
                this.#alertMessage('Email sent successfully!', alertoId, 'success-mark');

                document.querySelector(`#${companyId}`).value = '';
                document.querySelector(`#${emailId}`).value = '';
                document.querySelector(`#${messageId}`).value = '';

                this.isSubmitting = false;
                sessionStorage.removeItem('isSubmitting');
                document.querySelector(`#${btnEmailId}`).disabled = false;

                console.log('SUCCESS!', response.status, response.text);
            },
            (error) => {
                console.log('FAILED...', error);
                sessionStorage.removeItem('isSubmitting');
                alert('something went wrong.');
                window.location.reload();
            }
        );
    }

    #validateEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

 #alertMessage(message, alertoId, typeMessage) {
        const alertTo = document.querySelector(`#${alertoId}`);
        
        const newAlert = document.createElement('div');
        newAlert.textContent = message;
        newAlert.classList.add('alert-message', typeMessage);
        alertTo.appendChild(newAlert);

        const previousAlerts = alertTo.querySelectorAll('.alert-message');
        if (previousAlerts.length > 1) {
            const oldAlert = previousAlerts[0];
            oldAlert.classList.add('fade-out');

            setTimeout(() => {
                oldAlert.remove();
            }, 300);
        }

        setTimeout(() => {
            newAlert.classList.add('fade-out');
            setTimeout(() => {
                newAlert.remove();
            }, 300);
        }, 3000);
    }
}