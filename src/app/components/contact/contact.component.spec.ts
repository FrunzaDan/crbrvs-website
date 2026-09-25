import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { SendEmailService } from '../../services/send-email.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let component: ContactComponent;
  let sendEmailService: { sendEmailJS: ReturnType<typeof vi.fn> };

  const validForm: ContactMeForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello there',
  };

  const field = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;

  const submitForm = async (): Promise<void> => {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    sendEmailService = { sendEmailJS: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [{ provide: SendEmailService, useValue: sendEmailService }],
    });

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('validation', () => {
    it('requires every field', () => {
      expect(component.contactForm().invalid()).toBe(true);
      expect(component.contactForm.name().errors()[0].message).toBe(
        'Your name is required.',
      );
      expect(component.contactForm.email().errors()[0].message).toBe(
        'Your E-mail is required.',
      );
      expect(component.contactForm.message().errors()[0].message).toBe(
        'A message is required.',
      );
    });

    it('flags an invalid email format', () => {
      component.model.set({ ...validForm, email: 'not-an-email' });

      expect(component.contactForm.email().errors()[0].message).toBe(
        'A valid E-mail is required.',
      );
    });

    it('does not accept a message of only spaces', () => {
      component.model.set({ ...validForm, message: '   ' });

      expect(component.contactForm.message().invalid()).toBe(true);
    });

    it('accepts a filled-in form', () => {
      component.model.set(validForm);

      expect(component.contactForm().valid()).toBe(true);
    });
  });

  describe('submitting', () => {
    it('does not call the email service when the form is invalid', async () => {
      await submitForm();

      expect(sendEmailService.sendEmailJS).not.toHaveBeenCalled();
      expect(component.isEmailModalOpen()).toBe(false);
    });

    it('opens the modal and shows a success message when the email is sent', async () => {
      sendEmailService.sendEmailJS.mockResolvedValue(undefined);
      component.model.set(validForm);

      await submitForm();

      expect(sendEmailService.sendEmailJS).toHaveBeenCalledWith(validForm);
      expect(component.isEmailModalOpen()).toBe(true);
      expect(component.emailPopUpHeader()).toBe('Hi, Jane Doe');
      expect(component.emailPopUpParagraph()).toBe(
        'Your message was successfully sent!',
      );
    });

    it('resets the form after a successful submission', async () => {
      sendEmailService.sendEmailJS.mockResolvedValue(undefined);
      component.model.set(validForm);

      await submitForm();

      expect(component.model()).toEqual({ name: '', email: '', message: '' });
      expect(component.contactForm.name().touched()).toBe(false);
    });

    it('shows a failure message and keeps what was typed when sending fails', async () => {
      sendEmailService.sendEmailJS.mockRejectedValue(new Error('network'));
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      component.model.set(validForm);

      await submitForm();

      expect(component.isEmailModalOpen()).toBe(true);
      expect(component.emailPopUpParagraph()).toContain('crbrvsraps@gmail.com');
      expect(component.model()).toEqual(validForm);
    });

    it('leaves the form as it is when validation fails, so it can be fixed and resubmitted', async () => {
      component.model.set({ ...validForm, email: 'nope' });

      await submitForm();

      expect(component.model()).toEqual({ ...validForm, email: 'nope' });
    });
  });

  describe('closeEmailModal', () => {
    it('closes the modal', async () => {
      sendEmailService.sendEmailJS.mockResolvedValue(undefined);
      component.model.set(validForm);
      await submitForm();

      component.closeEmailModal();

      expect(component.isEmailModalOpen()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('uses autocomplete tokens that match the field purpose', () => {
      expect(field('name').getAttribute('autocomplete')).toBe('name');
      expect(field('email').getAttribute('autocomplete')).toBe('email');
    });

    it('marks all fields as required for assistive technology', () => {
      for (const id of ['name', 'email', 'message']) {
        expect(field(id).required).toBe(true);
      }
    });

    it('does not flag fields as invalid before they are touched', () => {
      for (const id of ['name', 'email', 'message']) {
        expect(field(id).getAttribute('aria-invalid')).not.toBe('true');
        expect(field(id).hasAttribute('aria-describedby')).toBe(false);
      }
    });

    it('links each invalid field to its error message after a failed submit', async () => {
      await submitForm();

      for (const id of ['name', 'email', 'message']) {
        expect(field(id).getAttribute('aria-invalid')).toBe('true');
        expect(field(id).getAttribute('aria-describedby')).toBe(`${id}-error`);
        expect(document.getElementById(`${id}-error`)?.textContent).toMatch(
          /required/,
        );
      }
    });

    it('moves focus to the first invalid field after a failed submit', async () => {
      component.model.set({ ...validForm, email: '' });

      await submitForm();

      expect(document.activeElement).toBe(field('email'));
    });

    describe('result popup', () => {
      async function submitValidForm(): Promise<HTMLButtonElement> {
        sendEmailService.sendEmailJS.mockResolvedValue(undefined);
        component.model.set(validForm);
        const submit = fixture.nativeElement.querySelector(
          'button[type="submit"]',
        ) as HTMLButtonElement;
        submit.focus();
        await submitForm();
        return submit;
      }

      it('is a labelled dialog whose status text is announced politely', async () => {
        await submitValidForm();

        const popup = fixture.nativeElement.querySelector(
          '.send-email-modal',
        ) as HTMLElement;
        expect(popup.getAttribute('role')).toBe('dialog');
        expect(popup.getAttribute('aria-labelledby')).toBe(
          'email-popup-text-header',
        );
        expect(
          popup
            .querySelector('#email-popup-text-paragraph')
            ?.getAttribute('aria-live'),
        ).toBe('polite');
      });

      it('moves focus to the OK button when it opens', async () => {
        await submitValidForm();

        const ok = fixture.nativeElement.querySelector(
          '.send-email-modal button',
        );
        expect(document.activeElement).toBe(ok);
      });

      it('closes on Escape and returns focus to the submit button', async () => {
        const submit = await submitValidForm();

        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );

        expect(component.isEmailModalOpen()).toBe(false);
        expect(document.activeElement).toBe(submit);
      });

      it('ignores Escape while the popup is closed', () => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );

        expect(component.isEmailModalOpen()).toBe(false);
      });
    });
  });
});
