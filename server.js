const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const outputType = req.query.type || 'json';

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
            
            if (image) {
                if (image.startsWith('//')) image = 'https:' + image;
                
                // IMAGE QUALITY FIX: Remove the thumbnail cropping and get original size
                // Replacing /142/107/cropped.jpg with /620/465/original.jpg
                image = image.replace(/\/\d+\/\d+\/cropped\.jpg$/, '/620/465/original.jpg');
            } else {
                image = 'https://ikman.lk/static/images/no-image.png';
            }

            const rawLink = $(el).find('a').attr('href');
            const link = rawLink ? 'https://ikman.lk' + rawLink : 'N/A';

            if (title && price && title.length > 5) {
                results.push({ title, price, info, image, link });
            }
        });

        if (outputType === 'json') {
            return res.json({
                success: true,
                creator: "LORD INDUMINA",
                count: results.length,
                data: results
            });
        }

        let responseText = `--- Testing Ikman Scraper (HQ IMAGES) BY LORD INDUMINA ---\n`;
        responseText += `Found ${results.length} results.\n\n`;

        results.forEach((item, index) => {
            responseText += `--- Item ${index + 1} ---\n`;
            responseText += `Title : ${item.title}\n`;
            responseText += `Price : ${item.price}\n`;
            responseText += `Image : ${item.image}\n`; // Link ekath damma image eka check karanna
            responseText += `Link  : ${item.link}\n\n`;
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(responseText);

    } catch (error) {
        res.status(500).send(`Critical Error: ${error.message}`);
    }
});

module.exports = app;
