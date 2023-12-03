//Express Server der auf Port 8000 lauft
const jwt = require('jsonwebtoken');
const jwtConfig = require('./jwt');

const express = require('express')
const app = express()
const port = 8000

const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

//connection zu DB
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin',
  database: 'guestdb'
});

//swaggerUI
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UE 3 API Dokumentation',
      version: '1.0.0',
    },
  },
  apis: ['server.js'], // Adjust the path or pattern based on your project structure
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//Daten von der DB holen und zu localhost:8000/events fetchen
/**
 * @swagger
 * /events:
 *  get:
 *    description: Alle Events abfragen
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/events', (req, res) => {
  const data = ('');
  pool.getConnection()
    .then(conn => {
      conn.query("SELECT * FROM veranstaltungen")
        .then((rows) => {
          console.log(rows);
          res.json(rows);
        });
      conn.end();
    })
    .catch(err => {
      console.log(err);
      conn.end();
      res.status(200).send(res.json(rows));
    })
});

//Schauen ob es einen User mit Password gibt in der DB und dann wird ein Token erstellt
/**
 * @swagger
 * /login:
 *  post:
 *    description: User und Passwort überprüfen
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.post('/login', (req, res) => {
  const eventData = req.body;
  console.log("Received eventData:", eventData.username, eventData.password);

  pool.getConnection()
    .then(conn => {
      conn.query("SELECT * FROM users WHERE username = ? AND passwort = ?", [eventData.username, eventData.password])
        .then((users) => {
          console.log(users);
          if (users.length === 1) {
            const token = jwt.sign({ username: users[0].username, isAdmin: users[0].isAdmin }, jwtConfig.secret, {
              expiresIn: jwtConfig.expiresIn,
            });
            res.json({ token });
          }
        })
    })
})

/**
 * @swagger
 * /persons:
 *  get:
 *    description: Alle Personsn abfragen
 *    responses:
 *      '200':
 *        description: A successful response
 */
//alle Daten von Users
app.get('/persons', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query("SELECT * FROM users")
        .then((rows) => {
          console.log(rows);
          res.json(rows);
        });
      conn.end();
    })
    .catch(err => {
      console.log(err);
      conn.end();
    })
});

/**
 * @swagger
 * /addevents:
 *  post:
 *    description: User zu Event hinzufügen 
 *    responses:
 *      '200':
 *        description: A successful response
 */
//Funktion für das Hinzufügen von einem User in einer Veranstaltung in der DB mit den Daten von Persons.js die über localhost:8000/addevents kommen
app.post('/addevents', (req, res) => {
  const eventData = req.body;
  console.log("Received eventData:", eventData.id, eventData.event, eventData.user);

  pool.getConnection()
    .then(conn => {
      conn.query(
        'INSERT INTO veranstaltungen (id, eventname, users) VALUES (?, ?, JSON_ARRAY_APPEND(COALESCE(users, "[]"), "$", ?)) ON DUPLICATE KEY UPDATE eventname = VALUES(eventname), users = JSON_ARRAY_APPEND(COALESCE(users, "[]"), "$", ?)',
        [eventData.id, eventData.event, eventData.user, eventData.user]
      ).then(result => {
        res.status(201).json({ message: 'Event added successfully', eventId: Number(result.insertId) });
        conn.commit();
        conn.end();
      })
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
          conn.end();
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * @swagger
 * /addNewEvent:
 *  post:
 *    description: neues Event erstellen 
 *    responses:
 *      '200':
 *        description: A successful response
 */
//neues Event erstellen
app.post('/addNewEvent', (req, res) => {
  const eventData = req.body;
  console.log("Received eventData:", eventData.event);

  pool.getConnection()
  .then(conn => {
    conn.query(
      'INSERT INTO veranstaltungen (eventname, users) VALUES (?, ?)',
      [eventData.event, '[""]']
    ).then(result => {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Event created successfully' });
        conn.commit();
      } else {
        res.status(500).json({ error: 'Failed to create event' });
      }
      conn.end();
    })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
        conn.end();
      });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});
/**
 * @swagger
 * /updateEvent:
 *  post:
 *    description: Titel eines Events updaten 
 *    responses:
 *      '200':
 *        description: A successful response
 */
//Funktion zum Updaten von Namen eines Events
app.post('/updateEvent', (req, res) => {
  const eventData = req.body;
  console.log("Received eventData for update:", eventData.event, eventData.updateEvent);

  pool.getConnection()
  .then(conn => {
    conn.query(
      'UPDATE veranstaltungen SET eventname = ? WHERE eventname = ?',
      [eventData.updateEvent, eventData.event]
    ).then(result => {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Event updated successfully' });
        conn.commit();
      } else {
        res.status(500).json({ error: 'Failed to create event' });
      }
      conn.end();
    })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
        conn.end();
      });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

/**
 * @swagger
 * /deleteuser:
 *  put:
 *    description: User aus Veranstaltung löschen 
 *    responses:
 *      '200':
 *        description: A successful response
 */
//Funktion für das Löschen von einem User in einer Veranstaltung in der DB mit den Daten von Persons.js die über localhost:8000/deleteuser kommen
app.put('/deleteuser', (req, res) => {
  const eventData = req.body;
  console.log("Received eventData for delete:", eventData.id, eventData.event, eventData.user);

  pool.getConnection()
    .then(conn => {
      conn.query(
        'UPDATE veranstaltungen SET users = JSON_REMOVE(users, JSON_UNQUOTE(JSON_SEARCH(users, "one", ?))) WHERE id = ? AND eventname = ?',
        [eventData.user, eventData.id, eventData.event]
      ).then(result => {
        if (result.affectedRows > 0) {
          res.status(200).json({ message: 'User updated successfully' });
          conn.commit();
        } else {
          res.status(404).json({ error: 'User not found for deletion' });
        }
        conn.commit();
        conn.end();
      })
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
          conn.end();
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * @swagger
 * //deleteevent/:eventId:
 *  delete:
 *    description: Löschen eines Events 
 *    responses:
 *      '200':
 *        description: A successful response
 */
//Funktion für das Löschen von einem Event in der DB mit den Daten von Admin.js die über localhost:8000/deleteevent mit der Variable eventId kommen
app.delete('/deleteevent/:eventId', (req, res) => {
  const eventId = req.params.eventId;

  pool.getConnection()
    .then(conn => {
      conn.query(
        'DELETE FROM veranstaltungen WHERE id = ?',
        [eventId]
      ).then(result => {
        if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Event deleted successfully' });
          conn.commit();
        } else {
          res.status(404).json({ error: 'Event not found for deletion' });
        }
        conn.commit();
        conn.end();
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})