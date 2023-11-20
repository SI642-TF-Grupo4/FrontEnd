export interface User{
    $id: number
    email:string
    password:string
    username:string
    apellido:string
    nombre:string
    dni:string
    telefono:string
    income: number
}

export interface Credentials {
    email: string;
    password: string;
  }


  /*
  *[{"id":1,
  * "nombre":"string",
  * "apellido":"string",
  * "dni":"stringst",
  * "telefono":"string",
  * "email":"user@example.com",
  * "password":"string"}]
  * */
