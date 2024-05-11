import { Component } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { GameCanvasComponent } from '../game-canvas/game-canvas.component';
import { PlayersListComponent } from '../players-list/players-list.component';
import { WordHintComponent } from '../word-hint/word-hint.component';

@Component({
  selector: 'app-game-container',
  standalone: true,
  imports: [
    ChatComponent,
    GameCanvasComponent,
    PlayersListComponent,
    WordHintComponent,
  ],
  templateUrl: './game-container.component.html',
  styleUrl: './game-container.component.css',
})
export class GameContainerComponent {}
