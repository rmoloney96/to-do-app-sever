import express from 'express';
import pool from './db.js'
import cors from 'cors';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT ?? 8000;
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('Hello');
})

// Get all todos
app.get('/todos/:userEmail', async (req, res) => {
    console.log(req)
    const {userEmail} = req.params;
    console.log(userEmail);
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE user_email = $1', [userEmail]);
        res.json(todos.rows);
    } catch(err) {
        console.log(err);
    }
})

// Create a new todo
app.post('/todos', async (req, res) => {
    const {user_email, title, progress, date} = req.body;
    const id = uuidv4();
    console.log(user_email, title, progress, date);
    try {
        const newToDo = await pool.query(`INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`, 
        [id, user_email, title, progress, date]);
        res.json(newToDo)
    } catch(error) {
        console.error(error);
    }
})

// Edit a todo
app.put('/todos/:id', async (req, res) => {
    const {id} = req.params;
    const {user_email, title, progress, date} = req.body;
    try {
        const editToDo = await pool.query('UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;', 
        [user_email, title, progress, date, id]);
        res.json(editToDo);
    } catch (error) {
        console.error(error);
    }
})

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const deleteToDo = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.json(deleteToDo)
    } catch (error) {
        console.error(error);
    }
})

// Signup
app.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try {
        const signUp = await pool.query(`INSERT INTO users (email, hashed_password) VALUES($1, $2)`, 
        [email, hashedPassword]);
        const token = jwt.sign({email}, 'secret', {expiresIn: '1hr'});
        res.json({email, token});
    } catch(error) {
        console.error(error);
        if(error) {
            res.json({detail: error.detail})
        }
    }
})

// Login
app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(!users.rows.length) {
            return res.json({detail: 'User does not exist!'});
        }
        const success = await bcrypt.compare(password, users.rows[0].hashed_password);
        const token = jwt.sign({email}, 'secret', {expiresIn: '1hr'});
        if(success) {
            res.json({'email': users.rows[0].email, token})
        }else {
            res.json({detail: 'Login failed'});
        }
    } catch(error) {
        console.error(error);
    }
})

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
