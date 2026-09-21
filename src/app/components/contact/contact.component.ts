import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SendEmailService } from '../../services/send-email.service';
import { ContactMeForm } from '../../interfaces/contact-me-form';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly sendEmailService = inject(SendEmailService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private focusBeforeModal: HTMLElement | null = null;

  readonly emailOkButton = viewChild<ElementRef<HTMLButtonElement>>('emailOkButton');

  isEmailModalOpen = signal(false);
  emailPopUpHeader = signal('');
  emailPopUpParagraph = signal('');
  submitted = signal(false);

  contactMeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    from_message: new FormControl('', [Validators.required]),
  });

  get name() {
    return this.contactMeForm.get('name');
  }
  get email() {
    return this.contactMeForm.get('email');
  }
  get from_message() {
    return this.contactMeForm.get('from_message');
  }

  get isNameInvalid(): boolean {
    return !!(this.submitted() && this.name?.errors);
  }

  get isEmailInvalid(): boolean {
    return !!(this.submitted() && this.email?.errors);
  }

  get isMessageInvalid(): boolean {
    return !!(this.submitted() && this.from_message?.errors);
  }

  async onSubmit() {
    this.submitted.set(true);

    if (this.contactMeForm.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.contactMeForm.controls).forEach((key) => {
        const control = this.contactMeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.openEmailModal();
    this.emailPopUpHeader.set('Hi, ' + this.contactMeForm.value.name);
    this.emailPopUpParagraph.set('Sending...');

    try {
      const responseCode = await this.sendEmailService.sendEmailJS(
        this.contactMeForm.value as ContactMeForm,
      );

      if (responseCode === 200) {
        this.handleSuccessfulSubmission();
      } else {
        this.handleFailedSubmission(responseCode);
      }
    } catch (error) {
      this.handleFailedSubmission(500);
      console.error('Error sending email:', error);
    }
    this.resetForm();
  }

  private handleSuccessfulSubmission(): void {
    this.emailPopUpParagraph.set('Your message was successfully sent! ');
  }

  private handleFailedSubmission(responseCode: number): void {
    this.emailPopUpParagraph.set(
      `(${responseCode}) Our servers are full, please send an E-mail to crbrvsraps@gmail.com.`,
    );
  }

  private resetForm(): void {
    this.submitted.set(false);
    this.contactMeForm.reset();
    Object.keys(this.contactMeForm.controls).forEach((key) => {
      const control = this.contactMeForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.updateValueAndValidity();
    });
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

  closeEmailModal() {
    this.isEmailModalOpen.set(false);
    this.focusBeforeModal?.focus({ preventScroll: true });
    this.focusBeforeModal = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isEmailModalOpen()) {
      this.closeEmailModal();
    }
  }
}
