export interface FormaPagoInterface {
    tipo_Cargo_Abono?:    number;
    descripcion?:         string;
    monto?:               boolean;
    referencia?:          boolean;
    autorizacion?:        boolean;
    calcular_Monto?:      boolean;
    cuenta_Corriente?:    boolean;
    reservacion?:         boolean;
    facturar?:            boolean;
    efectivo?:            boolean;
    banco?:               boolean;
    fecha_Vencimiento?:   boolean;
    comision_Porcentaje?: number;
    comision_Monto?:      number;
    cuenta?:              any;
    contabilizar?:        boolean;
    val_Limite_Credito?:  boolean;
    msg_Limite_Credito?:  boolean;
    cuenta_Correntista?:  any;
    cuenta_Cta?:          any;
    bloquear_Documento?:  boolean;
    url?:                 string;
    req_Cuenta_Bancaria?: any;
    select?:   boolean;
}
