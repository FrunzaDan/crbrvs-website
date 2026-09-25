import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';
import { ContactMeForm } from '../interfaces/contact-me-form';

@Injectable({
  providedIn: 'root',
})
export class SendEmailService {
  /** Resolves once EmailJS accepted the message and rejects with its error otherwise. */
  async sendEmailJS(contactMeForm: ContactMeForm): Promise<void> {
    // The keys are the variable names used by the EmailJS template.
    const templateParams = {
      name: contactMeForm.name,
      email: contactMeForm.email,
      from_message: contactMeForm.message,
    };

    await emailjs.send(
      environment.emailJSConfig.serviceID,
      environment.emailJSConfig.templateID,
      templateParams,
      environment.emailJSConfig.publicKey,
    );
  }
}
