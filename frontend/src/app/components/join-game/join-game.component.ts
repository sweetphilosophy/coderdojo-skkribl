import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './join-game.component.html',
  styleUrl: './join-game.component.css',
})
export class JoinGameComponent {
  username: string = '';

  constructor(
    private userService: UserService,
    private socketService: SocketService
  ) {}

  joinGame(): void {
    if (this.username) {
      this.userService.changeUsername(this.username);
      this.socketService.joinGame(this.username);
    } else {
      alert('Please enter a username');
    }
  }
}
