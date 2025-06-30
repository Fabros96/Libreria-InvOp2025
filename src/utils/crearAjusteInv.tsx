import axiosClient from "../api/axiosClient";

export async function crearAjusteInv(
  updatedArticulo: any,
  artOriginal: any,
  updateProveedor: any | undefined,
  provOriginal: any | undefined
) {
  const cambios: { campo: string; valorOriginal: any; valorNuevo: any }[] = [];

  // Comparar campos del artículo
  for (const campo in updatedArticulo) {
    if (
      Object.prototype.hasOwnProperty.call(artOriginal, campo) &&
      updatedArticulo[campo] !== artOriginal[campo]
    ) {
      cambios.push({
        campo,
        valorOriginal: artOriginal[campo],
        valorNuevo: updatedArticulo[campo],
      });
    }
  }

  console.log(cambios);
  

  // Comparar campos del proveedor (si existen)
  if (updateProveedor && provOriginal) {
    for (const campo in updateProveedor) {
      if (
        Object.prototype.hasOwnProperty.call(provOriginal, campo) &&
        updateProveedor[campo] !== provOriginal[campo]
      ) {
        cambios.push({
          campo: `proveedor.${campo}`,
          valorOriginal: provOriginal[campo],
          valorNuevo: updateProveedor[campo],
        });
      }
    }
  }

  // Podés enviar el arreglo a tu backend, guardarlo en base de datos, etc.
  if (cambios.length > 0) {
      console.log("Cambios detectados:", cambios);

    // Ejemplo de cómo enviar los cambios si necesitás:
    // await axiosClient.post("/ajustes", { cambios });
  } else {
    console.log("No hay cambios");
  }

  console.log(cambios);
  

  return cambios;
}
