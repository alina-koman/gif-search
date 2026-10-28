import { Component, input, output } from '@angular/core';
import { Gif } from '../../models/gif.model';
import { GifCard } from '../gif-card/gif-card';

@Component({
  imports: [GifCard],
  selector: 'app-gif-grid',
  styleUrl: './gif-grid.css',
  templateUrl: './gif-grid.html',
})
export class GifGrid {
  readonly gifs = input.required<Gif[]>();
  readonly gifSelected = output<{ gif: Gif; trigger: HTMLButtonElement }>();
}
