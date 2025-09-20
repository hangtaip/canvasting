import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __devPath = `${__dirname}/dist`;

app.use(express.static(__devPath));

app.use((req, res) => {
   res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(port, () => {
   console.log(`${getAppName()} running at http://localhost:${port}`);
});

function getAppName() {
   try {
      const pkgPath  = path.join(__dirname, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath), "utf-8");
      return pkg.name || "App";
   } catch(e) {
      console.log(e);
      return "App";
   }
}
