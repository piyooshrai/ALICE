/**
 * Bad API with Security Vulnerabilities
 * Intentional issues for ALICE testing
 */

const express = require('express')
const app = express()

// CRITICAL: Hardcoded database credentials
const DB_PASSWORD = 'admin123'
const DB_URL = `mysql://root:${DB_PASSWORD}@localhost:3306/mydb`

// HIGH: CORS configured to allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// CRITICAL: SQL Injection vulnerability - string concatenation in query
app.get('/users/:id', (req, res) => {
  const userId = req.params.id
  const query = `SELECT * FROM users WHERE id = ${userId}` // SQL injection!

  db.query(query, (err, results) => {
    // HIGH: No error handling
    res.json(results)
  })
})

// CRITICAL: SQL Injection with template literal
app.post('/search', (req, res) => {
  const searchTerm = req.body.term
  const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`

  db.query(query, (err, results) => {
    res.json(results)
  })
})

// CRITICAL: Storing password in plaintext
app.post('/register', (req, res) => {
  const { username, password } = req.body

  // No password hashing!
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`

  db.query(query, (err, result) => {
    res.json({ success: true })
  })
})

// HIGH: No authentication on sensitive endpoint
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id

  // CRITICAL: DELETE without WHERE clause risk if userId is manipulated
  const query = `DELETE FROM users WHERE id = ${userId}`

  db.query(query, (err, result) => {
    res.json({ deleted: true })
  })
})

// HIGH: eval() usage - code injection risk
app.post('/calculate', (req, res) => {
  const expression = req.body.expression
  const result = eval(expression) // Dangerous!
  res.json({ result })
})

// CRITICAL: Command injection vulnerability
const { exec } = require('child_process')
app.post('/ping', (req, res) => {
  const host = req.body.host
  exec(`ping -c 4 ${host}`, (error, stdout) => {
    res.send(stdout)
  })
})

// HIGH: Weak random token generation
app.get('/generate-token', (req, res) => {
  const token = Math.random().toString(36).substring(7) // Not cryptographically secure
  res.json({ token })
})

// MEDIUM: Missing input validation
app.post('/upload', (req, res) => {
  const file = req.files.upload
  // No file type checking, size limits, or malware scanning
  file.mv(`./uploads/${file.name}`)
  res.json({ success: true })
})

// Spelling error in coment: This funktoin handles user autentication
// HIGH: No async error handling
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  // No try/catch - will crash on error
  const user = await db.findUser(username)

  if (user.password === password) { // Plaintext comparison!
    res.json({ success: true, token: user.token })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

module.exports = app
