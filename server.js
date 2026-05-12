const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const outputType = req.query.type || 'json'; // type=text dammahama text eyi

        if (!query) return res.status(400).send("Target eka dapan machan! (?q=item)");

        const url = `https://ikman.lk/en/ads?query=${encodeURIComponent(query)}`;
        
        const { data } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.list--3NxGO li').each((i, el) => {
            const title = $(el).find('.heading--2eONR').text().trim();
            const price = $(el).find('.price--3SnqI span').text().trim() || $(el).find('.price--3SnqI').text().trim();
            const info = $(el).find('.description--2-ez3').text().trim();
            
            let image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            if (image && image.startsWith('//')) image = 'https:' + image;
            if (!image) image = 'https://ikman.lk/static/images/no-image.png';

            const rawLink = $(el).find('a').attr('href');
            const link = rawLink ? 'https://ikman.lk' + rawLink : 'N/A';

            if (title && price && title.length > 5) {
                results.push({ title, price, info, image, link });
            }
        });

        // 1. FRONTEND UI EKATA (JSON)
        if (outputType === 'json') {
            return res.json({
                success: true,
                creator: "LORD INDUMINA",
                count: results.length,
                data: results
            });
        }

        // 2. TEXT OUTPUT (Oya illapu widiyata peli peli ena result eka)
        let responseText = `Testing Ikman Scraper BY LORD INDUMINA...\n`;
        responseText += `Found ${results.length} results.\n\n`;

        results.forEach((item, index) => {
            responseText += `--- Item ${index + 1} ---\n`;
            responseText += `Title : ${item.title}\n`;
            responseText += `Price : ${item.price}\n`;
            responseText += `Link  : ${item.link}\n\n`;
        });

        // Content-Type eka text/plain dammahama thama browser eke peli peli penne
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(responseText);

    } catch (error) {
        res.status(500).send(`Critical Error: ${error.message}`);
    }
});

module.exports = app;
