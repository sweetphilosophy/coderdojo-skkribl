import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { DrawingLine } from '../../types';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.css',
})
export class GameCanvasComponent implements OnInit {
  selectedColor = '#000000';
  private context!: CanvasRenderingContext2D;
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private isDrawing = false;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    let ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      this.context = ctx;
    }

    this.socketService.listenDrawing().subscribe((line) => this.drawLine(line));
  }

  drawLine(line: DrawingLine) {
    if (line.newLine) {
      this.context.beginPath();
      this.context.moveTo(line.x, line.y);
    } else {
      this.context.lineTo(line.x, line.y);
      this.context.strokeStyle = line.color;
      this.context.stroke();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    this.isDrawing = true;
    const currentLine: DrawingLine = {
      x: e.offsetX,
      y: e.offsetY,
      color: this.selectedColor,
      newLine: true,
    };
    this.drawLine(currentLine);
    this.socketService.sendDrawing(currentLine);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return;

    const currentLine: DrawingLine = {
      x: e.offsetX,
      y: e.offsetY,
      color: this.selectedColor,
      newLine: false,
    };
    this.drawLine(currentLine);
    this.socketService.sendDrawing(currentLine);
  }

  @HostListener('mouseup')
  @HostListener('mouseout')
  onMouseUp(e: MouseEvent) {
    this.isDrawing = false;
  }
}
