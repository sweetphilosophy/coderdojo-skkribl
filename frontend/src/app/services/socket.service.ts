import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { io } from 'socket.io-client';
import { ChatMessage, DrawingLine, Player } from '../types';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private url: string = 'http://192.168.248.91:3000/';
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  joinGame(username: string) {
    this.socket.emit('joinGame', username);
  }

  startGame() {
    this.socket.emit('startGame');
  }

  listenPlayerListUpdate() {
    return new Observable<Player[]>((observer) => {
      this.socket.on('playerListUpdate', (players) => {
        observer.next(players);
      });
    });
  }

  sendChatMessage(message: string) {
    this.socket.emit('chatMessage', message);
  }

  listenChatMessages() {
    return new Observable<ChatMessage>((observer) => {
      this.socket.on('chatMessage', (data) => {
        observer.next(data);
      });
    });
  }

  sendDrawing(line: DrawingLine) {
    this.socket.emit('draw', line);
  }

  listenDrawing() {
    return new Observable<DrawingLine>((observer) => {
      this.socket.on('draw', (line) => observer.next(line));
    });
  }
}
