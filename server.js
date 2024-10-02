const express = require('express')
const app = express()
const port = 3000
const mysql2 = require('mysql2')
const bcrypt = require('bcrypt')
const saltRounds = 10

//for cors middleware
const cors = require('cors') 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Create the connection to database
const conn = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restapi',
});

//get all users
app.get('/users', async (req, res) => {
  let sql = "SELECT * FROM users"

  await conn.execute(sql, (err, result) => {
    if (err) {
        res.status(500).json({
            message: err.message
        })
        return

    }
    res.status(200).json({
        message: 'Get all users successfully',
        data : result
    })
  })
})

//get user by id
app.get('/users/:id', async (req, res) => {
    let sql = "SELECT * FROM users WHERE id = ?"
    let id = req.params.id
    await conn.execute(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({
                message: err.message
            })
            return
        }
        res.status(200).json({
            message: 'Get user successfully',
            data : result
        })
    })
})

//create users
app.post('/users', async (req, res) => {
    const{email,password} = req.body
    let role = 'member'
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password,salt, (err, hash) => {
            //res.send(hash) for get hash example
            let sql = "INSERT INTO users (email, password, role) VALUES (?,?,?)"
            let values = [email, hash, role]
            conn.execute(sql, values,
                (err, result) => {
                    if (err) {
                        res.status(500).json({
                            message: err.message
                        })
                        return
                    }
                    res.status(201).json({
                        message: 'User created successfully',
                        data : result
                    })
                }
            )
        }) 
    })
})

//update user
app.put('/users/:id', async (req, res) => {
    const{email, password} = req.body
    const {id} = req.params
    //let role = 'admin' use in case that need role admin to update user
    await bcrypt.genSalt(saltRounds, async (err, salt) => {
        await bcrypt.hash(password, salt, async (err, hash) => {
            let sql = "UPDATE users SET email =?, password =? WHERE id =?"
            //let values = [email, hash, role, req.params.id]  in case need role
            let values = [email, hash, id]
            await conn.execute(sql, values,
                (err, result) => {
                    if (err) {
                        res.status(500).json({
                            message: err.message
                        })
                        return
                    }
                    res.status(200).json({
                        message: 'User updated successfully',
                        data : result
                    })
                }
            )
        }) 
    })
})

//delete users
app.delete('/users/:id', async (req, res) => {
    let sql = "DELETE FROM users WHERE id = ?"
    let id = req.params.id
    
    await conn.execute(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({
                message: err.message
            })
            return
        }
        res.status(200).json({
            message: 'User deleted successfully',
            data : result
        })
    })
})      

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})