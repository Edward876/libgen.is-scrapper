const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

async function scrapeLibgen(input) {
  const formattedInput = input.split(' ').join('+');
  const searchUrl = `http://libgen.is/search.php?req=${formattedInput}&open=0&res=25&view=simple&phrase=1&column=def`;

  try {
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
    const results = [];

    $('table.c tr').each((index, element) => {
      const linkElement = $(element).find('a[href^="book/index.php?md5="]');
      if (linkElement.length > 0) {
        const title = linkElement.text().trim();
        const url = `http://libgen.is/${linkElement.attr('href')}`;
        results.push({ title, url });
      }
    });

    return results;
  } catch (error) {
    throw new Error('Error fetching data');
  }
}

app.get('/search', async (req, res) => {
  const { query } = req;
  if (!query.q) {
    return res.status(400).send('Please provide a query parameter "q"');
  }

  try {
    const results = await scrapeLibgen(query.q);
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
