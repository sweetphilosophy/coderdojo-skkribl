import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordHintComponent } from './word-hint.component';

describe('WordHintComponent', () => {
  let component: WordHintComponent;
  let fixture: ComponentFixture<WordHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordHintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WordHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
