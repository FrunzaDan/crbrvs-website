import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { environment } from '../../environments/environment';
import { ContactMeForm } from '../interfaces/contact-me-form';

@Injectable({
  providedIn: 'root',
})
export class SendEmailService {
  sendEmailJS(contactMeForm: ContactMeForm): Promise<number> {
    const params = {
      name: contactMeForm.name,
      email: contactMeForm.email,
      from_message: contactMeForm.from_message,
    };

    return emailjs
      .send(
        environment.emailJSConfig.serviceID,
        environment.emailJSConfig.templateID,
        params,
        environment.emailJSConfig.publicKey,
      )
      .then(
        (response: EmailJSResponseStatus) => {
          return response.status;
        },
        (error) => {
          console.error('Error sending email:', error);
          return 500;
        },
      );
  }
}
