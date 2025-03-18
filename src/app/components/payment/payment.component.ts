import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BancoInterface } from 'src/app/interfaces/banco.interface';
import { CuentaBancoInterface } from 'src/app/interfaces/cuenta-banco.interface';
import { FormaPagoInterface } from 'src/app/interfaces/forma-pago.interface';
import { MontoIntreface } from 'src/app/interfaces/monto.interface';
import { bancos } from 'src/app/providers/bancos.provider';
import { cuentas } from 'src/app/providers/cuenta.provider-';
import { formas } from 'src/app/providers/formas-pago.provider';
import { DialogActionsComponent } from '../dialog-actions/dialog-actions.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {

  //datos para la pantalla pago
  formasPago: FormaPagoInterface[] = formas; //formas de pago disponibles
  forms: boolean = false; //ver formulario montos
  pago?: FormaPagoInterface; //Pago seleccionado
  banco?: BancoInterface; //banco seleccionado
  bancos: BancoInterface[] = []; //bancos disponibles
  cuentas: CuentaBancoInterface[] = []; //cuentas bancarias disponibles
  monto: string = "0"; //input Monto que se asigna al pago
  cuentaSelect?: CuentaBancoInterface; //cuenta bancaria seleccionada
  autorizacion: string = ""; //inpur autorizacion
  referencia: string = "" //input referencia
  montos: MontoIntreface[] = []; //Pagos agregados al documento
  selectAllMontos: boolean = false; //seleccionar todos los mmontos agregados
  isLoading: boolean = false;

  //Toales pago
  total: number = 5040
  saldo: number = this.total;
  cambio: number = 0;
  pagado: number = 0;

  constructor(
    private _snackBar: MatSnackBar,
    private _dialog:MatDialog,
  ) {

  }

  openSnackbar(message: string) {
    this._snackBar.open(message, "Aceptar");
  }

  //converit un texto a nummero+
  strToNum(texto: string): number | null {
    // Verificar si la cadena es un número
    const esNumero = /^\d+(\.\d+)?$/.test(texto);

    if (esNumero) {
      // Realizar la conversión a número
      return parseFloat(texto);
      // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
    } else {
      // Retornar null si la cadena no es un número
      return null;
    }
  }

  //ver fommulario para la forma de pago
  async viewForms(payment: FormaPagoInterface) {

    //asignar saldo y monto
    this.monto = this.saldo.toString();

    //Marcar las formas de pago como no seleccionadas
    this.formasPago.forEach(p => p.select = false);

    //Marcar forma de pago seleccionada como seleccionada 
    payment.select = true;

    //seleccionar forma de poago
    this.pago = payment;

    //TODO:validar que haya una cuenta correntista seleccionada


    //TODO:validar si la forma de pago es cuenta corriente, si es así, la cuenta correntisra seleccionada debe permiti CxC


    //TODO:Si la forma de pago es cuenta corriente y la cuenta correntista permite CxC
    //TODO:Validar que el monto que se paga esté dentro del limite de credito de la cuenta correntista


    //No mostrar formulario de montos si el total a pagar es 0
    if (this.total == 0) {
      this.openSnackbar("El total a pagar es 0.");
      return;
    }

    //No mostrar formulario si el saldo por pagar es 0
    if (this.saldo == 0) {
      this.openSnackbar("El saldo a pagar es 0");
      return;
    }

    //TODO: si la forma de pago tiene bancos, cargar los bancos
    if (payment.banco) {
      this.bancos = bancos;
    }

    //ver formulario montos
    this.forms = true;
  }

  //agregar una forma de pago
  addAmount() {

    //validar que exista un monto en el input
    if (!this.monto) {
      this.openSnackbar("No hay un monto para agregar.")
      return;

    }

    //converitr monto a numero
    let monto = this.strToNum(this.monto);

    //validar que el monto sea numerico
    if (monto == null) {
      this.openSnackbar("El monto debe ser un valor numerico");
      return;
    }

    //validar que mmonto sea positivo mayor a 0
    if(monto <= 0 ){
      this.openSnackbar("EL monto debe ser mayor a 0");
      return;
    }

    //si la forma de pago requiere autorizacion validar que se agregue
    if (this.pago!.autorizacion) {
      //Validar que se haya ingresado una autorizacion
      if (!this.autorizacion) {
        this.openSnackbar("Por favor rellene todos los campos.");
        return;
      }

    }

    //si la referencia es reuqerida validar que se agregue
    if (this.pago!.referencia) {
      //Validar que se haya ingresado una referencia
      if (!this.referencia) {
        this.openSnackbar("Por favor rellene todos los campos.");

        return;
      }
    }

    //Si la forma de poago requiere banco validar que se seleccione uno
    if (this.pago!.banco) {
      //validar que se haya seleccionado un banco
      if (!this.banco) {
        this.openSnackbar("Por favor Seleccione un banco.");
        return;
      }


      //si el banco tiene cuentas disponibles validar que se seleccione una
      if (this.cuentas.length > 0) {
        //validar que se haya seleccioando una cuenta
        if (!this.cuentaSelect) {
          this.openSnackbar("Por favor Seleccione una cuenta bancaria.");
          return;
        }
      }
    }

    //Cambio
    let diference: number = 0;

    //Si el monto agregado es mayor que el saldo pendiente de pagar
    if (monto! > this.saldo) {
      //Calcular diferencia (cambio)
      diference = monto! - this.saldo;
      //nuevo monto es igual al saldo pendiente de pagar 
      monto = this.saldo;
    }

    //auroizacion vacia si no se reuqiere
    let auth: string = this.pago!.autorizacion ? this.autorizacion : "";

    //referencia vacia si no se requiere
    let ref: string = this.pago!.referencia ? this.referencia : "";

    //agregar cargo abono
    this.montos.push({
      checked: this.selectAllMontos,
      amount: monto!,
      authorization: auth,
      reference: ref,
      payment: this.pago!,
      bank: this.banco,
      account: this.cuentaSelect,
      difference: diference,
    });

    this.calculateTotal();

    this.openSnackbar("Pago agregado correctamente.");
    //despues de agregar la forma de pago limpiar todos los datos relacionados para evitar datos incorrectos
    this.autorizacion = "";
    this.referencia = "";
    this.cuentas = [];
    this.bancos = [];
    this.banco = undefined;
    this.cuentaSelect = undefined;
    this.forms = false;

  }



  //ver formas de pago
  viewPayments() {
    this.autorizacion = ""; //campo autorizacion en blanco
    this.referencia = ""; //campo refrencia en blanco
    this.cuentas = []; //Vaciar ceuntas bancarias
    this.bancos = []; //vaciar bancos diponibles
    this.banco = undefined; //banco seleccionado vacio
    this.cuentaSelect = undefined; //ceunta bancaria seleccionad avacia
    this.forms = false; //oculatar formularios

    this.formasPago = this.formasPago.map((pago, index) => ({
      ...pago,
      select: index === 0
    }));
  }


  //Cambiar de banco
  async changeBanco() {
    this.cuentas = []; 
    //simula caragr cuentas de banrural
    //TODO:Cargar cuentas bancarias
    if (this.banco!.banco == 4) {
      this.cuentas = cuentas;

    }
  }
  //seleccionar o no, todas las formmas de pago
  selectAll() {
    this.montos.forEach(element => {
      element.checked = this.selectAllMontos; //asiganer valor del checkbox a las formas de pago
    });

  }


  // Función para manejar la eliminación de pagos seleccionados
  async deleteAmount() {
    //buscar formas de pagos seleccioandas
    let montosSeleccionados: MontoIntreface[] = this.montos.filter((monto) => monto.checked);

    //Alerta al intentar eliminar pagos sin tener seleccionada ninguna
    if (montosSeleccionados.length == 0) {
      this.openSnackbar("Selecciona por lo menos un monto.");
      return;
    }

    //Dialogo de confirmacion
    let verificador = await this.openDialogActions();

    if (!verificador) return;


    //si se confurma la eliminacion la lista de montos queda con los lementos que no estén seleccioandos 
    this.montos = this.montos.filter((monto) => !monto.checked);

    //Sleccionar todos se marca en false
    this.selectAllMontos = false;
    //calcular totales
    this.calculateTotal();

    //montos elimminados
  }


  //calcular totales de pago
  calculateTotal() {
    //TOTALES
    this.saldo = 0;
    this.cambio = 0;
    this.pagado = 0;

    //Buscar cuanto se ha pagado en la lista de pagos
    this.montos.forEach(element => {
      this.pagado += element.amount;
    });

    //Buscar cuanto se ha pagado en la lista de pagos
    this.montos.forEach(element => {
      this.pagado += element.difference;
    });

    //calcular y cambio y saldo pendiente de pagar
    if (this.pagado > this.total) {
      this.cambio = this.pagado - this.total;
    } else {
      this.saldo = this.total - this.pagado;
    }

    //Agregar saldo pendiente a la variebale del input monto en pago
    this.monto = parseFloat(this.saldo.toFixed(2)).toString();
  
  }


  

    //Abrir dialogo de confirmacion, devuelve falso o verdadero dependiendo de la opcion seleccioanda
    openDialogActions(): Promise<boolean> {
      return new Promise((resolve, reject) => {
          const dialogRef = this._dialog.open(DialogActionsComponent);

          dialogRef.afterClosed().subscribe(result => {
              if (result) {
                  resolve(true);
              } else {
                  resolve(false);
              }
          });
      });
  }
}
