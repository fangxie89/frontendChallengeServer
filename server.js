import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; 

const app = express();
const PORT = 3001 ;

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "employees.json");

app.use(express.json()); 

// tool functions
function readData() {
  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Get all employees
app.get("/api/v1/employees", (req, res) => {
  try {
    const employees = readData();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to read employees data" });
  }
});

// get employee by id
app.get("/api/v1/employee/:id", (req, res) => {
  try {
    const employees = readData();
    console.log(employees);
    const employee = employees.data.find((e) => e.id === parseInt(req.params.id));
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee data" });
  }
});

// create new employee
app.post("/api/v1/create", (req, res) => {
  try {
    const response = readData();
    const newEmployee = {
      id: response.data.length > 0 ? response.data[response.data.length - 1].id + 1 : 1,
      ...req.body,
    };
    response.data.push(newEmployee);
    writeData(response);

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: "Failed to create employee record" });
  }
});

// update employee by id
app.put("/api/v1/update/:id", (req, res) => {
  try {
    const response = readData();
    const id = parseInt(req.params.id);
    const employeeIndex = response.data.findIndex((e) => e.id === id);

    if (employeeIndex !== -1) {
      response.data[employeeIndex] = { id, ...req.body };
      writeData(response);
      res.json(response.data[employeeIndex]);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update employee record" });
  }
});

// delete employee
app.delete("/api/v1/delete/:id", (req, res) => {
  try {
    const response = readData();
    const id = parseInt(req.params.id);
    const filteredEmployees = response.data.filter((e) => e.id !== id);
    if (filteredEmployees.length !== response.data.length) {
      response.data = filteredEmployees;
      console.log(response);
      writeData(response);
      res.json({ message: "Employee deleted successfully" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee record" });
  }
});

// start server on 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});