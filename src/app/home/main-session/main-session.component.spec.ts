import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSessionComponent } from './main-session.component';

describe('MainSessionComponent', () => {
  let component: MainSessionComponent;
  let fixture: ComponentFixture<MainSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainSessionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
