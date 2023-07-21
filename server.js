const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(express.static('public'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/paths.html'))
);

// Read data from the 'db.json' file
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data from the database' });
    }

    try {
      const notes = JSON.parse(data);
      res.json(notes);
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      res.status(500).json({ error: 'Failed to parse data from the database' });
    }
  });
});

// Create a new note and append it to the 'db.json' file
app.post('/api/notes', express.json(), (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data from the database' });
    }

    try {
      const notes = JSON.parse(data);
      const newNote = {
        title: req.body.title,
        text: req.body.text,
      };

      // Add a unique id to the new note (you can use a UUID package for better uniqueness)
      newNote.id = Date.now().toString();

      notes.push(newNote);

      fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing data:', writeErr);
          return res.status(500).json({ error: 'Failed to write data to the database' });
        }

        res.status(201).json(newNote); // Send back the created note with its ID
      });
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      res.status(500).json({ error: 'Failed to parse data from the database' });
    }
  });
});

// Get a specific note by ID
app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data from the database' });
    }

    try {
      const notes = JSON.parse(data);
      const foundNote = notes.find((note) => note.id === noteId);

      if (!foundNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json(foundNote);
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      res.status(500).json({ error: 'Failed to parse data from the database' });
    }
  });
});

// Delete a specific note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).json({ error: 'Failed to read data from the database' });
    }

    try {
      let notes = JSON.parse(data);
      const filteredNotes = notes.filter((note) => note.id !== noteId);

      if (notes.length === filteredNotes.length) {
        return res.status(404).json({ error: 'Note not found' });
      }

      fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(filteredNotes, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing data:', writeErr);
          return res.status(500).json({ error: 'Failed to write data to the database' });
        }

        res.json({ message: 'Note deleted successfully' });
      });
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      res.status(500).json({ error: 'Failed to parse data from the database' });
    }
  });
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
