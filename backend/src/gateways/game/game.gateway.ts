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

  private SYSTEM_USERNAME = 'SYSTEM';

  private roundTimerInterval: NodeJS.Timeout | undefined;
  private roundTime: number = 60; // 60 seconds per round
  private currentRoundTime: number = 0;

  constructor() {
    setInterval(() => {
      if (this.gameState.phase === 'playing' && !this.roundTimerInterval) {
        this.startRoundTimer();
      }
    }, 1000);
  }

  private startRoundTimer() {
    this.currentRoundTime = this.roundTime;
    this.roundTimerInterval = setInterval(() => {
      this.roundLoop();
    }, 1000);
  }

  private roundLoop() {
    console.log(this.gameState);
    this.currentRoundTime--;
    this.server.emit('roundTimerUpdate', this.currentRoundTime);

    if (this.currentRoundTime <= 0) {
      this.endRound();
    }
  }

  private endRound() {
    if (this.roundTimerInterval) {
      clearInterval(this.roundTimerInterval);
      this.roundTimerInterval = undefined;
    }

    this.server.emit('roundEnd', this.gameState.currentWord);

    // Update game state and proceed to the next round
    this.gameState.drawerIndex =
      (this.gameState.drawerIndex + 1) % this.gameState.players.length;
    this.pickNewWord();
    this.setGamePhase('playing');

    this.server.emit('gameState', this.gameState);
    this.startRoundTimer();
  }

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
      phase:
        this.gameState.players.length === 0 ? Phases.DRAWING : Phases.GUESSING,
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
    // const username = this.gameState.players.find(
    //   (p) => p.id === client.id,
    // ).name;
    // if (username) {
    //   console.log(`New Message: ${username} - ${message}`);

    //   // handle guess here as the guesses are sent through the chat
    //   this.server.emit('chatMessage', { username, message });
    // }

    const player = this.gameState.players.find((p) => p.id === client.id);
    if (player) {
      console.log(`New Message: ${player.name} - ${message}`);

      if (
        this.gameState.phase === 'playing' &&
        player.phase === Phases.GUESSING &&
        message.toLowerCase() === this.gameState.currentWord.toLowerCase()
      ) {
        player.score += 100; // Award points for correct guess
        this.server.emit('chatMessage', {
          username: this.SYSTEM_USERNAME,
          message: `${player.name} guessed the word!`,
        });
        // this.endRound(); // End round if someone guesses the word
      } else {
        this.server.emit('chatMessage', { username: player.name, message });
      }
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(): void {
    if (this.gameState.players.length > 1) {
      this.pickNewWord();

      this.setGamePhase('playing');

      this.server.emit('gameState', this.gameState);
      this.startRoundTimer();
    } else {
      this.server.emit('chatMessage', {
        username: this.SYSTEM_USERNAME,
        message: 'Not enough players to start the game.',
      });
    }
  }

  @SubscribeMessage('makeGuess')
  handleMakeGuess(
    @ConnectedSocket() client: Socket,
    @MessageBody() guess: string,
  ): void {}

  private setGamePhase(phase: 'playing' | 'over') {
    this.gameState.phase = phase;
  }

  private pickNewWord() {
    this.gameState.currentWord =
      WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
  }
}
