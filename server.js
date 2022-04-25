const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.json({ server: ' todo server is online' })
})



// mongo db 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@todo.8pi5d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect()
        console.log('database connected ...')
        const todoCollection = client.db("todo").collection("todo-list");

        // get todo
        app.get('/todo', async (req, res) => {
            const query = {}
            const cursor = todoCollection.find(query)
            const todo = await cursor.toArray()
            res.json({ todo })
        })
        // post todo
        app.post('/todo', async (req, res) => {
            const { todo } = req.body
            const result = await todoCollection.insertOne(todo)
            if (result.insertedId) {
                const query = {}
                const cursor = todoCollection.find(query)
                const todo = await cursor.toArray()
                res.json({ todo })
            }
        })
        // remove a  todo item
        app.delete('/todo/:id', async (req, res) => {
            const { id } = req.params
            const doc = { _id: ObjectId(id) }
            const deletedItem = await todoCollection.deleteOne(doc)
            if (deletedItem.deletedCount) {
                const query = {}
                const cursor = todoCollection.find(query)
                const todo = await cursor.toArray()
                res.json({ todo })
            }
        })
        // update a  todo item
        app.put('/todo/:id', async (req, res) => {
            const { id } = req.params
            const { message, isDone } = req.body.updateTodo
            const doc = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = { $set: { message, isDone } }
            const result = await todoCollection.updateOne(doc, updatedDoc, option)
            if (result.acknowledged) {
                const query = {}
                const cursor = todoCollection.find(query)
                const todo = await cursor.toArray()
                res.json({ todo })
            }
        })
    } finally {

    }

}

run().catch(console.dir)




app.listen(port, () => {
    console.log(`server is onlien on port ${port}...`)
})