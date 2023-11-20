import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Entidad } from '../model/entidad';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntidadService {

  entidad!: Entidad;
  entidad$!: Subject<Entidad>;

  constructor(private http: HttpClient) {
    this.entidad$ = new Subject<Entidad>();
  }

  getEntidades() {
    return this.http.get<Entidad[]>(`${environment.basePath}/entidades`);
  }
  addEntidad(user: Entidad) {
    return this.http.post<Entidad>(`${environment.basePath}/entidades`, user);
  }
  getEntidadById(id: number): Observable<Entidad> {
    return this.http.get<Entidad>(`${environment.basePath}/entidades/${id}`);
  }
  
}