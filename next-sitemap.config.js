const axios = require('axios');

module.exports = {
  siteUrl: 'https://pakraffle.com',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const res = await axios.get('https://pakraffle.com/api/raffles'); // Replace with your actual API
    const items = res.data;

    return items.map((item) => ({
      loc: `https://pakraffle.com/raffles/${item.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }));
  },
};
