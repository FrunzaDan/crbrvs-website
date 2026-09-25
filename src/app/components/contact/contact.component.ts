import {
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { SendEmailService } from '../../services/send-email.service';
import { contactFormSchema, emptyContactForm } from './contact-form';

@Component({
  selector: 'app-contact',
  imports: [FormField, FormRoot],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ContactComponent {
  private readonly sendEmailService = inject(SendEmailService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private focusBeforeModal: HTMLElement | null = null;

  private readonly emailOkButton =
    viewChild<ElementRef<HTMLButtonElement>>('emailOkButton');

  readonly isEmailModalOpen = signal(false);
  readonly emailPopUpHeader = signal('');
  readonly emailPopUpParagraph = signal('');

  readonly model = signal<ContactMeForm>(emptyContactForm());
  readonly contactForm = form(this.model, contactFormSchema, {
    submission: {
      action: () => this.send(),
      onInvalid: (field) =>
        field().errorSummary()[0]?.fieldTree().focusBoundControl(),
    },
  });

  private async send(): Promise<void> {
    this.openEmailModal();
    this.emailPopUpHeader.set('Hi, ' + this.model().name);
    this.emailPopUpParagraph.set('Sending...');

    try {
      await this.sendEmailService.sendEmailJS(this.model());
      this.emailPopUpParagraph.set('Your message was successfully sent!');
      this.contactForm().reset(emptyContactForm());
    } catch (error: unknown) {
      console.error('Error sending the contact message:', error);
      this.emailPopUpParagraph.set(
        'Our servers are full, please send an E-mail to crbrvsraps@gmail.com.',
      );
    }
  }

  /** Opens the popup and moves keyboard focus into it, remembering where it came from. */
  private openEmailModal(): void {
    const active = this.document.activeElement;
    this.focusBeforeModal = active instanceof HTMLElement ? active : null;
    this.isEmailModalOpen.set(true);
    afterNextRender(() => this.emailOkButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  closeEmailModal(): void {
    this.isEmailModalOpen.set(false);
    this.focusBeforeModal?.focus({ preventScroll: true });
    this.focusBeforeModal = null;
  }

  onEscape(): void {
    if (this.isEmailModalOpen()) {
      this.closeEmailModal();
    }
  }
}
