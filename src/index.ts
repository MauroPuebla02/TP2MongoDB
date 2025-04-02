import path from "path";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, "public")));

// Middleware específico para scripts (asegura que los archivos .js tengan el MIME correcto)
app.use(
  "/scripts",
  express.static(path.join(__dirname, "public", "scripts"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "rutas", "NoticiaRuta.ts"));
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
