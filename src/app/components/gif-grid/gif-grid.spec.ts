import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GifGrid } from './gif-grid';

describe('GifGrid', () => {
  let component: GifGrid;
  let fixture: ComponentFixture<GifGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(GifGrid);
    fixture.componentRef.setInput('gifs', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders each GIF card', () => {
    fixture.componentRef.setInput('gifs', [
      {
        id: 'gif-1',
        title: 'Test GIF',
        url: 'https://giphy.com/gifs/test',
        embed_url: 'https://giphy.com/embed/test',
        rating: 'g',
        import_datetime: '2024-01-01 00:00:00',
        images: {
          original: {
            url: 'https://media.giphy.com/original.gif',
            width: '480',
            height: '270',
          },
          fixed_height: {
            url: 'https://media.giphy.com/preview.gif',
            width: '200',
            height: '150',
          },
        },
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-gif-card').length).toBe(1);
  });
});
