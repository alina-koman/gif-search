import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GifService } from './gif';
import { environment } from '../../environments/environment';

describe('GifService', () => {
  let service: GifService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GifService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.unstubAllGlobals();
  });

  it('searches Giphy with a trimmed query and pagination options', () => {
    service.searchGifs('  cats  ', 10, 5).subscribe((response) => {
      expect(response.data).toEqual([{ id: 'gif-1', title: 'A cat' }]);
      expect(response.pagination.offset).toBe(5);
    });

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.giphyApiUrl}/search`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('api_key')).toBe(environment.giphyApiKey);
    expect(request.request.params.get('q')).toBe('cats');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('offset')).toBe('5');
    request.flush({
      data: [{ id: 'gif-1', title: 'A cat' }],
      pagination: { total_count: 1, count: 1, offset: 5 },
    });
  });

  it('does not make a request for a blank query', () => {
    service.searchGifs('   ').subscribe((response) => {
      expect(response).toEqual({
        data: [],
        pagination: { total_count: 0, count: 0, offset: 0 },
      });
    });

    httpTestingController.expectNone(() => true);
  });

  it('rejects invalid pagination values', () => {
    let error: unknown;

    service.searchGifs('cats', 51).subscribe({ error: (caught) => (error = caught) });

    expect(error).toBeInstanceOf(RangeError);
    httpTestingController.expectNone(() => true);
  });

  it('is provided by Angular', () => {
    expect(service).toBeTruthy();
  });

  it('copies a GIF link using the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await service.copyGifLink('https://giphy.com/gifs/test');

    expect(writeText).toHaveBeenCalledWith('https://giphy.com/gifs/test');
  });

  it('rejects when clipboard access is unavailable', async () => {
    vi.stubGlobal('navigator', {});

    await expect(service.copyGifLink('https://giphy.com/gifs/test')).rejects.toThrow(
      'Clipboard access is unavailable',
    );
  });

  it('rejects insecure download URLs', async () => {
    await expect(
      service.downloadGif('http://media.giphy.com/test.gif', 'test.gif'),
    ).rejects.toThrow('HTTPS');
  });

  it('reports HTTP failures when downloading GIFs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403 } satisfies Partial<Response>),
    );
    await expect(
      service.downloadGif('https://media.giphy.com/test.gif', 'test.gif'),
    ).rejects.toThrow('403');
  });
});
