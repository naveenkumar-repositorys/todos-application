const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

//FUNCTIONS:

let isPriorityWithStatus = (requestEle) => {
  return requestEle.status !== undefined && requestEle.priority !== undefined;
};
let isPriority = (requestEle) => {
  return requestEle.priority !== undefined;
};
let isStatus = (requestEle) => {
  return requestEle.status !== undefined;
  //console.log(requestEle.status);
};

//INITIALIZATION DB AND SERVER

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  let { status, priority, search_q = "" } = request.query;
  //console.log(status);
  let selectInQuery = "";
  switch (true) {
    case isStatus(request.query):
      selectInQuery = `SELECT * FROM todo 
        WHERE status = "${status}";`;
      break;
    case isPriority(request.query):
      selectInQuery = `SELECT * FROM todo 
            WHERE priority = "${priority}";`;
      break;
    case isPriorityWithStatus(request.query):
      selectInQuery = `SELECT * FROM todo
        WHERE priority = "${priority}"
            AND status  =  "${status}";`;
      break;
    default:
      selectInQuery = `SELECT * FROM todo 
        WHERE todo LIKE "%${search_q}%";`;
      break;
  }

  let dbResponse = await db.all(selectInQuery);
  console.log(dbResponse);
});
