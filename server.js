const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).send("Identify your target first! (Add ?q=item)");

        const url = `https://ikman.lk/en/ads?query=${encodeURIComponent(query)}`;
        
        const { data } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        let itemsBuffer = "";
        let count = 0;

        // Ikman's specific card selectors
        $('.list--3NxGO li').each((i, el) => {
            const title = $(el).find('.heading--2eONR').text().trim();
            const price = $(el).find('.price--3SnqI span').text().trim() || $(el).find('.price--3SnqI').text().trim();
            const rawLink = $(el).find('a').attr('href');
            const link = rawLink ? 'https://ikman.lk' + rawLink : 'N/A';

            if (title && price && title.length > 5) {
                count++;
                itemsBuffer += `\n--- Item ${count} ---\n`;
                itemsBuffer += `Title : ${title}\n`;
                itemsBuffer += `Price : ${price}\n`;
                itemsBuffer += `Link  : ${link}\n`;
            }
        });

        // Construct final plain text response
        let textOutput = `Testing Ikman Scraper BY LORD INDUMINA...\n`;
        textOutput += `Found ${count} results.\n`;
        textOutput += itemsBuffer;

        // Set content type to plain text so it looks clear in browser/bots
        res.setHeader('Content-Type', 'text/plain');
        res.send(textOutput);

    } catch (error) {
        res.status(500).send(`Critical Error: ${error.message}`);
    }
});

module.exports = app;
