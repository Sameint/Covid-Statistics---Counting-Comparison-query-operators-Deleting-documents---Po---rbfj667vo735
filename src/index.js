const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')
const {data} = require('./data');

app.get('/totalRecovered', async (req, res) => {
  const result = await covidModel.aggregate([
    {
      $group: {
        _id: 'total',
        recovered: {
          $sum: '$recovered',
        },
      },
    },
  ]);
  res.send({ data: result[0] });
});

app.get('/totalActive', async (req, res) => {
  const result = await covidModel.aggregate([
    {
      $group: {
        _id: 'total',
        active: {
          $sum: { $subtract: ['$infected', '$recovered'] },
        },
      },
    },
  ]);
  res.send({ data: result[0] });
});

app.get('/totalDeath', async (req, res) => {
  const result = await covidModel.aggregate([
    {
      $group: {
        _id: 'total',
        death: {
          $sum: '$death',
        },
      },
    },
  ]);
  res.send({ data: result[0] });
});

app.get('/hotspotStates', async (req, res) => {
  const result = await covidModel.aggregate([
    {
      $project: {
        state: 1,
        rate: {
          $round: [
            {
              $divide: [
                {
                  $subtract: ['$infected', '$recovered'],
                },
                '$infected',
              ],
            },
            5,
          ],
        },
      },
    },
    {
      $match: {
        rate: {
          $gt: 0.1,
        },
      },
    },
    {
      $sort: {
        rate: -1,
      },
    },
  ]);
  res.send({ data: result });
});

app.get('/healthyStates', async (req, res) => {
  const result = await covidModel.aggregate([
    {
      $project: {
        state: 1,
        mortality: {
          $round: [
            {
              $divide: ['$death', '$infected'],
            },
            5,
          ],
        },
      },
    },
    {
      $match: {
        mortality: {
          $lt: 0.005,
        },
      },
    },
    {
      $sort: {
        mortality: 1,
      },
    },
  ]);
  res.send({ data: result });
});




app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;