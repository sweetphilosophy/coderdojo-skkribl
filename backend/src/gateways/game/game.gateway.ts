import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const WORDS_LIST = [
  'airplane',
  'boat',
  'baby',
  'ears',
  'scissors',
  'cough',
  'cold',
  'phone',
  'laugh',
  'blink',
  'hairbrush',
  'sneeze',
  'spin',
  'hammer',
  'book',
  'phone',
  'toothbrush',
  'jump',
  'clap',
  'slap',
  'archer',
  'ghost',
  'balance',
  'shoelaces',
  'sick',
  'balloon',
  'banana',
  'peel',
  'monster',
  'hiccup',
  'stomp',
  'hurt',
  'hungry',
  'slip',
  'karate',
  'ladder',
  'scare',
  'fishing',
  'dizzy',
  'read',
  'hot',
  'birthday',
  'president',
  'apartment',
  'cradle',
  'coffee',
  'trampoline',
  'waterfall',
  'window',
  'proud',
  'stuck-up',
  'flashlight',
  'marry',
  'overwhelm',
  'judge',
  'shadow',
  'halo',
  'measure',
  'clown',
  'chomp',
  'slither',
  'whale',
  'snake',
  'elephant',
  'giraffe',
  'dog',
  'cat',
  'ant',
  'rabbit',
  'groundhog',
  'hyena',
  'kangaroo',
  'shark',
  'fish',
  'polar',
  'bear',
  'caterpillar',
  'cockroach',
  'ram',
  'monkey',
  'jaguar',
  'rooster',
];

enum Phases {
  DRAWING,
  GUESSING,
  BETWEEN_ROUNDS,
}

interface Player {
  id: string;
  name: string;
  score: number;
  phase?: Phases;
  gameMaster?: boolean;
}

interface GameState {
  players: Player[];
  currentWord: string;
  drawerIndex: number;
  guesses: { [key: string]: string }; // Player ID mapped to their guess
  phase: 'playing' | 'over';
}

interface DrawingLine {
  x: number;
  y: number;
  color: string;
  newLine: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private gameState: GameState = {
    players: [],
    currentWord: '',
    drawerIndex: 0,
    guesses: {},
    phase: 'over',
  };

  SYSTEM_USERNAME = 'SYSTEM';

  constructor() {
    setInterval(() => {
      console.log(this.gameState);
      if (this.gameState) {
        if (this.gameState.phase === 'playing') {
          console.log('se joaca');
        } else if (this.gameState.phase === 'over') {
          console.log('nu se joaca');
        }
      }
    }, 10000);
  }

  // gameLoop() {

  // }

  afterInit() {
    console.log('Initialized successfully');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const disconnectedUsername = this.gameState.players.find(
      (p) => p.id === client.id,
    )?.name;

    this.gameState.players = this.gameState.players.filter(
      (p) => p.id !== client.id,
    );
    this.server.emit('playerListUpdate', this.gameState.players);
    this.server.emit('chatMessage', {
      username: this.SYSTEM_USERNAME,
      message: `${disconnectedUsername} has disconnected!`,
    });
  }

  @SubscribeMessage('draw')
  handleDrawLine(@MessageBody() line: DrawingLine) {
    this.server.emit('draw', line);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() username: string,
  ): void {
    console.log(`New user connected: ${username}`);
    const newPlayer: Player = {
      id: client.id,
      name: username,
      score: 0,
      gameMaster: this.gameState.players.length === 0,
    };
    this.gameState.players.push(newPlayer);
    client.emit('gameState', this.gameState);
    this.server.emit('playerListUpdate', this.gameState.players);
    this.server.emit('chatMessage', {
      username: this.SYSTEM_USERNAME,
      message: `${username} has joined!`,
    });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ): void {
    const username = this.gameState.players.find(
      (p) => p.id === client.id,
    ).name;
    if (username) {
      console.log(`New Message: ${username} - ${message}`);

      // handle guess here as the guesses are sent through the chat
      this.server.emit('chatMessage', { username, message });
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(): void {
    this.pickNewWord();

    this.setGamePhase('playing');

    this.server.emit('gameState', this.gameState);
  }

  @SubscribeMessage('makeGuess')
  handleMakeGuess(
    @ConnectedSocket() client: Socket,
    @MessageBody() guess: string,
  ): void {
    // if (this.gameState.phase === 'guessing') {
    //   this.gameState.guesses[client.id] = guess;
    //   // this.checkGuess(guess); // Method to check the correctness of the guess
    //   this.server.emit('gameState', this.gameState);
    // }
  }

  private setGamePhase(phase: 'playing' | 'over') {
    this.gameState.phase = phase;
  }

  private pickNewWord() {
    this.gameState.currentWord =
      WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
  }

  // private checkGuess(guess: string) {
  //   // Implement logic to check the guess and update scores
  //   if (guess.toLowerCase() === this.gameState.currentWord.toLowerCase()) {
  //     this.gameState.players.find((p) => p.id === guess.id).score += 10;
  //     this.gameState.phase = 'between rounds';
  //   }
  // }
}
