const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors=require("cors");
const BASE_URL=process.env.BASE_URL
const app = express();
app.use(cors());
app.use(express.json()); // Added to parse JSON request bodies

const dbPath = path.join(__dirname, "MyDatabase.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const port = process.env.PORT || 5015;

    app.listen(port, () => {
      console.log("Server Running at http://localhost:5015");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get('/classes', (req, res) => {
  db.all('SELECT * FROM class', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/classes', (req, res) => {
  const { class_name } = req.body;
  db.run('INSERT INTO class (class_name) VALUES (?)', [class_name], (err) => {
    if (err) throw err;
    res.send('Class added successfully');
  });
});

app.get('/students', async (req, res) => {
  try {
    const students = await db.all('SELECT * FROM student');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/students', (req, res) => {
  const { student_name, class_id } = req.body;
  db.run('INSERT INTO student (student_name, class_id) VALUES (?, ?)', [student_name, class_id], (err) => {
    if (err) throw err;
    res.send('Student added successfully');
  });
});

app.put('/students/:id', (req, res) => {
  const { student_name, class_id } = req.body;
  const studentId = req.params.id;
  db.run('UPDATE student SET student_name = ?, class_id = ? WHERE student_id = ?', [student_name, class_id, studentId], (err) => {
    if (err) throw err;
    res.send('Student updated successfully');
  });
});

app.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;
  db.run('DELETE FROM student WHERE student_id = ?', [studentId], (err) => {
    if (err) throw err;
    res.send('Student deleted successfully');
  });
});

module.exports = app;
