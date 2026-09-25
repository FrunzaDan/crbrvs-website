import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MerchItem } from '../../interfaces/merch-item';
import { MerchCatalogService } from '../../services/merch-catalog.service';
import { ScrollerService } from '../../services/scroller.service';
import { trapTabKey } from '../../shared/focus-trap';

@Component({
  selector: 'app-merch',
  imports: [NgOptimizedImage],
  templateUrl: './merch.component.html',
  styleUrl: './merch.component.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class MerchComponent {
  private readonly merchCatalog = inject(MerchCatalogService);
  private readonly scrollerService = inject(ScrollerService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private focusBeforeModal: HTMLElement | null = null;

  readonly merchScrollContainer = viewChild<ElementRef<HTMLElement>>(
    'merchScrollContainer',
  );
  private readonly merchModal =
    viewChild<ElementRef<HTMLElement>>('merchModal');

  readonly merchItems = this.merchCatalog.items;
  readonly hasLoadError = this.merchCatalog.hasLoadError;
  readonly selectedMerchItem = signal<MerchItem | null>(null);
  readonly isMerchModalOpen = computed(() => this.selectedMerchItem() !== null);

  scrollLeft(): void {
    const merchScrollContainer = this.merchScrollContainer();
    if (merchScrollContainer) {
      this.scrollerService.scrollToLeft(merchScrollContainer.nativeElement);
    }
  }

  scrollRight(): void {
    const merchScrollContainer = this.merchScrollContainer();
    if (merchScrollContainer) {
      this.scrollerService.scrollToRight(merchScrollContainer.nativeElement);
    }
  }

  /** Opens the modal and moves keyboard focus into it, remembering where it came from. */
  openMerchItemModal(merchItem: MerchItem): void {
    const active = this.document.activeElement;
    this.focusBeforeModal = active instanceof HTMLElement ? active : null;
    this.selectedMerchItem.set(merchItem);
    afterNextRender(
      () => this.merchModal()?.nativeElement.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }

  closeMerchItemModal(): void {
    this.selectedMerchItem.set(null);
    this.focusBeforeModal?.focus({ preventScroll: true });
    this.focusBeforeModal = null;
  }

  onEscape(): void {
    if (this.isMerchModalOpen()) {
      this.closeMerchItemModal();
    }
  }

  onModalKeydown(event: KeyboardEvent): void {
    const modal = this.merchModal()?.nativeElement;
    if (event.key === 'Tab' && modal) {
      trapTabKey(event, modal);
    }
  }
}
