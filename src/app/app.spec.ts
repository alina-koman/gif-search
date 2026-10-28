import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Gif } from './models/gif.model';
import { GiphyResponse } from './models/gif.model';
import { GifService } from './services/gif';
import { SearchBar } from './components/search-bar/search-bar';
import { App } from './app';

const testGif: Gif = {
  id: 'gif-1',
  title: 'A cat GIF',
  url: 'https://giphy.com/gifs/test',
  embed_url: 'https://giphy.com/embed/test',
  rating: 'g',
  import_datetime: '2024-01-01 00:00:00',
  images: {
    original: { url: 'https://media.giphy.com/original.gif', width: '480', height: '270' },
    fixed_height: { url: 'https://media.giphy.com/preview.gif', width: '200', height: '150' },
  },
};

const responseWith = (data: Gif[]): GiphyResponse => ({
  data,
  pagination: { total_count: data.length, count: data.length, offset: 0 },
});

describe('App', () => {
  let searchGifs: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    searchGifs = vi.fn().mockReturnValue(of(responseWith([])));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: GifService,
          useValue: { searchGifs },
        },
      ],
    }).compileComponents();
  });

  it('should create the app and render the search heading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Ідеальний GIF');
  });

  it('searches with a trimmed query and renders returned GIFs', () => {
    searchGifs.mockReturnValue(of(responseWith([testGif])));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const searchBar = fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;

    searchBar.searchRequested.emit('  cats  ');
    fixture.detectChanges();

    expect(searchGifs).toHaveBeenCalledWith('cats');
    expect(fixture.nativeElement.querySelector('app-gif-card')).toBeTruthy();
  });

  it('does not request results for an empty query and returns to the idle state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const searchBar = fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;

    searchBar.searchRequested.emit('cats');
    searchBar.searchRequested.emit('   ');
    fixture.detectChanges();

    expect(searchGifs).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Знайдіть GIF для потрібного настрою');
  });

  it('shows an empty state when the search has no matches', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const searchBar = fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;

    searchBar.searchRequested.emit('unknown');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('нічого не знайдено');
  });

  it('shows a useful error state when Giphy search fails', () => {
    searchGifs.mockReturnValue(throwError(() => new Error('API error')));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const searchBar = fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;

    searchBar.searchRequested.emit('cats');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Не вдалося завантажити GIF',
    );
  });

  it('ignores a stale response after a newer search starts', () => {
    const firstResponse = new Subject<GiphyResponse>();
    const latestResponse = new Subject<GiphyResponse>();
    searchGifs.mockImplementation((query: string) =>
      query === 'first'
        ? (firstResponse as Observable<GiphyResponse>)
        : (latestResponse as Observable<GiphyResponse>),
    );

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const searchBar = fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;

    searchBar.searchRequested.emit('first');
    searchBar.searchRequested.emit('latest');
    firstResponse.next(responseWith([testGif]));
    latestResponse.next(responseWith([{ ...testGif, id: 'latest-gif', title: 'Latest result' }]));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Latest result');
    expect(fixture.nativeElement.textContent).not.toContain('A cat GIF');
  });
});
