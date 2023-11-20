import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService } from './../../services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})

export class SideNavComponent implements OnInit {
  myForm!: FormGroup;
  user!: User;
  $id!: number;

  username!: string;

  constructor(
    public route:ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.$id = +params['id'];
      }
    );
    console.log("sidenav "+ this.$id);

    this.userService.getUserById(this.$id)
    .subscribe((data) => {
      this.username = data.nombre+ ' ' + data.apellido;
    })
  }
}
