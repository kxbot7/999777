const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToDatabase() {
    try {
        await client.connect();
        const database = client.db('vercel1');  // Replace with your database name
        return database;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

module.exports = async (req, res) => {
    const { redirect_mongo_id, utm_source, utm_medium, utm_campaign } = req.query;

    try {
        const db = await connectToDatabase();
        const redirects = db.collection('redirects');

        const redirectDoc = await redirects.findOne({ customId: redirect_mongo_id });

        if (redirectDoc) {
            let redirectUrl = redirectDoc.url;
            if (utm_source) redirectUrl += `?utm_source=${utm_source}`;
            if (utm_medium) redirectUrl += `&utm_medium=${utm_medium}`;
            if (utm_campaign) redirectUrl += `&utm_campaign=${utm_campaign}`;

            res.status(200).json({ redirectUrl });
        } else {
            res.status(404).json({ error: 'Redirect ID not found' });
        }
    } catch (error) {
        console.error("Error handling request:", error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};