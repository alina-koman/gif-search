import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();

  protected readonly query = signal('');
  readonly searchRequested = output<string>();

  constructor() {
    this.searchTerms
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.searchRequested.emit(query.trim()));
  }

  protected updateQuery(value: string): void {
    this.query.set(value);
    this.searchTerms.next(value);
  }

  protected onInput(event: Event): void {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement) {
      this.updateQuery(target.value);
    }
  }

  protected searchNow(): void {
    this.searchTerms.next(this.query());
  }

  protected clear(): void {
    this.query.set('');
    this.searchTerms.next('');
  }
}
