import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-lista-banco',
  templateUrl: './lista-banco.component.html',
  styleUrls: ['./lista-banco.component.css']
})
export class ListaBancoComponent implements OnInit {
  id!: number;
  
  constructor(private route: ActivatedRoute,
    private router: Router){
  }

  ngOnInit(){
    this.route.parent?.params.subscribe((params: Params) => {
      this.id = +params['id'];
      console.log('ID:', this.id);
    });
  }

  simuladorGo(num : number){
    this.router.navigate(['/home', this.id, 'simulador', num]);
  }

}
