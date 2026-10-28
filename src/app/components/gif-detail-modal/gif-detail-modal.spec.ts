import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifDetailModal],
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
});
