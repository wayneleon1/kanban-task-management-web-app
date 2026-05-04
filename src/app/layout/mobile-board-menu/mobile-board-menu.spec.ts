import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileBoardMenu } from './mobile-board-menu';

describe('MobileBoardMenu', () => {
  let component: MobileBoardMenu;
  let fixture: ComponentFixture<MobileBoardMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileBoardMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileBoardMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
