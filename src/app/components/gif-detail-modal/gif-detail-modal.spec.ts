import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GifService } from '../../services/gif';
import { Gif } from '../../models/gif.model';
import { GifDetailModal } from './gif-detail-modal';

const testGif: Gif = {
  id: 'gif-1',
  title: 'Test GIF',
  url: 'https://giphy.com/gifs/test',
  embed_url: 'https://giphy.com/embed/test',
  rating: 'g',
  import_datetime: '2024-01-01 00:00:00',
  images: {
    original: { url: 'https://media.giphy.com/original.gif', width: '480', height: '270' },
    fixed_height: { url: 'https://media.giphy.com/preview.gif', width: '200', height: '150' },
  },
};

describe('GifDetailModal', () => {
  let component: GifDetailModal;
  let fixture: ComponentFixture<GifDetailModal>;
  let gifService: {
    copyGifLink: ReturnType<typeof vi.fn>;
    downloadGif: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    gifService = {
      copyGifLink: vi.fn().mockResolvedValue(undefined),
      downloadGif: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [GifDetailModal],
      providers: [{ provide: GifService, useValue: gifService }],
    }).compileComponents();

    fixture = TestBed.createComponent(GifDetailModal);
    fixture.componentRef.setInput('gif', testGif);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the details dialog and labels it with the GIF title', () => {
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('gif-detail-title');
    expect(fixture.nativeElement.querySelector('#gif-detail-title')?.textContent).toContain(
      'Test GIF',
    );
  });

  it('copies the GIPHY page link and reports success', async () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    await fixture.whenStable();

    expect(gifService.copyGifLink).toHaveBeenCalledWith(testGif.url);
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Посилання скопійовано.',
    );
  });

  it('reports a clipboard error when copying is denied', async () => {
    gifService.copyGifLink.mockRejectedValue(new Error('Permission denied'));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Не вдалося скопіювати посилання',
    );
  });

  it('reports a download error when the media host blocks the request', async () => {
    gifService.downloadGif.mockRejectedValue(new Error('CORS'));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[2].click();
    await fixture.whenStable();

    expect(gifService.downloadGif).toHaveBeenCalledWith(
      testGif.images.original.url,
      `gif-${testGif.id}.gif`,
    );
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('CORS');
  });
});
