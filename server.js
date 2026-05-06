const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Oyage lassana UI eka pennana eka
app.use(express.static(path.join(__dirname, 'public')));

// Api Endpoint eka: /api/scrape?q=oyata_oni_item_eka
app.get('/api/scrape', async (req, res) => {
    try {
        const searchQuery = req.query.q || 'laptops'; // Default search
        const url = `https://ikman.lk/en/ads?query=${encodeURIComponent(searchQuery)}`;
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let results = [];
        
        // Note: Ikman lk eke class names wenas wenna puluwan, ewata galapenna me classes wenas karanna weyi
        $('.list--3NxGO > li').each((index, element) => {
            const name = $(element).find('.heading--2eONR').text().trim();
            const price = $(element).find('.price--3SnqI').text().trim();
            const place = $(element).find('.description--2-ez3').text().trim();
            const link = 'https://ikman.lk' + $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');

            if (name) {
                results.push({ name, price, place, link, img });
            }
        });

        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Vercel walata export karanna oni
module.exports = app;