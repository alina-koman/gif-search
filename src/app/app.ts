import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Gif } from './models/gif.model';
import { GifService } from './services/gif';
import { GifDetailModal } from './components/gif-detail-modal/gif-detail-modal';
import { GifGrid } from './components/gif-grid/gif-grid';
import { SearchBar } from './components/search-bar/search-bar';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  imports: [GifDetailModal, GifGrid, SearchBar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly gifService = inject(GifService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();

  protected readonly gifs = signal<Gif[]>([]);
  protected readonly query = signal('');
  protected readonly status = signal<SearchStatus>('idle');
  protected readonly selectedGif = signal<Gif | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly loadingPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly currentYear = new Date().getFullYear();
  private lastDetailTrigger: HTMLButtonElement | null = null;

  ngOnInit(): void {
    this.searchTerms
      .pipe(
        switchMap((query) => {
          this.query.set(query);
          this.errorMessage.set('');

          if (!query) {
            this.gifs.set([]);
            this.status.set('idle');
            return EMPTY;
          }

          this.status.set('loading');

          return this.gifService.searchGifs(query).pipe(
            tap((response) => {
              this.gifs.set(response.data);
              this.status.set('success');
            }),
            catchError(() => {
              this.gifs.set([]);
              this.status.set('error');
              this.errorMessage.set(
                'Не вдалося завантажити GIF. Перевірте з’єднання та спробуйте ще раз.',
              );
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected search(query: string): void {
    this.searchTerms.next(query.trim());
  }

  protected selectGif(selection: { gif: Gif; trigger: HTMLButtonElement }): void {
    this.lastDetailTrigger = selection.trigger;
    this.selectedGif.set(selection.gif);
  }

  protected closeDetails(): void {
    this.selectedGif.set(null);
    queueMicrotask(() => this.lastDetailTrigger?.focus());
  }
}
