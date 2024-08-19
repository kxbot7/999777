const { MongoClient } = require('mongodb');

// Create a new MongoClient instance using the connection string from the environment variable
const client = new MongoClient(process.env.MONGODB_URI);

async function connectToDatabase() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected to MongoDB");
        
        // Specify the database name
        const database = client.db('vercel1');  // Replace with your database name
        
        // Return the database connection
        return database;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

module.exports = async (req, res) => {
    const { redirect_mongo_id, utm_source, utm_medium, utm_campaign } = req.query;

    try {
        // Connect to the database
        const db = await connectToDatabase();

        // Access the "redirects" collection (replace with your collection name)
        const redirects = db.collection('redirects');

        // Find the document based on the customId
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
        console.error("Error handling request:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Close the connection after the operation (optional, depending on usage)
        await client.close();
    }
};