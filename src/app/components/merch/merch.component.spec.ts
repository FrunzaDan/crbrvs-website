import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MerchItem } from '../../interfaces/merch-item';
import { LoadMerchService } from '../../services/load-merch.service';
import { ScrollerService } from '../../services/scroller.service';
import { MerchComponent } from './merch.component';

describe('MerchComponent', () => {
  let fixture: ComponentFixture<MerchComponent>;
  let component: MerchComponent;
  let scrollerService: {
    scrollToLeft: ReturnType<typeof vi.fn>;
    scrollToRight: ReturnType<typeof vi.fn>;
  };

  const merchItems: MerchItem[] = [
    {
      id: 1,
      title: 'Tee',
      price: 100,
      src: '/tee.png',
      width: 300,
      height: 300,
      description: 'A shirt',
    },
    {
      id: 2,
      title: 'Hoodie',
      price: 200,
      src: '/hoodie.png',
      width: 300,
      height: 300,
      description: 'A hoodie',
    },
  ];

  beforeEach(() => {
    scrollerService = { scrollToLeft: vi.fn(), scrollToRight: vi.fn() };

    TestBed.configureTestingModule({
      imports: [MerchComponent],
      providers: [
        {
          provide: LoadMerchService,
          useValue: { loadMerch: vi.fn().mockReturnValue(merchItems) },
        },
        { provide: ScrollerService, useValue: scrollerService },
      ],
    });

    fixture = TestBed.createComponent(MerchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads merch items from the service on init', () => {
    expect(component.merchItems()).toEqual(merchItems);
  });

  it('starts with the modal closed and no item selected', () => {
    expect(component.isMerchModalOpen()).toBe(false);
    expect(component.selectedMerchItem()).toBeNull();
  });

  describe('openMerchItemModal / closeMerchItemModal', () => {
    it('opens the modal with the selected item', () => {
      component.openMerchItemModal(merchItems[1]);

      expect(component.isMerchModalOpen()).toBe(true);
      expect(component.selectedMerchItem()).toEqual(merchItems[1]);
    });

    it('closes the modal and clears the selected item', () => {
      component.openMerchItemModal(merchItems[0]);

      component.closeMerchItemModal();

      expect(component.isMerchModalOpen()).toBe(false);
      expect(component.selectedMerchItem()).toBeNull();
    });
  });

  describe('scrollLeft / scrollRight', () => {
    it('delegates to the scroller service with the scroll container element', () => {
      component.scrollLeft();
      component.scrollRight();

      const container = component.merchScrollContainer()!.nativeElement;
      expect(scrollerService.scrollToLeft).toHaveBeenCalledWith(container);
      expect(scrollerService.scrollToRight).toHaveBeenCalledWith(container);
    });

    it('does nothing when the scroll container is not available', () => {
      vi.spyOn(component, 'merchScrollContainer').mockReturnValue(undefined);

      component.scrollLeft();
      component.scrollRight();

      expect(scrollerService.scrollToLeft).not.toHaveBeenCalled();
      expect(scrollerService.scrollToRight).not.toHaveBeenCalled();
    });
  });

  describe('DOM wiring', () => {
    it('opens the modal when a merch card button is clicked', () => {
      const button = fixture.nativeElement.querySelector(
        '.merch-card button',
      ) as HTMLButtonElement;

      button.click();
      fixture.detectChanges();

      expect(component.isMerchModalOpen()).toBe(true);
      expect(component.selectedMerchItem()).toEqual(merchItems[0]);
    });

    it('scrolls left and right when the transport buttons are clicked', () => {
      const leftButton = fixture.nativeElement.querySelector(
        '[aria-label="Scroll merch left"]',
      ) as HTMLButtonElement;
      const rightButton = fixture.nativeElement.querySelector(
        '[aria-label="Scroll merch right"]',
      ) as HTMLButtonElement;

      leftButton.click();
      rightButton.click();

      expect(scrollerService.scrollToLeft).toHaveBeenCalled();
      expect(scrollerService.scrollToRight).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    const modal = (): HTMLElement | null =>
      fixture.nativeElement.querySelector('.get-merch-modal');

    async function openModal(): Promise<HTMLButtonElement> {
      const opener = fixture.nativeElement.querySelector(
        '.merch-card button',
      ) as HTMLButtonElement;
      opener.focus();
      opener.click();
      fixture.detectChanges();
      await fixture.whenStable();
      return opener;
    }

    function pressKey(target: EventTarget, key: string, shiftKey = false) {
      const event = new KeyboardEvent('keydown', {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    }

    it('names each card button and image after the specific item', () => {
      const buttons = fixture.nativeElement.querySelectorAll(
        '.merch-card button',
      ) as NodeListOf<HTMLButtonElement>;
      const images = fixture.nativeElement.querySelectorAll(
        '.merch-card img',
      ) as NodeListOf<HTMLImageElement>;

      expect(buttons[0].getAttribute('aria-label')).toBe(
        'Seems interesting: A shirt',
      );
      expect(buttons[1].getAttribute('aria-label')).toBe(
        'Seems interesting: A hoodie',
      );
      expect(images[0].alt).toBe('A shirt - CRBRVS merch');
      expect(images[1].alt).toBe('A hoodie - CRBRVS merch');
    });

    it('renders the open modal as a labelled, modal dialog', async () => {
      await openModal();

      const dialog = modal()!;
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      const heading = document.getElementById(
        dialog.getAttribute('aria-labelledby')!,
      );
      expect(heading?.textContent).toContain('Tee');
    });

    it('moves focus into the dialog when it opens', async () => {
      await openModal();

      expect(document.activeElement).toBe(modal());
    });

    it('closes on Escape and returns focus to the button that opened it', async () => {
      const opener = await openModal();

      pressKey(document, 'Escape');

      expect(component.isMerchModalOpen()).toBe(false);
      expect(document.activeElement).toBe(opener);
    });

    it('ignores Escape while the modal is closed', () => {
      pressKey(document, 'Escape');

      expect(component.isMerchModalOpen()).toBe(false);
    });

    it('wraps Tab from the last control to the first', async () => {
      await openModal();
      const controls = modal()!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      last.focus();

      const event = pressKey(modal()!, 'Tab');

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(first);
    });

    it('wraps Shift+Tab from the dialog itself to the last control', async () => {
      await openModal();
      const controls = modal()!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );

      const event = pressKey(modal()!, 'Tab', true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(controls[controls.length - 1]);
    });

    it('leaves Tab alone when focus is in the middle of the dialog', async () => {
      await openModal();
      const controls = modal()!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      controls[0].focus();

      const event = pressKey(modal()!, 'Tab');

      expect(event.defaultPrevented).toBe(false);
    });

    it('offers Call and E-mail as links without nesting a button inside', async () => {
      await openModal();

      const links = modal()!.querySelectorAll('a.button-link');
      expect(links.length).toBe(2);
      expect(links[0].getAttribute('href')).toMatch(/^tel:/);
      expect(links[1].getAttribute('href')).toMatch(/^mailto:/);
      expect(modal()!.querySelector('a button')).toBeNull();
    });

    it('hides the click-away backdrop from assistive technology', async () => {
      await openModal();

      const backdrop = fixture.nativeElement.querySelector(
        '.full-view-background',
      ) as HTMLElement;
      expect(backdrop.getAttribute('aria-hidden')).toBe('true');
      expect(backdrop.hasAttribute('tabindex')).toBe(false);

      backdrop.click();
      expect(component.isMerchModalOpen()).toBe(false);
    });
  });
});
