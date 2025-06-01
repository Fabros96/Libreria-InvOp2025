import express from "express";
import { ProveedorController } from "../controllers/proveedor.controller";
import { EstadoOrdenCompraController } from "../controllers/estado-orden-compra.controller";
import { InventarioController } from "../controllers/inventario.controller";
import { ArticuloProveedorController } from "../controllers/articulo-proveedor.controller";
import { ArticuloController } from "../controllers/articulo.controller";
import { VentaController } from "../controllers/venta.controller";
import { OrdenCompraController } from "../controllers/orden-compra.controller";

const router = express.Router();

// proveedor
router.get("/proveedores", ProveedorController.getAll);
router.get("/proveedores/:id", ProveedorController.getById);
router.post("/proveedores", ProveedorController.create);
router.put("/proveedores/:id", ProveedorController.update);
router.delete("/proveedores/:id", ProveedorController.delete);

// estado orden compra
router.get("/estado-orden-compras", EstadoOrdenCompraController.getAll);
router.get("/estado-orden-compras/:id", EstadoOrdenCompraController.getById);
router.post("/estado-orden-compras", EstadoOrdenCompraController.create);
router.put("/estado-orden-compras/:id", EstadoOrdenCompraController.update);
router.delete("/estado-orden-compras/:id", EstadoOrdenCompraController.delete);

// inventario
router.get("/inventarios", InventarioController.getAll);
router.get("/inventarios/:id", InventarioController.getById);
router.post("/inventarios", InventarioController.create);
router.put("/inventarios/:id", InventarioController.update);
router.delete("/inventarios/:id", InventarioController.delete);

// articulo proveedor
router.get("/articulo-proveedores", ArticuloProveedorController.getAll);
router.get("/articulo-proveedores/:id", ArticuloProveedorController.getById);
router.post("/articulo-proveedores", ArticuloProveedorController.create);
router.put("/articulo-proveedores/:id", ArticuloProveedorController.update);
router.delete("/articulo-proveedores/:id", ArticuloProveedorController.delete);

// articulo
router.get("/articulos", ArticuloController.getAll);
router.get("/articulos/:id", ArticuloController.getById);
router.post("/articulos", ArticuloController.create);
router.put("/articulos/:id", ArticuloController.update);
router.delete("/articulos/:id", ArticuloController.delete);

// venta
router.get("/ventas", VentaController.getAll);
router.get("/ventas/:id", VentaController.getById);
router.post("/ventas", VentaController.create);
router.put("/ventas/:id", VentaController.update);
router.delete("/ventas/:id", VentaController.delete);

// orden compra
router.get("/orden-compras", OrdenCompraController.getAll);
router.get("/orden-compras/:id", OrdenCompraController.getById);
router.post("/orden-compras", OrdenCompraController.create);
router.put("/orden-compras/:id", OrdenCompraController.update);
router.delete("/orden-compras/:id", OrdenCompraController.delete);

export default router;