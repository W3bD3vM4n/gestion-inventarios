import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarTransaccionComponent } from './agregar-transaccion.component';

describe('AgregarTransaccionComponent', () => {
  let component: AgregarTransaccionComponent;
  let fixture: ComponentFixture<AgregarTransaccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarTransaccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarTransaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
