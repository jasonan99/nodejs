const express = require('express');
const mongoose = require('mongoose');
const card = require('./models/card');

const app = express();
const port = 3000;

const dbUri = 'mongodb+srv://jason:pevDHy3vOLyTkpIs@cluster0.elfcunm.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successful connection to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/add-card', (req, res) => {
  const newCard = new card({
    type: capitalizeFirstLetter(req.body.type),
    name: capitalizeFirstLetter(req.body.name),
    description: capitalizeFirstLetter(req.body.description),
    battlePoints: req.body.battlePoints
  });

  newCard.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      console.error('Error saving the card to the database:', error);
      res.status(500).send('Error saving the card to the database');
    });
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

app.get('/search-cards', (req, res) => {
  const searchTerm = capitalizeFirstLetter(req.query.term);

  card.find({ $or: [{ name: searchTerm }, { type: searchTerm }] })
    .then((cards) => {
      res.json(cards);
    })
    .catch((error) => {
      console.error('Error while searching for cards', error);
      res.status(500).send('Error while searching for cards');
    });
});

app.get('/get-card/:id', (req, res) => {
  const cardId = req.params.id;
  console.log('Received card ID:', cardId);

  card.findById(cardId)
    .then((card) => {
      if (!card) {
        console.log('Card not found with ID:', cardId);
        return res.status(404).send('Card not found');
      }
      console.log('Found card:', card);
      res.json(card);
    })
    .catch((error) => {
      console.error('Error fetching card:', error);
      res.status(500).send('Error fetching card');
    });
});

app.put('/edit-card/:id', (req, res) => {
  const cardId = req.params.id;
  const updatedCardData = {
    type: capitalizeFirstLetter(req.body.type),
    name: capitalizeFirstLetter(req.body.name),
    description: capitalizeFirstLetter(req.body.description),
    battlePoints: req.body.battlePoints
  };

  card.findByIdAndUpdate(cardId, updatedCardData, { new: true })
    .then((updatedCard) => {
      res.json(updatedCard);
    })
    .catch((error) => {
      console.error('Error updating card:', error);
      res.status(500).send('Error updating card');
    });
});

app.delete('/delete-card/:id', (req, res) => {
  const cardId = req.params.id;

  card.findByIdAndRemove(cardId)
    .then((deletedCard) => {
      res.json(deletedCard);
    })
    .catch((error) => {
      console.error('Error deleting card:', error);
      res.status(500).send('Error deleting card');
    });
});

app.get('/get-cards', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'asc';
  const typeFilter = req.query.type;

  const skip = (page - 1) * limit;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const filterOptions = {};
  if (typeFilter) {
    filterOptions.type = capitalizeFirstLetter(typeFilter);
  }

  card.find(filterOptions)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .then((cards) => {
      res.json(cards);
    })
    .catch((error) => {
      console.error('Error while fetching the cards', error);
      res.status(500).send('Error while fetching the cards');
    });
});

app.get('/get-total-cards', (req, res) => {
  card.countDocuments()
    .then((totalCards) => {
      res.json(totalCards);
    })
    .catch((error) => {
      console.error('Error fetching total cards:', error);
      res.status(500).send('Error fetching total cards');
    });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
