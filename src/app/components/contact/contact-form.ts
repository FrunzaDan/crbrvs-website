import { email, pattern, required, schema } from '@angular/forms/signals';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { NOT_BLANK } from '../../shared/form-patterns';

export const emptyContactForm = (): ContactMeForm => ({
  name: '',
  email: '',
  message: '',
});

export const contactFormSchema = schema<ContactMeForm>((p) => {
  required(p.name, { message: 'Your name is required.' });
  pattern(p.name, NOT_BLANK, { message: 'Your name is required.' });

  required(p.email, { message: 'Your E-mail is required.' });
  email(p.email, { message: 'A valid E-mail is required.' });

  required(p.message, { message: 'A message is required.' });
  pattern(p.message, NOT_BLANK, { message: 'A message is required.' });
});
