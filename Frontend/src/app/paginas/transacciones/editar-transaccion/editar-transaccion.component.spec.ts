import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTransaccionComponent } from './editar-transaccion.component';

describe('EditarTransaccionComponent', () => {
  let component: EditarTransaccionComponent;
  let fixture: ComponentFixture<EditarTransaccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarTransaccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTransaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
