import express, { Request, Response } from "express";
// import firebaseRoutes from "./routes/firebase.routes";
import routes from "./routes/routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;
import path from 'path';

app.set("port", PORT);

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', //'localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
app.use(routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Api REST Investigacion Operativa!");
});

// Registrar las rutas
// app.use("/api", firebaseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
