export interface OrdenCompra {
  idOrdenCompra: number;
  idArticulo: number;
  idProveedor: number;
  idEstadoOrdenCompra: number;
  fechaBaja: Date;
  cantidad: number;
  fechaCreacion: string;
  articulo: {
    descripcion: string;
  };
  proveedor: {
    nombre: string;
  };
  estadoOrdenCompra: {
    nombre: string;
  };
}

export interface Articulo {
  idArticulo: number;
  descripcion: string;
}

export interface Proveedor {
  idProveedor: number;
  nombre: string;
}

export interface estadoOrdenCompra {
    idEstadoOrdenCompra: number;
    nombre: string;
}