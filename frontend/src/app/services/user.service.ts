import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usernameSource = new BehaviorSubject<string>('');
  currentUsername = this.usernameSource.asObservable();
  currentStaticUsername = '';

  constructor() {}

  changeUsername(username: string) {
    this.usernameSource.next(username);
    this.currentStaticUsername = username;
  }
}
