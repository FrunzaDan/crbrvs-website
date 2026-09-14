import { TestBed } from '@angular/core/testing';
import emailjs from '@emailjs/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { ContactMeForm } from '../interfaces/contact-me-form';
import { SendEmailService } from './send-email.service';

vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('SendEmailService', () => {
  let service: SendEmailService;

  const form: ContactMeForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    from_message: 'Hello there',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendEmailService);
    vi.mocked(emailjs.send).mockReset();
  });

  it('sends the form fields via emailjs using the configured credentials', async () => {
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });

    await service.sendEmailJS(form);

    expect(emailjs.send).toHaveBeenCalledWith(
      environment.emailJSConfig.serviceID,
      environment.emailJSConfig.templateID,
      {
        name: form.name,
        email: form.email,
        from_message: form.from_message,
      },
      environment.emailJSConfig.publicKey,
    );
  });

  it('resolves with the response status on success', async () => {
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });

    const status = await service.sendEmailJS(form);

    expect(status).toBe(200);
  });

  it('resolves with 500 and logs when emailjs rejects', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(emailjs.send).mockRejectedValue(new Error('network down'));

    const status = await service.sendEmailJS(form);

    expect(status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
