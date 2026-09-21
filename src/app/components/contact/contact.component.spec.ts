import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SendEmailService } from '../../services/send-email.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let component: ContactComponent;
  let sendEmailService: { sendEmailJS: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sendEmailService = { sendEmailJS: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        { provide: SendEmailService, useValue: sendEmailService },
      ],
    });

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.contactMeForm.setValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      from_message: 'Hello there',
    });
  }

  describe('validation getters', () => {
    it('report no errors before the form is submitted', () => {
      expect(component.isNameInvalid).toBe(false);
      expect(component.isEmailInvalid).toBe(false);
      expect(component.isMessageInvalid).toBe(false);
    });

    it('report errors for empty required fields after submission', async () => {
      await component.onSubmit();

      expect(component.isNameInvalid).toBe(true);
      expect(component.isEmailInvalid).toBe(true);
      expect(component.isMessageInvalid).toBe(true);
      expect(sendEmailService.sendEmailJS).not.toHaveBeenCalled();
    });

    it('flags an invalid email format after submission', async () => {
      component.contactMeForm.setValue({
        name: 'Jane Doe',
        email: 'not-an-email',
        from_message: 'Hello there',
      });

      await component.onSubmit();

      expect(component.isEmailInvalid).toBe(true);
      expect(component.isNameInvalid).toBe(false);
      expect(component.isMessageInvalid).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('does not call the email service when the form is invalid', async () => {
      await component.onSubmit();

      expect(sendEmailService.sendEmailJS).not.toHaveBeenCalled();
      expect(component.isEmailModalOpen()).toBe(false);
    });

    it('opens the modal and shows a success message on a 200 response', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockResolvedValue(200);

      await component.onSubmit();

      expect(sendEmailService.sendEmailJS).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        from_message: 'Hello there',
      });
      expect(component.isEmailModalOpen()).toBe(true);
      expect(component.emailPopUpHeader()).toBe('Hi, Jane Doe');
      expect(component.emailPopUpParagraph()).toBe(
        'Your message was successfully sent! ',
      );
    });

    it('shows a failure message when the service returns a non-200 response', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockResolvedValue(503);

      await component.onSubmit();

      expect(component.emailPopUpParagraph()).toBe(
        '(503) Our servers are full, please send an E-mail to crbrvsraps@gmail.com.',
      );
    });

    it('shows a failure message when the service throws', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockRejectedValue(new Error('network error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await component.onSubmit();

      expect(component.emailPopUpParagraph()).toBe(
        '(500) Our servers are full, please send an E-mail to crbrvsraps@gmail.com.',
      );
    });

    it('resets the form after a successful submission', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockResolvedValue(200);

      await component.onSubmit();

      expect(component.contactMeForm.value).toEqual({
        name: null,
        email: null,
        from_message: null,
      });
      expect(component.submitted()).toBe(false);
    });

    it('also resets the form after a failed submission, discarding the typed message', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockResolvedValue(503);

      await component.onSubmit();

      expect(component.contactMeForm.value).toEqual({
        name: null,
        email: null,
        from_message: null,
      });
      expect(component.submitted()).toBe(false);
    });

    it('also resets the form after the email service throws', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockRejectedValue(new Error('network error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await component.onSubmit();

      expect(component.contactMeForm.value).toEqual({
        name: null,
        email: null,
        from_message: null,
      });
    });

    it('leaves the form untouched when validation fails, so the user can fix and resubmit', async () => {
      component.contactMeForm.setValue({
        name: 'Jane Doe',
        email: 'not-an-email',
        from_message: 'Hello there',
      });

      await component.onSubmit();

      expect(component.contactMeForm.value).toEqual({
        name: 'Jane Doe',
        email: 'not-an-email',
        from_message: 'Hello there',
      });
    });
  });

  describe('closeEmailModal', () => {
    it('closes the modal', async () => {
      fillValidForm();
      sendEmailService.sendEmailJS.mockResolvedValue(200);
      await component.onSubmit();
      expect(component.isEmailModalOpen()).toBe(true);

      component.closeEmailModal();

      expect(component.isEmailModalOpen()).toBe(false);
    });
  });

  describe('accessibility', () => {
    const field = (id: string) =>
      fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

    it('uses autocomplete tokens that match the field purpose', () => {
      expect(field('name').getAttribute('autocomplete')).toBe('name');
      expect(field('email').getAttribute('autocomplete')).toBe('email');
    });

    it('marks all fields as required for assistive technology', () => {
      for (const id of ['name', 'email', 'from_message']) {
        expect(field(id).getAttribute('aria-required')).toBe('true');
      }
    });

    it('does not flag fields as invalid before submission', () => {
      for (const id of ['name', 'email', 'from_message']) {
        expect(field(id).hasAttribute('aria-invalid')).toBe(false);
        expect(field(id).hasAttribute('aria-describedby')).toBe(false);
      }
    });

    it('links each invalid field to its error message after a failed submit', async () => {
      await component.onSubmit();
      fixture.detectChanges();

      const expected: Record<string, string> = {
        name: 'name-error',
        email: 'email-error',
        from_message: 'message-error',
      };
      for (const [id, errorId] of Object.entries(expected)) {
        expect(field(id).getAttribute('aria-invalid')).toBe('true');
        expect(field(id).getAttribute('aria-describedby')).toBe(errorId);
        expect(document.getElementById(errorId)?.textContent).toMatch(
          /required/,
        );
      }
    });

    describe('result popup', () => {
      async function submitValidForm(): Promise<HTMLButtonElement> {
        sendEmailService.sendEmailJS.mockResolvedValue(200);
        fillValidForm();
        const submit = fixture.nativeElement.querySelector(
          'button[type="submit"]',
        ) as HTMLButtonElement;
        submit.focus();
        await component.onSubmit();
        fixture.detectChanges();
        await fixture.whenStable();
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
          popup.querySelector('#email-popup-text-paragraph')?.getAttribute(
            'aria-live',
          ),
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
