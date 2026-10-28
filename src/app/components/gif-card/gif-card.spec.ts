import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gif } from '../../models/gif.model';
import { GifCard } from './gif-card';

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

describe('GifCard', () => {
  let component: GifCard;
  let fixture: ComponentFixture<GifCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GifCard);
    fixture.componentRef.setInput('gif', testGif);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits the GIF when the card is activated', () => {
    let selectedId = '';
    component.selected.subscribe(({ gif }) => (selectedId = gif.id));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(selectedId).toBe('gif-1');
  });
});
