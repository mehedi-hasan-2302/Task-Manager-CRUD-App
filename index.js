const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;
const TASKS_FILE = 'tasks.json';

app.use(bodyParser.json());

let tasks = [];

async function loadTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE);
        tasks = JSON.parse(data);
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

async function saveTasks() {
    try {
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error('Error saving tasks:', err);
    }
}

loadTasks();


// post tasks
app.post('/tasks', async (req, res) => {
    const { title, description, status } = req.body;
    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required.' });
    }

    const id = tasks.length + 1;
    const newTask = { id, title, description, status };
    tasks.push(newTask);

    await saveTasks();
    res.status(200).json(newTask);
});



//get all tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});



//get tasks sorted according to the id
app.get('/tasks/sortById', (req, res) => {
    try {
        const sortedTask = tasks.slice().sort((a, b) => a.id - b.id);
        res.status(200).json(sortedTask);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


//get tasks sorted according to their status
app.get('/tasks/sortByStatus', (req, res) => {
    try {
        const sortedTasks = tasks.slice().sort((a, b) => a.status.localeCompare(b.status));
        res.status(200).json(sortedTasks);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// Search any task by title or description
app.get('/tasks/search', (req, res) => {
    const { title, description } = req.body;

    if (!title && !description) {
        return res.status(400).json({ error: 'Title or description is required in the request body.' });
    }

    const searchResults = tasks.filter(task =>
        (!title || task.title.toLowerCase().includes(title.toLowerCase())) &&
        (!description || (task.description && task.description.toLowerCase().includes(description.toLowerCase())))
    );

    if (searchResults.length === 0) {
        return res.status(404).json({ message: 'No tasks found matching the search criteria.' });
    }

    res.status(200).json(searchResults);
});


//get a single task by their id
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(task);
});



//update a task
app.put('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], title, description, status };
    await saveTasks();
    res.json(tasks[taskIndex]);
});



//delete a task
app.delete('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    tasks.splice(taskIndex, 1);
    await saveTasks();
    res.sendStatus(204);
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
