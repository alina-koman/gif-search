import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { GiphyResponse } from '../models/gif.model';

@Service()
export class GifService {
  private readonly http = inject(HttpClient);

  async copyGifLink(url: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      throw new Error('Clipboard access is unavailable in this browser or page context.');
    }

    await navigator.clipboard.writeText(url);
  }

  async downloadGif(url: string, filename: string): Promise<void> {
    const downloadUrl = new URL(url);
    if (downloadUrl.protocol !== 'https:') {
      throw new Error('GIF downloads are only supported from secure HTTPS URLs.');
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`GIF download failed with status ${response.status}.`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    try {
      link.href = objectUrl;
      link.download = filename;
      link.hidden = true;
      document.body.append(link);
      link.click();
    } finally {
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
  }

  searchGifs(query: string, limit = 20, offset = 0): Observable<GiphyResponse> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return of({
        data: [],
        pagination: { total_count: 0, count: 0, offset },
      });
    }

    if (!environment.giphyApiKey) {
      return throwError(() => new Error('Giphy API key is missing.'));
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return throwError(
        () => new RangeError('Giphy search limit must be an integer from 1 to 50.'),
      );
    }

    if (!Number.isInteger(offset) || offset < 0 || offset > 4999) {
      return throwError(
        () => new RangeError('Giphy search offset must be an integer from 0 to 4999.'),
      );
    }

    const params = new HttpParams()
      .set('api_key', environment.giphyApiKey)
      .set('q', normalizedQuery)
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<GiphyResponse>(`${environment.giphyApiUrl}/search`, { params });
  }
}
