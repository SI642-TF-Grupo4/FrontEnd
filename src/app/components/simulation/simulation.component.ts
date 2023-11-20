import { EntidadService } from './../../services/entidad.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Finance } from 'financejs';
import { Observable } from 'rxjs';
import { Credito, Cuota} from 'src/app/model/cotizacion';
import { Entidad } from 'src/app/model/entidad';
import { UserService } from 'src/app/services/user.service';
import { addDays, addMonths, format } from 'date-fns'; // Importa las funciones necesarias de date-fns

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {

  $id!: number;
  ent!: number;
  entidad$!: Observable<Entidad>;
  entidad !: Entidad;
  username !: string;
  myForm !: FormGroup;
  ningun_plazo: boolean = true;
  pminimo!: number;
  pmaximo!: number;

  tmaximo!: number;
  tminimo!: number;

  simbo: string = '';
  vercrono: boolean = false;
  verdetalle: boolean = false;
  aceptaTerminos: boolean = false;
  calculado: boolean = false;

  c_inicial!: number;
  c_inicial_por!: number;

  //Variables de calculo
  todollar: number = 0.27384;

  saldo_inicial!: number;
  interes_pagado!: number;
  valor_seg_degra!: number;
  valor_seg_vehi!: number;
  amortizacion!: number;
  saldo_final!: number;
  interes_plazo!: number;

  tasa_nominal_anual!: number;
  tasa_efectiva_mensual!: number;
  tasa_efectiva_anual!: number;

  frm!: Credito;

  displayedColumns: string[] = ['nCuota', 'fecha', 'saldoInicial', 'amortización', 'interes', 'seguroDesgravamen', 'seguroVehicular', 'saldoFinal', 'montoCuota'];
  /*
  * export interface Cotizacion {
  user_id: number
  moneda: string
 // entidad: string
  precio_venta: number
  cuota_inicial: number
  tipo_tasa: string
  tasa: number
  plazo: number
  perInitial: number
  monto_solicitar: number
  monto_financiar: number
  cuota_mensual: number
  seguro_vehicular: number
  seguro_degravamen: number
  tipo_gracia: string
  periodo_gracia: number
  comision: number
  fecha: Date
  tea: number
  tna: number
}

export interface RowCrono {
  id: number
  n_cuota: number
  fecha: string
  saldo_inicial: string
  amortizatión: string
  interes: string
  seguro_degravamen: string
  seguro_vehicular: string
  saldo_final: string
  monto_cuota: string

}

  * */

  rowscrono: Cuota[] = [];
  flujos: number[] = []
  van!: number;
  tir!: number;
  selectTipo: string = '';
  dataSource !: MatTableDataSource<Cuota>;
  fecha: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.route.parent?.params.subscribe((params: Params) => {
      this.$id = +params['id'];
    });

    this.route.params.subscribe((params: Params) => {
      this.ent = +params['et'];
    });

    this.servUsu.getUserById(this.$id)
      .subscribe((data) => {
        this.username = data.nombre + ' ' +data.apellido;
      })

    this.serv.getEntidadById(this.ent).subscribe({
      next: (res) => {
        if (res) {
          this.entidad = res;
          this.serv.entidad$.next(this.entidad);
        }
        else {
          this.snackBar.open('No existe una entidad con este código', '', {
            duration: 2000,
          });
        }
      }
    });

  }


  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private serv: EntidadService,
    private servUsu: UserService) {

    this.reactiveForm();
    this.entidad$ = this.serv.entidad$;
    this.pminimo = 1;
    this.pmaximo = 72;
  }

  reactiveForm() {
    this.myForm = this.fb.group({
      fechaPrimeraCuota: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+([.])?([0-9]+)?$')]],
      cuota_initial: ['', [Validators.required]],
      plazo: ['', [Validators.required, Validators.pattern('^[0-9]+')]],
      tasa: ['', [Validators.required, Validators.pattern('^[0-9]+([.])?([0-9]+)?$')]],
      moneda: ['Seleccionar', [Validators.required, this.comboValidator]],
      tipo: ['Seleccionar', [Validators.required, this.comboValidator]],
      tipo_tasa: ['Seleccionar', [Validators.required, this.comboValidator]],
      periodo_gracia: ['', [Validators.required, Validators.pattern('^[0-9]+')]],

      plazo_info: [''],
      porc_cuotaini: [''],
      monto_prestamo: [''],
      cuota: [''],
      read: [''],
    });
  }

  comboValidator(control: { value: string; }) {
    return control.value != 'Seleccionar' ? null : { invalid: true };
  }

  validarMoneda() {

    this.tmaximo = this.entidad.tasaMax;
    this.tminimo = this.entidad.tasaMin;

    if (!this.myForm.get('moneda')?.invalid) {
      this.simbo = this.myForm.get('moneda')!.value.split(' ')[0];
    }

    if (this.myForm.get('tipo')!.value == 'Ninguno') {
      this.ningun_plazo = true;
      this.myForm.get('periodo_gracia')?.setValue(0);
    }
    else if (this.myForm.get('tipo')!.value == 'Total' || this.myForm.get('tipo')!.value == 'Parcial') {
      this.ningun_plazo = false;
    }
    if (this.myForm.get('tipo_tasa')!.value == 'Tasa Nominal Anual') {
      this.tmaximo = 20;
      this.tminimo = 5;
    }
  }


  calcularCuota() {
    if (this.myForm.valid) {

      const fechaPrimeraCuotaString: string = this.myForm.value.fechaPrimeraCuota;
      let fechaPrimeraCuota: Date = new Date(fechaPrimeraCuotaString);
      fechaPrimeraCuota = addDays(fechaPrimeraCuota, 1);

      const formu: Credito = {
        user_id: this.$id,
        fecha: fechaPrimeraCuota,
        moneda: this.myForm.get('moneda')!.value,
        //entidad: this.entidad.name,

        precio_venta: this.myForm.get('price')!.value,
        cuota_inicial: this.myForm.get('cuota_initial')!.value,
        tasa: this.myForm.get('tasa')!.value,
        tipo_tasa: this.myForm.get('tipo_tasa')!.value,
        comision: this.entidad.comision,
        seguro_desgravamen: this.entidad.seguroDeg,
        seguro_vehicular: this.entidad.seguroVehi,
        plazo: this.myForm.get('plazo')!.value,
        tipo_gracia: this.myForm.get('tipo')!.value,
        periodo_gracia: this.myForm.get('periodo_gracia')!.value,
        perInitial: 0,
        monto_financiar: 0,
        monto_solicitar: 0,
        cuota_mensual: 0,
        tea: 0,
        tna: 0
      }

      //Calcular el porcentaje de cuota inicial
      formu.perInitial = formu.cuota_inicial / formu.precio_venta * 100;

      // Calcular el monto del prestamo
      formu.monto_solicitar = formu.precio_venta - formu.cuota_inicial;
      formu.monto_financiar = 0.5 * formu.monto_solicitar;

      if (formu.tipo_tasa == 'Tasa Efectiva Anual') {
        this.tasa_efectiva_anual = formu.tasa / 100;

      } else if (formu.tipo_tasa == 'Tasa Nominal Anual') {
        this.tasa_efectiva_anual = Math.pow((1 + formu.tasa / 1200), 12) - 1;
      }
      // Calcular la tasa de interés efectiva mensual
      this.tasa_efectiva_mensual = Math.pow((1 + this.tasa_efectiva_anual), (1 / 12)) - 1;
      formu.tea = this.tasa_efectiva_anual*100;

      // Calcular la tasa mensual + tasa seguro degravamen
      const tasa_mensual_mas_seguro = this.tasa_efectiva_mensual + formu.seguro_desgravamen / 100;

      // Calcular el valor del seguro del inmueble
      const valor_seg_vehi = formu.precio_venta * (formu.seguro_vehicular / 100) / 12;

      // Interes nominal anual
      this.tasa_nominal_anual = ((Math.pow((this.tasa_efectiva_anual + 1), (1 / 12)) - 1) * 12);
      formu.tna = this.tasa_nominal_anual*100;

      // Asignar valor a saldo pendiente
      this.saldo_inicial = formu.monto_financiar;

      if (formu.tipo_gracia != 'Seleccionar') {
        if (formu.tipo_gracia == 'Total') {
          this.ningun_plazo = false;
          for (let i = 0; i < formu.periodo_gracia; i++) {
            // Se calcula el seguro_degravamen por cada periodo
            this.valor_seg_degra = this.saldo_inicial * formu.seguro_desgravamen / 100;

            // Se calcula el interes pagado por cada periodo
            this.interes_pagado = this.saldo_inicial * this.tasa_nominal_anual / 12;

            this.interes_plazo = this.interes_pagado + this.valor_seg_degra + valor_seg_vehi;
            this.saldo_inicial = this.saldo_inicial + this.interes_plazo;

          }

          const new_time = formu.plazo - formu.periodo_gracia;

          // Calcular el pago periodico
          formu.cuota_mensual = (this.saldo_inicial * (tasa_mensual_mas_seguro * (Math.pow((1 + tasa_mensual_mas_seguro), new_time))) / ((Math.pow((1 + tasa_mensual_mas_seguro), new_time)) - 1)) + valor_seg_vehi;

        }
        else if (formu.tipo_gracia == 'Parcial') {
          this.ningun_plazo = false;
          const new_time = formu.plazo - formu.periodo_gracia;
          // Calcular el pago periodico
          formu.cuota_mensual = (formu.monto_financiar * (tasa_mensual_mas_seguro * (Math.pow((1 + tasa_mensual_mas_seguro), new_time))) / ((Math.pow((1 + tasa_mensual_mas_seguro), new_time)) - 1)) + valor_seg_vehi;
        }
        else if (formu.tipo_gracia == 'Ninguno') {

          if (formu.periodo_gracia != 0) formu.periodo_gracia = 0;
          this.ningun_plazo = true;
          this.myForm.get('periodo_gracia')?.setValue(0.00);

          // Calcular el pago periodico
          formu.cuota_mensual = (formu.monto_financiar * (tasa_mensual_mas_seguro * (Math.pow((1 + tasa_mensual_mas_seguro), formu.plazo))) / ((Math.pow((1 + tasa_mensual_mas_seguro), formu.plazo)) - 1)) + valor_seg_vehi;

        }
      }

      if (formu.cuota_inicial !== null && formu.precio_venta !== null) {
        this.myForm.get('porc_cuotaini')?.setValue(formu.perInitial.toFixed(3));
      }

      this.myForm.get('monto_prestamo')?.setValue(formu.monto_financiar.toFixed(2));
      this.myForm.get('cuota')?.setValue(formu.moneda.split(' ')[0] + ' ' + formu.cuota_mensual.toFixed(3));
      if (formu.tipo_gracia != 'Ninguno') {
        const new_time = formu.plazo - formu.periodo_gracia;
        this.myForm.get('plazo_info')?.setValue(new_time + ' meses - ' + formu.periodo_gracia + ' meses de periodo de gracia');
      }
      else { this.myForm.get('plazo_info')?.setValue(formu.plazo + ' meses'); }

      this.fecha = format(formu.fecha, 'dd/MM/yyyy');
      this.frm = formu;
      this.arrayCronograma();
      this.calculado = true;
    }

  }
  arrayFlujoNormal(tasa_interes_nominal_anual: number, valor_seg_vehi: number): Cuota[] {
    const datos: Cuota[] = [];

    for (let i = 0; i < this.frm.plazo; i++) {

      // Se calcula el seguro_degravamen por cada periodo
      this.valor_seg_degra = this.saldo_inicial * this.frm.seguro_desgravamen / 100;

      // Se calcula el interes pagado por cada periodo
      this.interes_pagado = this.saldo_inicial * tasa_interes_nominal_anual / 12;

      // Se calcula la amortizacion
      this.amortizacion = this.frm.cuota_mensual - this.interes_pagado - this.valor_seg_degra - valor_seg_vehi;

      //Saldo final
      this.saldo_final = this.saldo_inicial - this.amortizacion;

      //Fecha
      const fecha = addMonths(this.frm.fecha, i);
      const fechaFormateada = format(fecha, 'dd/MM/yyyy');

      const row: Cuota = {
        $id: i,
        nCuota: i + 1,
        fecha: fechaFormateada,
        saldoInicial: this.saldo_inicial.toFixed(2),
        amortizacion: this.amortizacion.toFixed(2),
        interes: this.interes_pagado.toFixed(3),
        seguroDesgravamen: this.valor_seg_degra.toFixed(2),
        seguroVehicular: valor_seg_vehi.toFixed(2),
        saldoFinal: this.saldo_final.toFixed(2),
        montoCuota: this.frm.cuota_mensual.toFixed(3)
      }

      datos.push(row);
      this.flujos.push(this.frm.cuota_mensual);
      this.saldo_inicial = this.saldo_inicial - this.amortizacion;

    }
    return datos;
  }
  arrayWithTotalGracia(tasa_interes_nominal_anual: number, valor_seg_inmu: number): Cuota[] {

    const datos: Cuota[] = [];
    //Meses de plazo de gracia
    for (let i = 0; i < this.frm.periodo_gracia; i++) {

      // Se calcula el seguro_degravamen por cada periodo
      this.valor_seg_degra = this.saldo_inicial * this.frm.seguro_desgravamen / 100;

      // Se calcula el interes pagado por cada periodo
      this.interes_pagado = this.saldo_inicial * tasa_interes_nominal_anual / 12;

      this.interes_plazo = this.interes_pagado + this.valor_seg_degra + valor_seg_inmu;

      this.saldo_final = this.saldo_inicial + this.interes_plazo;

      //Fecha
      const fecha = addMonths(this.frm.fecha, i)

      const row: Cuota = {
        $id: i,
        nCuota: i + 1,
        fecha: format(fecha, 'yyyy-MM-dd'),
        saldoInicial: this.saldo_inicial.toFixed(2),
        amortizacion: '0.00',
        interes: this.interes_pagado.toFixed(3),
        seguroDesgravamen: this.valor_seg_degra.toFixed(2),
        seguroVehicular: valor_seg_inmu.toFixed(3),
        saldoFinal: this.saldo_final.toFixed(2),
        montoCuota: '0.00'
      }

      datos.push(row);
      this.flujos.push(this.frm.cuota_mensual);
      this.saldo_inicial = this.saldo_final;
    }
    //Meses de plazo normal
    for (let i = this.frm.periodo_gracia; i < this.frm.plazo; i++) {

      // Se calcula el seguro_degravamen por cada periodo
      this.valor_seg_degra = this.saldo_inicial * this.frm.seguro_desgravamen / 100;

      // Se calcula el interes pagado por cada periodo
      this.interes_pagado = this.saldo_inicial * tasa_interes_nominal_anual / 12;

      // Se calcula la amortizacion
      this.amortizacion = this.frm.cuota_mensual - this.interes_pagado - this.valor_seg_degra - valor_seg_inmu;

      //Saldo final
      this.saldo_final = this.saldo_inicial - this.amortizacion;

      //Fecha
      const fecha = addMonths(this.frm.fecha, i)

      const row: Cuota = {
        $id: i,
        nCuota: i + 1,
        fecha: format(fecha, 'yyyy-MM-dd'),
        saldoInicial: this.saldo_inicial.toFixed(2),
        amortizacion: this.amortizacion.toFixed(2),
        interes: this.interes_pagado.toFixed(3),
        seguroDesgravamen: this.valor_seg_degra.toFixed(2),
        seguroVehicular: valor_seg_inmu.toFixed(2),
        saldoFinal: this.saldo_final.toFixed(2),
        montoCuota: this.frm.cuota_mensual.toFixed(3)
      }

      datos.push(row);
      this.flujos.push(this.frm.cuota_mensual);
      this.saldo_inicial = this.saldo_final;
    }

    return datos;
  }
  arrayWithParcialGracia(tasa_interes_nominal_anual: number, valor_seg_inmu: number): Cuota[] {
    const datos: Cuota[] = [];
    //Meses de plazo de gracia
    for (let i = 0; i < this.frm.periodo_gracia; i++) {

      // Se calcula el seguro_degravamen por cada periodo
      this.valor_seg_degra = this.saldo_inicial * this.frm.seguro_desgravamen / 100;

      // Se calcula el interes pagado por cada periodo
      this.interes_pagado = this.saldo_inicial * tasa_interes_nominal_anual / 12;

      this.interes_plazo = this.interes_pagado + this.valor_seg_degra + valor_seg_inmu;

      //Fecha
      const fecha = addMonths(this.frm.fecha, i)

      const row: Cuota = {
        $id: i,
        nCuota: i + 1,
        fecha: format(fecha, 'yyyy-MM-dd'),
        saldoInicial: this.saldo_inicial.toFixed(2),
        amortizacion: '0.00',
        interes: this.interes_pagado.toFixed(3),
        seguroDesgravamen: this.valor_seg_degra.toFixed(2),
        seguroVehicular: valor_seg_inmu.toFixed(2),
        saldoFinal: this.saldo_inicial.toFixed(2),
        montoCuota: this.interes_plazo.toFixed(3)
      }

      datos.push(row);
      this.flujos.push(this.frm.cuota_mensual);
    }
    //Meses de plazo normal
    for (let i = this.frm.periodo_gracia; i < this.frm.plazo; i++) {

      // Se calcula el seguro_degravamen por cada periodo
      this.valor_seg_degra = this.saldo_inicial * this.frm.seguro_desgravamen / 100;

      // Se calcula el interes pagado por cada periodo
      this.interes_pagado = this.saldo_inicial * tasa_interes_nominal_anual / 12;

      // Se calcula la amortizacion
      this.amortizacion = this.frm.cuota_mensual - this.interes_pagado - this.valor_seg_degra - valor_seg_inmu;

      //Saldo final
      this.saldo_final = this.saldo_inicial - this.amortizacion;


      //Fecha
      const fecha = addMonths(this.frm.fecha, i)

      const row: Cuota = {
        $id: i,
        nCuota: i + 1,
        fecha: format(fecha, 'yyyy-MM-dd'),
        saldoInicial: this.saldo_inicial.toFixed(2),
        amortizacion: this.amortizacion.toFixed(2),
        interes: this.interes_pagado.toFixed(3),
        seguroDesgravamen: this.valor_seg_degra.toFixed(2),
        seguroVehicular: valor_seg_inmu.toFixed(2),
        saldoFinal: this.saldo_final.toFixed(2),
        montoCuota: this.frm.cuota_mensual.toFixed(3)
      }

      datos.push(row);
      this.flujos.push(this.frm.cuota_mensual);
      this.saldo_inicial = this.saldo_final;
    }

    return datos;
  }
  arrayCronograma() {
    if (!this.myForm.invalid) {

      // Calcular el valor del seguro del inmueble
      const valor_seg_inmu = this.frm.precio_venta * (this.frm.seguro_vehicular / 100) / 12

      // Asignar valor a saldo pendiente
      this.saldo_inicial = this.frm.monto_financiar;

      //Calcular interes pagado por periodo
      this.interes_pagado = this.frm.monto_financiar * this.tasa_nominal_anual / 12;


      let finance = new Finance();

      if (this.frm.tipo_gracia != 'Seleccionar') {
        this.selectTipo = '';
        if (this.frm.tipo_gracia == 'Total') {

          this.rowscrono = this.arrayWithTotalGracia(this.tasa_nominal_anual, valor_seg_inmu);
        }
        else if (this.frm.tipo_gracia == 'Parcial') {
          this.rowscrono = this.arrayWithParcialGracia(this.tasa_nominal_anual, valor_seg_inmu);
        }
        else if (this.frm.tipo_gracia == 'Ninguno') {
          this.rowscrono = this.arrayFlujoNormal(this.tasa_nominal_anual, valor_seg_inmu);
        }
      }
      else {
        this.selectTipo = 'Es obligatorio que seleccione una opción';
      }

      // e.g., If initial investment is -$500,000 and the cash flows are $200,000, $300,000, and $200,000, IRR is 18.82%.
      this.tir = finance.IRR(-this.frm.monto_financiar, ...this.flujos);
      this.van = finance.NPV(this.tir, -this.frm.monto_financiar, ...this.flujos);
      //=> 18.82
      this.dataSource = new MatTableDataSource<Cuota>(this.rowscrono);
      this.dataSource.paginator = this.paginator;
    }
  }

  verCronograma() {
    if (this.frm) {
      this.vercrono = true;
    }
  }
  verDetalle(confirmar: boolean) {
    this.verdetalle = confirmar;
  }

  finalizar() {
    if (this.aceptaTerminos) {

      alert("Términos y Condiciones aceptados. ¡Proceder con Finalizar!");
      this.router.navigate(['/home', this.$id]);

    } else {

      alert("Debes aceptar los Términos y Condiciones para continuar.");

    }
  }
}
