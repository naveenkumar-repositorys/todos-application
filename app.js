const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
app.use(express.json());

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

//API-1

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
  //console.log(dbResponse);
  response.send(dbResponse);
});

//API-2

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let specificTodo = `SELECT * FROM todo 
        WHERE id = ${todoId};`;
  let dbResponse = await db.get(specificTodo);
  //console.log(dbResponse);
  response.send(dbResponse);
});

//API-3

app.post("/todos/", async (request, response) => {
  const requestDetails = request.body;
  const { id, todo, priority, status } = requestDetails;
  const addTodoQuery = `INSERT INTO 
        todo(id,todo,priority,status)
        VALUES(
            ${id},
            "${todo}",
            "${priority}",
            "${status}"
        );`;
  let dbResponse = await db.run(addTodoQuery);
  console.log(dbResponse);
  response.send("Todo Successfully Added");
});

//API-4

app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { status, priority, todo } = request.body;
  //console.log(status);
  let selectInQuery = "";
  let updatedStatus = "";
  switch (true) {
    case status !== undefined:
      selectInQuery = `UPDATE todo 
        SET status = "${status}"
        WHERE id = ${todoId};`;
      updatedStatus = "Status Updated";
      break;
    case priority !== undefined:
      selectInQuery = `UPDATE todo 
        SET priority = "${priority}"
        WHERE id = ${todoId};`;
      updatedStatus = "Priority Updated";
      break;
    case todo !== undefined:
      selectInQuery = `UPDATE todo 
        SET todo = "${todo}"
        WHERE id = ${todoId};`;
      updatedStatus = "Todo Updated";
      break;
  }

  let dbResponse = await db.run(selectInQuery);
  console.log(dbResponse);
  response.send(updatedStatus);
});

//API-5

app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let deleteTodoQuery = `DELETE FROM todo
    WHERE id = ${todoId};`;
  let dbResponse = await db.run(deleteTodoQuery);
  console.log(dbResponse);
  response.send("Todo Deleted");
});

module.exports = app;
