import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormPage } from './task-form-page';

describe('TaskFormPage', () => {
  let component: TaskFormPage;
  let fixture: ComponentFixture<TaskFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
