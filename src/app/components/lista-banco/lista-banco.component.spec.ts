import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaBancoComponent } from './lista-banco.component';

describe('ListaBancoComponent', () => {
  let component: ListaBancoComponent;
  let fixture: ComponentFixture<ListaBancoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaBancoComponent]
    });
    fixture = TestBed.createComponent(ListaBancoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
