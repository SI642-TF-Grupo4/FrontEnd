import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Credentials, User } from 'src/app/model/user';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  usuario$!: Subject<User>;
  $id!: number;
  isLoggedIn: boolean = false;
  dataUsers$!: Subject<User[]>;
  arrayUsers: User[] = [];
  keepLogin: boolean = false;

  constructor(private http: HttpClient, private router: Router, private snackbar: MatSnackBar) {
    this.usuario$ = new Subject<User>();
    this.dataUsers$ = new Subject<User[]>();
  }
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.basePath}/users`);
  }
  addUser(obj: User) {
    console.log(obj);
    return this.http.post<User>(`${environment.basePath}/users/sign-up`, obj);
  }

  getUserById(id: any): Observable<User> {
    return this.http.get<User>(`${environment.basePath}/users/${id}`);
  }

  ingresar(cred: Credentials): Observable<User> {

    for (let user of this.arrayUsers) {
      if (user.email == cred.email && user.password == cred.password) {

        this.usuario$.next(user);
        this.$id = user.$id;
        this.snackbar.open('Login correcto!', '', {
          duration: 2000,
        });
        this.router.navigate(['/home', user.$id]);
      }
    }

    return this.usuario$;
  }
}
