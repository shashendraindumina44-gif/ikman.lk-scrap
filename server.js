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

        // 1. UI EKATA (JSON) - Meeka nisa UI eka wada karanawa
        if (outputType === 'json') {
            return res.json({
                success: true,
                creator: "LORD INDUMINA",
                count: results.length,
                data: results
            });
        }

        // 2. TEXT OUTPUT (Pahadiliwa wenama thiyena list ekak)
        let responseText = `--- TESTING IKMAN SCRAPER BY LORD INDUMINA ---\n`;
        responseText += `Found ${results.length} results for: ${query}\n`;
        responseText += `============================================\n`;

        results.forEach((item, index) => {
            responseText += `\n[ ITEM ${index + 1} ]\n`;
            responseText += `TITLE : ${item.title}\n`;
            responseText += `PRICE : ${item.price}\n`;
            responseText += `INFO  : ${item.info}\n`;
            responseText += `IMAGE : ${item.image}\n`;
            responseText += `LINK  : ${item.link}\n`;
            responseText += `--------------------------------------------\n`;
        });

        // Browser ekata pahadiliwa text ekak bawa kiyamu
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(responseText);

    } catch (error) {
        res.status(500).send(`Critical System Failure: ${error.message}`);
    }
});

module.exports = app;
