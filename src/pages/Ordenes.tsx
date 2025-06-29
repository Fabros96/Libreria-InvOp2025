import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

interface OrdenCompra {
  idOrdenCompra: number;
  idArticulo: number;
  idProveedor: number;
  idEstadoOrdenCompra: number;
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

interface Articulo {
  idArticulo: number;
  descripcion: string;
}

interface Proveedor {
  idProveedor: number;
  nombre: string;
}

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [idArticulo, setIdArticulo] = useState<number | null>(null);
  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensaje, setMensaje] = useState<string>("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompra | null>(null);
  
  const [modo, setModo] = useState<"crear" | "modificar" | "estado">("crear");

  useEffect(() => {
    const fetchData = async () => {
      const resOrdenes = await axiosClient.get("/orden-compras?filter[include]=articulo,proveedor,estadoOrdenCompra");
      setOrdenes(resOrdenes.data);

      const resArt = await axiosClient.get("/articulos?filter[fechaBaja][eq]=null");
      setArticulos(resArt.data);

      const resProv = await axiosClient.get("/proveedores");
      setProveedores(resProv.data);
    };
    fetchData();
  }, []);

  // Cargar proveedor predeterminado al cambiar el artículo
useEffect(() => {
  const buscarProveedorPredeterminado = async (idArt: number) => {
    try {
      const res = await axiosClient.get(`/articulo-proveedores/predeterminado/${idArt}`);
      console.log("respuesta cruda: ", res.data)
      const proveedor = res.data?.proveedor
      if (proveedor?.idProveedor) {
        setIdProveedor(proveedor.nombre);
        console.log("Proveedor predeterminado seteado automáticamente:", proveedor.nombre);
      } else {
        console.log(res.data.proveedor.nombre)
        console.log("No se encontró proveedor predeterminado");
      }
    } catch (error) {
      console.error("Error al buscar proveedor predeterminado:", error);
    }
  };

  if (idArticulo !== null && proveedores.length > 0) {
    buscarProveedorPredeterminado(idArticulo);
  }
}, [idArticulo, proveedores]);



  const crearOrden = async () => {
    try {
      if (!idArticulo || !idProveedor || cantidad <= 0) {
        setMensaje("Todos los campos son obligatorios y la cantidad debe ser mayor que cero.");
        return;
      }
      const nuevaOrden = {
        idArticulo,
        idProveedor,
        idEstadoOrdenCompra: 3,
        cantidad,
        fechaCreacion: new Date().toISOString(),
      };
      await axiosClient.post("/orden-compras", nuevaOrden);
      setMensaje("Orden creada exitosamente.");
    } catch (err: any) {
      setMensaje("Error al crear: " + (err.response?.data?.msg || err.message));
    }
  };

  //   const buscarProveedorPredeterminado = async (idArticulo: number) => {
  //   try {
  //     const res = await axiosClient.get(`/articulo-proveedores/predeterminado/${idArticulo}`);
  //     const lista = res.data?.datos || res.data || [];

  //     if (lista.length > 0) {
  //       const predeterminado = lista[0]; // debería haber solo uno
  //       setIdProveedor(predeterminado.idProveedor);
  //     } else {
  //       setIdProveedor(null); // si no hay predeterminado
  //     }
  //   } catch (error) {
  //     console.error("Error al buscar proveedor predeterminado:", error);
  //     setIdProveedor(null);
  //   }
  // };





  const modificarOrden = async () => {
    if (!ordenSeleccionada) return;
    try {
      const actualizada = {
        idArticulo: idArticulo!,
        idProveedor: idProveedor!,
        idEstadoOrdenCompra: ordenSeleccionada.idEstadoOrdenCompra,
        cantidad,
        fechaCreacion: ordenSeleccionada.fechaCreacion,
      };
      await axiosClient.put(`/orden-compras/${ordenSeleccionada.idOrdenCompra}`, actualizada);
      setMensaje("Orden modificada correctamente.");
    } catch (err: any) {
      setMensaje("Error al modificar: " + (err.response?.data?.msg || err.message));
    }
  };

  const cambiarEstadoOrden = async (nuevoEstado: number) => {
    if (!ordenSeleccionada) return;
    try {
      await axiosClient.put(`/orden-compras/${ordenSeleccionada.idOrdenCompra}`, {
        idEstadoOrdenCompra: nuevoEstado,
      });
      setMensaje("Estado actualizado correctamente.");
    } catch (err: any) {
      setMensaje("Error al cambiar estado: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Órdenes de Compra</h1>

      {mensaje && (
        <div className="mb-4 text-sm text-green-600 bg-green-100 px-4 py-2 rounded">
          {mensaje}
        </div>
      )}

    <div className="mb-1">
    <button
        onClick={() => {
        setModo("crear");
        setIdArticulo(null);
        setIdProveedor(null);
        setCantidad(1);
        setOrdenSeleccionada(null);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 text-sm rounded flex items-center space-x-2"
    >
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-1 h-1"
        >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nueva Orden</span>
    </button>
    </div>


      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Artículo</th>
            <th className="px-4 py-2 border">Proveedor</th>
            <th className="px-4 py-2 border">Cantidad</th>
            <th className="px-4 py-2 border">Fecha</th>
            <th className="px-4 py-2 border">Estado</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.idOrdenCompra} className="text-center">
              <td className="px-4 py-2 border">{orden.articulo?.descripcion}</td>
              <td className="px-4 py-2 border">{orden.proveedor?.nombre}</td>
              <td className="px-4 py-2 border">{orden.cantidad}</td>
              <td className="px-4 py-2 border">{new Date(orden.fechaCreacion).toLocaleDateString()}</td>
              <td className="px-4 py-2 border">{orden.estadoOrdenCompra?.nombre}</td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setModo("modificar");
                    setOrdenSeleccionada(orden);
                    setIdArticulo(orden.idArticulo);
                    setIdProveedor(orden.idProveedor);
                    setCantidad(orden.cantidad);
                  }}
                >
                  Modificar
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setModo("estado");
                    setOrdenSeleccionada(orden);
                  }}
                >
                  Cambiar estado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario dinámico */}
      {modo === "crear" || modo === "modificar" ? (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">
            {modo === "crear" ? "Crear Nueva Orden" : "Modificar Orden"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block">Artículo:</label>
            <select
              value={idArticulo ?? ""}
              onChange={(e) => {
                const nuevoIdArticulo = Number(e.target.value);
                setIdArticulo(nuevoIdArticulo); // ← solo esto
              }}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Seleccionar...</option>
              {articulos.map((a) => (
                <option key={a.idArticulo} value={a.idArticulo}>
                  {a.descripcion}
                </option>
              ))}
            </select>

            </div>
            <div>
              <label className="block">Proveedor:</label>
            <select
              value={idProveedor ?? ""}
              onChange={(e) => setIdProveedor(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Seleccionar...</option>
              {proveedores.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>
                  {p.nombre}
                </option>
              ))}
            </select>
            </div>
            <div>
              <label className="block">Cantidad:</label>
              <input
                type="number"
                value={cantidad}
                min={1}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <button
              onClick={modo === "crear" ? crearOrden : modificarOrden}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {modo === "crear" ? "Crear Orden" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      ) : null}

      {modo === "estado" && ordenSeleccionada && (
  <div className="mt-6 border-t pt-4">
    <h2 className="text-lg font-semibold mb-2">Cambiar Estado</h2>

    {/* Nombre del artículo */}
    <div className="text-sm text-gray-700 mb-3">
      Orden #{ordenSeleccionada.idOrdenCompra} — Artículo: <span className="font-medium">{ordenSeleccionada.articulo?.descripcion}</span>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={() => cambiarEstadoOrden(1)}
        className="bg-purple-600 text-white px-3 py-1 rounded"
      >
        Cancelada
      </button>
      <button
        onClick={() => cambiarEstadoOrden(2)}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Finalizada
      </button>
      <button
        onClick={() => cambiarEstadoOrden(3)}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Pendiente
      </button>
      <button
        onClick={() => cambiarEstadoOrden(4)}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Enviada
      </button>
    </div>
  </div>
)}

    </div>
  );
}

