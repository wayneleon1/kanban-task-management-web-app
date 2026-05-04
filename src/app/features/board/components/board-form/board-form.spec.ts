import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardForm } from './board-form';

describe('BoardForm', () => {
  let component: BoardForm;
  let fixture: ComponentFixture<BoardForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardForm],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
