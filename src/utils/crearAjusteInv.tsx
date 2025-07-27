import axiosClient from "../api/axiosClient";

export const crearAjusteInv = async (
  articuloOriginal: any,
  cambios: any,
  proveedorOriginal: any,
  proveedorModificado: any
) => {

  let ajustesTotales: any[] = [];


  if (cambios && (!articuloOriginal && !proveedorModificado && !proveedorOriginal)) {
    ajustesTotales.push(...ajusteDeCreacion(cambios));
  } else if (articuloOriginal && !cambios) {
    ajustesTotales.push(...ajusteDeEliminacion(articuloOriginal));
  } else {

    if (cambios && articuloOriginal) {
      ajustesTotales.push(...extraerCambiosArtOriginal(articuloOriginal, cambios));
    }
    if (proveedorModificado) {
      ajustesTotales.push(...extraerCambiosProveedor(proveedorOriginal, proveedorModificado));
    }
  }
  try {
    await axiosClient.post("/ajuste-Inventarios", ajustesTotales);
  } catch (error) {
    console.error("Error al crear el ajuste de inventario desde el back:", error);
  }
}


type Formato = {
  idArticulo: number;
  fecha: string;
  atributo: string;
  userName: string;
  valorNuevo: any;
  valorOriginal: any;
}

function extraerCambiosArtOriginal(articulo: any, cambios: any): Formato[] {
  const resultadoArt: Formato[] = [];

  const idArticulo = articulo.idArticulo;
  const fechaActual = obtenerFechaActual();
  const userName = "Usuario"; // Fijo por ahora

  for (const key in cambios) {
    if (typeof cambios[key] === "object" && cambios[key] !== null) {
      for (const subKey in cambios[key]) {
        const valorArticulo = articulo[key]?.[subKey];
        const valorCambio = cambios[key][subKey];

        if (valorArticulo !== valorCambio) {
          resultadoArt.push({
            atributo: `${key}.${subKey}`,
            fecha: fechaActual,
            idArticulo,
            userName,
            valorNuevo: valorCambio,
            valorOriginal: valorArticulo,
          });
        }
      }
    } else {
      const valorArticulo = articulo[key];
      const valorCambio = cambios[key];

      if (valorArticulo !== valorCambio) {
        resultadoArt.push({
          atributo: key,
          fecha: fechaActual,
          idArticulo,
          userName,
          valorNuevo: valorCambio,
          valorOriginal: valorArticulo,
        });
      }
    }
  }

  return resultadoArt;
}
function extraerCambiosProveedor(proveedorOriginal: any, proveedorModificado: any): Formato[] {
  const provModificado = proveedorModificado.proveedor;

  const idArticulo = proveedorModificado.idArticulo;
  const fechaActual = obtenerFechaActual();
  const userName = "Usuario"; // Fijo por ahora

  const resultadoProv: Formato[] = [];

  if (proveedorOriginal) {
    const provOriginal = proveedorOriginal.proveedor;

    resultadoProv.push({
      atributo: "proveedor",
      fecha: fechaActual,
      idArticulo,
      userName,
      valorNuevo: "#" + provModificado.idProveedor + "-" + provModificado.nombre,
      valorOriginal: "#" + provOriginal.idProveedor + "-" + provOriginal.nombre,
    });

    return resultadoProv;

  } else if (!proveedorOriginal) {

    resultadoProv.push({
      atributo: "proveedor",
      fecha: fechaActual,
      idArticulo,
      userName,
      valorNuevo: "#" + provModificado.idProveedor + "-" + provModificado.nombre,
      valorOriginal: "S/Prov-Creacion",
    });

    return resultadoProv;
  }

  return resultadoProv;
}

function obtenerFechaActual(): string {
  const ahora = new Date();
  return ahora.toISOString();
}


function ajusteDeEliminacion(articulo: any): Formato[] {
  const resultadoArt: Formato[] = [];

  const idArticulo = articulo.idArticulo;
  const fechaActual = obtenerFechaActual();
  const userName = "Usuario"; // Fijo por ahora


  resultadoArt.push({
    atributo: "Eliminación",
    fecha: fechaActual,
    idArticulo,
    userName,
    valorNuevo: "Eliminado",
    valorOriginal: "-",
  });

  return resultadoArt;
}




function ajusteDeCreacion(articulo: any): Formato[] {
  const resultadoArt: Formato[] = [];

  const idArticulo = articulo.idArticulo;
  const fechaActual = obtenerFechaActual();
  const userName = "Usuario"; // Fijo por ahora


  resultadoArt.push({
    atributo: "Creación",
    fecha: fechaActual,
    idArticulo,
    userName,
    valorNuevo: "Creado",
    valorOriginal: "-",
  });

  return resultadoArt;

}