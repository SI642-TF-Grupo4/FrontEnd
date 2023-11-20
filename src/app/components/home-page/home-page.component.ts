import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BreakpointObserver} from '@angular/cdk/layout'
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements AfterViewInit {
  @ViewChild(MatSidenav)
  sidenav!:MatSidenav;
  constructor(private observer : BreakpointObserver,
    private router:Router,
    public route:ActivatedRoute) { }

  ngOnInit(): void {
    const variable = this.route.snapshot.paramMap.get('id');
    console.log("home"+ variable)
  }

  ngAfterViewInit(): void {
    this.observer.observe(['(max-width: 800px)']).subscribe((res)=>{
      if(res.matches){
        this.sidenav.mode ='over';
        this.sidenav.close();
      }
      else{
        this.sidenav.mode = 'side';
        this.sidenav.open()
      }
    })
  }

}

