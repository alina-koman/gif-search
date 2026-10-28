import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits a trimmed query after the debounce delay', async () => {
    const emitted: string[] = [];
    component.searchRequested.subscribe((query) => emitted.push(query));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '  cats  ';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([]);
    await new Promise((resolve) => setTimeout(resolve, 450));
    expect(emitted).toEqual(['cats']);
  });
});
