import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MerchItem } from '../../interfaces/merch-item';
import { LoadMerchService } from '../../services/load-merch.service';
import { ScrollerService } from '../../services/scroller.service';

@Component({
  selector: 'app-merch',
  imports: [NgOptimizedImage],
  templateUrl: './merch.component.html',
  styleUrl: './merch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchComponent implements OnInit {
  private readonly loadMerchService = inject(LoadMerchService);
  readonly scrollerService = inject(ScrollerService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private focusBeforeModal: HTMLElement | null = null;

  readonly merchScrollContainer = viewChild<ElementRef>('merchScrollContainer');
  readonly merchModal = viewChild<ElementRef<HTMLElement>>('merchModal');

  merchItems = signal<MerchItem[]>([]);
  selectedMerchItem = signal<MerchItem | null>(null);
  isMerchModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const loadedSongs = this.loadMerchService.loadMerch();
    this.merchItems.set(loadedSongs);
  }

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

  openMerchItemModal(merchItem: MerchItem): void {
    const active = this.document.activeElement;
    this.focusBeforeModal = active instanceof HTMLElement ? active : null;
    this.isMerchModalOpen.set(true);
    this.selectedMerchItem.set(merchItem);
    afterNextRender(() => this.merchModal()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  closeMerchItemModal(): void {
    this.isMerchModalOpen.set(false);
    this.selectedMerchItem.set(null);
    this.focusBeforeModal?.focus({ preventScroll: true });
    this.focusBeforeModal = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMerchModalOpen()) {
      this.closeMerchItemModal();
    }
  }

  /** Keeps Tab / Shift+Tab inside the open modal. */
  onModalKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const modal = this.merchModal()?.nativeElement;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;

    if (event.shiftKey && (active === first || active === modal)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
