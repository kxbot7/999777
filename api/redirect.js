const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  const { redirect_mongo_id, utm_source, utm_medium, utm_campaign } = req.query;
  
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('yourDatabaseName');  // replace with your database name
    const redirects = database.collection('redirects');  // replace with your collection name

    const redirectDoc = await redirects.findOne({ customId: redirect_mongo_id });

    if (redirectDoc) {
      // Construct the redirect URL
      let redirectUrl = redirectDoc.url;
      if (utm_source) redirectUrl += `?utm_source=${utm_source}`;
      if (utm_medium) redirectUrl += `&utm_medium=${utm_medium}`;
      if (utm_campaign) redirectUrl += `&utm_campaign=${utm_campaign}`;

      // Redirect to the target URL
      res.writeHead(302, { Location: redirectUrl });
      res.end();
    } else {
      res.status(404).json({ error: 'Redirect ID not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
};