import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { UserService } from './services/user.service';
import { GameContainerComponent } from './components/game-container/game-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    JoinGameComponent,
    GameContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  username: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.currentUsername.subscribe((name) => {
      this.username = name;
    });
  }
}
