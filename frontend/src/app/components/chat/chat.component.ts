import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ChatMessage } from '../../types';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButton, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  message: string = '';

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService
      .listenChatMessages()
      .subscribe((message: ChatMessage) => {
        this.messages.push(message);
      });
  }

  sendMessage() {
    this.socketService.sendChatMessage(this.message);
    this.message = '';
  }
}
