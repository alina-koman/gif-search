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
type GifRequest = { query: string; offset: number; append: boolean };

@Component({
  imports: [GifDetailModal, GifGrid, SearchBar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly gifService = inject(GifService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<GifRequest>();

  protected readonly gifs = signal<Gif[]>([]);
  protected readonly query = signal('');
  protected readonly status = signal<SearchStatus>('idle');
  protected readonly selectedGif = signal<Gif | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly loadMoreError = signal('');
  protected readonly isLoadingMore = signal(false);
  protected readonly hasMore = signal(false);
  protected readonly loadingPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly currentYear = new Date().getFullYear();
  private lastDetailTrigger: HTMLButtonElement | null = null;
  private nextOffset = 0;

  ngOnInit(): void {
    this.requests
      .pipe(
        switchMap(({ query, offset, append }) => {
          if (!append) {
            this.query.set(query);
            this.gifs.set([]);
            this.hasMore.set(false);
            this.isLoadingMore.set(false);
          }

          if (!query) {
            this.status.set('idle');
            this.loadMoreError.set('');
            return EMPTY;
          }

          if (!append) {
            this.status.set('loading');
          } else {
            this.isLoadingMore.set(true);
          }

          this.errorMessage.set('');
          this.loadMoreError.set('');

          return this.gifService.searchGifs(query, 20, offset).pipe(
            tap((response) => {
              this.gifs.update((current) =>
                append ? [...current, ...response.data] : response.data,
              );
              this.nextOffset = response.pagination.offset + response.pagination.count;
              this.hasMore.set(
                response.pagination.count > 0 &&
                  this.nextOffset <= 4999 &&
                  this.nextOffset < response.pagination.total_count,
              );
              this.status.set('success');
              this.isLoadingMore.set(false);
            }),
            catchError(() => {
              if (append) {
                this.isLoadingMore.set(false);
                this.loadMoreError.set('Не вдалося завантажити наступні GIF. Спробуйте ще раз.');
              } else {
                this.gifs.set([]);
                this.status.set('error');
                this.errorMessage.set(
                  'Не вдалося завантажити GIF. Перевірте з’єднання та спробуйте ще раз.',
                );
              }
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected search(query: string): void {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      this.gifs.set([]);
      this.query.set('');
      this.status.set('idle');
      this.hasMore.set(false);
      this.isLoadingMore.set(false);
      this.loadMoreError.set('');
      this.requests.next({ query: '', offset: 0, append: false });
      return;
    }

    this.nextOffset = 0;
    this.loadMoreError.set('');
    this.requests.next({ query: normalizedQuery, offset: 0, append: false });
  }

  protected loadMore(): void {
    if (!this.hasMore() || this.isLoadingMore() || this.status() !== 'success') {
      return;
    }

    this.requests.next({ query: this.query(), offset: this.nextOffset, append: true });
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
