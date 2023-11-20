import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-descripcion',
  templateUrl: './descripcion.component.html',
  styleUrls: ['./descripcion.component.css']
})
export class DescripcionComponent implements OnInit {
  hover: boolean[] = [false,false,false,false,false]
  $id!: number;


  constructor(private route: ActivatedRoute){
  }

  ngOnInit(){
    this.route.params.subscribe(
      (params: Params) => {
        this.$id = +params['id'];
      }
    );
  }

}
