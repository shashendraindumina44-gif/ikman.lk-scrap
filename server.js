const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        // Oyage format eka thora ganna (?type=text dammaoth text enwa)
        const outputType = req.query.type || 'json'; 

        if (!query) return res.status(400).send("Identify your target first!");

        const url = `https://ikman.lk/en/ads?query=${encodeURIComponent(query)}`;
        
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(data);
        const results = [];
        let textOutput = `Testing Ikman Scraper BY LORD INDUMINA...\n`;

        $('.list--3NxGO li').each((i, el) => {
            const title = $(el).find('.heading--2eONR').text().trim();
            const price = $(el).find('.price--3SnqI span').text().trim() || $(el).find('.price--3SnqI').text().trim();
            const info = $(el).find('.description--2-ez3').text().trim();
            const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || 'https://via.placeholder.com/300';
            const rawLink = $(el).find('a').attr('href');
            const link = rawLink ? 'https://ikman.lk' + rawLink : '#';

            if (title && price && title.length > 5) {
                results.push({ title, price, info, image, link });
            }
        });

        // 1. UI ekata hari Bot ekata hari JSON oni nam (Default)
        if (outputType === 'json') {
            return res.json({
                success: true,
                creator: "LORD INDUMINA",
                count: results.length,
                data: results
            });
        } 

        // 2. Oyata nikan text widiyata balanna oni nam (?type=text kiyala danna)
        let itemsBuffer = `Found ${results.length} results.\n`;
        results.forEach((item, index) => {
            itemsBuffer += `\n--- Item ${index + 1} ---\n`;
            itemsBuffer += `Title : ${item.title}\n`;
            itemsBuffer += `Price : ${item.price}\n`;
            itemsBuffer += `Link  : ${item.link}\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.send(textOutput + itemsBuffer);

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;
