db = db.getSiblingDB(process.env.MONGO_DB);
db.createCollection("photoMetadata");
