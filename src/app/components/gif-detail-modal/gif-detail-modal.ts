import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { Gif } from '../../models/gif.model';

@Component({
  imports: [DatePipe, NgOptimizedImage],
  selector: 'app-gif-detail-modal',
  styleUrl: './gif-detail-modal.css',
  templateUrl: './gif-detail-modal.html',
})
export class GifDetailModal {
  readonly gif = input.required<Gif>();
  readonly closed = output<void>();
  private readonly dialogElement = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialogElement()?.nativeElement;
      if (dialog && !dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    });
  }

  protected close(): void {
    const dialog = this.dialogElement()?.nativeElement;
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      this.onDialogClosed();
    }
  }

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onDialogClosed(): void {
    this.closed.emit();
  }
}
