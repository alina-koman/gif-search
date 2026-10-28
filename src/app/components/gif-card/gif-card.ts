import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Gif } from '../../models/gif.model';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-gif-card',
  styleUrl: './gif-card.css',
  templateUrl: './gif-card.html',
})
export class GifCard {
  readonly gif = input.required<Gif>();
  readonly selected = output<{ gif: Gif; trigger: HTMLButtonElement }>();

  protected select(event: MouseEvent): void {
    const trigger = event.currentTarget;
    if (trigger instanceof HTMLButtonElement) {
      this.selected.emit({ gif: this.gif(), trigger });
    }
  }
}
