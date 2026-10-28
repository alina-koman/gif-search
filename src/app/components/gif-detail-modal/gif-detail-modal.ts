import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Gif } from '../../models/gif.model';
import { GifService } from '../../services/gif';

type GifAction = 'copy' | 'download' | null;

@Component({
  imports: [DatePipe, NgOptimizedImage],
  selector: 'app-gif-detail-modal',
  styleUrl: './gif-detail-modal.css',
  templateUrl: './gif-detail-modal.html',
})
export class GifDetailModal {
  readonly gif = input.required<Gif>();
  readonly closed = output<void>();
  protected readonly activeAction = signal<GifAction>(null);
  protected readonly actionMessage = signal('');
  private readonly gifService = inject(GifService);
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

  protected async copyLink(): Promise<void> {
    this.activeAction.set('copy');
    this.actionMessage.set('');

    try {
      await this.gifService.copyGifLink(this.gif().url);
      this.actionMessage.set('Посилання скопійовано.');
    } catch {
      this.actionMessage.set('Не вдалося скопіювати посилання. Перевірте дозволи браузера.');
    } finally {
      this.activeAction.set(null);
    }
  }

  protected async download(): Promise<void> {
    this.activeAction.set('download');
    this.actionMessage.set('');

    try {
      await this.gifService.downloadGif(this.gif().images.original.url, `gif-${this.gif().id}.gif`);
      this.actionMessage.set('Завантаження GIF розпочато.');
    } catch {
      this.actionMessage.set(
        'Не вдалося завантажити GIF. Можливо, сервер обмежує завантаження через CORS.',
      );
    } finally {
      this.activeAction.set(null);
    }
  }
}
