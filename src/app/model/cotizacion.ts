export interface Credito {
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
  seguro_desgravamen: number
  tipo_gracia: string
  periodo_gracia: number
  comision: number
  fecha: Date
  tea: number
  tna: number
}

export interface Cuota {
  $id: number
  nCuota: number
  fecha: string
  saldoInicial: string
  amortizacion: string
  interes: string
  seguroDesgravamen: string
  seguroVehicular: string
  saldoFinal: string
  montoCuota: string

}
