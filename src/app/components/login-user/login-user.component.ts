import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Credentials, User } from 'src/app/model/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent {
  myForm!: FormGroup;
  viewPsw: boolean = false;
  error!: string;
  isLoading = false;

  arrayUsers: User[] = [];
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private router: Router
  ) { this.createForm(); }

  createForm() {
    this.myForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    })
  }

  ngOnInit() {
    this.userService.getUsers().subscribe(
      (res) => {

        for (let i of res) {
          this.arrayUsers.push(i);
        }

        this.userService.dataUsers$.next(this.arrayUsers);
        this.userService.arrayUsers = this.arrayUsers;
      });
  }

  validarForm() {

    if (this.myForm.get('correo')?.valid && this.myForm.get('password')?.valid) {
      return true;
    }
    return false;

  }
  login() {

    if (this.validarForm()) {

      const credentials: Credentials = {

        "email": this.myForm.get('correo')?.value,
        "password": this.myForm.get('password')?.value,

      }
      console.log(credentials);
      console.log(this.arrayUsers);

      const exist = this.userService.arrayUsers.find(user =>
        (user.email === credentials.email && user.password === credentials.password));

      if (!exist) {
        this.snackbar.open('Las credenciales son incorrectas.', '', {
          duration: 2000,
        });
        return;
      }


      this.userService.ingresar(credentials).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (error) => {
          this.snackbar.open('No puede ingresar!', '', {
            duration: 2000,
          });
          this.isLoading = false;

        }
      });
    }

  }
}
