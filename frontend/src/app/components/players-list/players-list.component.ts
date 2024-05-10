import { Component } from '@angular/core';
import { Player } from '../../types';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.css',
})
export class PlayersListComponent {
  private _players: Player[] = [];
  isCurrentPlayerGameMaster: boolean = false;

  get players(): Player[] {
    return this._players;
  }

  set players(players: Player[]) {
    this._players = players.sort((a, b) => b.score - a.score);
    this.isCurrentPlayerGameMaster =
      this._players.find(
        (p) => p.name === this.userService.currentStaticUsername
      )?.gameMaster || false;
  }

  constructor(
    private socketService: SocketService,
    private userService: UserService
  ) {
    this.socketService
      .listenPlayerListUpdate()
      .subscribe((players) => (this.players = players));
  }

  // find a better place for this
  startGame() {
    this.socketService.startGame();
  }

  // for debug purposes
  addPlayer(newPlayer: Player): void {
    this.players = [...this._players, newPlayer];
  }
}
