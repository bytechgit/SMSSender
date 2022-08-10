import express from "express";
import { createRequire } from "module";
import { createServer } from "http";
const require = createRequire(import.meta.url);
import { BTSocketIO } from "./SocketIO.js";
require("dotenv").config();
const bodyParser = require("body-parser");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
var port = process.env.PORT || "3000";
app.set("port", port);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("/"));
var server = createServer(app);
server.listen(port, () => {
    console.log("server is running on port " + port);
});
BTSocketIO.init(server);
server.on("error", () => {
    console.log("error");
});
server.on("listening", () => { });
/*
let MongoDataBase: Db;
const MongoDBClient: MongoClient = new MongoClient(
  process.env.MONGODB_CONNECTION_STRING ?? ""
);
MongoDBClient.connect()
  .then((e) => {
    MongoDataBase = MongoDBClient.db("announcement");
    console.log("Connected to our mongodb instance, database announcement!");
  })
  .catch((err) => console.log("MongoDB ERROR: " + err));
*/
app.get("/", (req, res) => {
    res.send("Hello!");
});
