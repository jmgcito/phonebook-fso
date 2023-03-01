const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("postData", (request) => {
  const body = request.body;
  return body.name || body.number
    ? JSON.stringify({ name: body.name, number: body.number })
    : " ";
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

app.post("/api/persons", (request, response) => {
  // do not forget to add express json parser
  // otherwise, body will be undefined
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "missing name",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "missing number",
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

app.get("/", (request, response) => {
  response.send("Hello World");
});

app.get("/api/persons", (request, response) => {
  response.send(persons);
});

const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((person) => person.id === id);
  if (person) {
    response.send(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id != id);
  response.status(204).end();
});

app.get("/info", (request, response) => {
  const info = {
    amount: `Phonebook has info for ${persons.length} ${
      persons.length > 1 ? "people" : "person"
    }`,
    date: new Date(),
  };
  response.send(`<div>${info.amount}<br/>${info.date}<div/>`);
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
