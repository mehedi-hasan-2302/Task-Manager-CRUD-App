const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises'); 

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


app.get('/tasks', (req, res) => {
    res.json(tasks);
});


app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(task);
});


