const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ success: false, message: "Query is required" });

        const url = `https://ikman.lk/en/ads?query=${encodeURIComponent(query)}`;
        
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(data);
        const results = [];

        // Ikman's specific card selectors
        $('.list--3NxGO li').each((i, el) => {
            const title = $(el).find('.heading--2eONR').text().trim();
            const price = $(el).find('.price--3SnqI span').text().trim() || $(el).find('.price--3SnqI').text().trim();
            const info = $(el).find('.description--2-ez3').text().trim();
            const image = $(el).find('img').attr('src') || 'https://via.placeholder.com/300?text=No+Image';
            const link = 'https://ikman.lk' + $(el).find('a').attr('href');

            if (title && price) {
                results.push({ title, price, info, image, link });
            }
        });

        res.json({ 
            success: true, 
            creator: "LORD INDUMINA",
            count: results.length, 
            data: results 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;
