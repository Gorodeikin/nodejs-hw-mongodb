import express from "express";
import cors from "cors";
import pino from "pino-http";
import cookieParser from "cookie-parser";
import contactsRouter from "./routers/contacts.js";
import authRouter from "./routers/auth.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import fs from "fs";
import path from "path";

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(pino());

  app.use("/auth", authRouter);
  app.use("/contacts", contactsRouter);


  const swaggerJsonPath = path.resolve(process.cwd(), "docs", "swagger.json");
  let swaggerDocument;
  
  if (fs.existsSync(swaggerJsonPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, "utf8"));
  } else {
    const yamlPath = path.resolve(process.cwd(), "docs", "openapi.yaml");
    if (fs.existsSync(yamlPath)) {
      swaggerDocument = YAML.load(yamlPath);
    } else {
      swaggerDocument = null;
    }
  }

  if (swaggerDocument) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
    }));
  } else {
    app.get("/api-docs", (req, res) => {
      res.status(404).send("API docs not found. Run `npm run build-docs` or ensure docs/openapi.yaml exists.");
    });
  }


  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}