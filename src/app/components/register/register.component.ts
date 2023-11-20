import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router)
     { this.reactiveForm(); }


  myForm !: FormGroup;

  reactiveForm() {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.maxLength(25)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      birth: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      profession: ['', [Validators.required, Validators.maxLength(40)]],
      income: ['', [Validators.required, Validators.min(0)]]
    })
  }
  comboValidator(control: { value: string; }) {

    return control.value !== 'Seleccionar' ? null : { invalidDate: true };
  }

  saveUser() {

    const user:any = {
      //username: this.myForm.get('name')!.value + ' ' + this.myForm.get('lastname')!.value,
      nombre: this.myForm.get('name')!.value,
      apellido: this.myForm.get('lastname')!.value,
      dni: this.myForm.get('dni')!.value,
      telefono: this.myForm.get('phone')!.value,
      email: this.myForm.get('correo')!.value,
      password: this.myForm.get('password')!.value,
      //income: this.myForm.get('income')!.value,

    };

     /*
  *[{"id":1,
  * "nombre":"string",
  * "apellido":"string",
  * "dni":"stringst",
  * "telefono":"string",
  * "email":"user@example.com",
  * "password":"string"}]
  * */

    this.userService.addUser(user).subscribe({
      next: (data) => {
        console.log(data);
        this.snackBar.open('El cliente fue registrado con éxito!', '', {
          duration: 2000,
        });
        this.router.navigateByUrl("/login");

      },
      error: (err) => {
        console.log(err);
        this.snackBar.open('Ya existe un usuario con el mismo DNI', '', {
          duration: 2000,
        });

      },
    });
  }


}
