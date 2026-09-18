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
});
