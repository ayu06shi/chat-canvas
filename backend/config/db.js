const  mongoose = require("mongoose");
// require('dotenv').config();
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('MONGO_URI is not defined in the environment variables');
    process.exit(1);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
       

        console.log(`Database Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        process.exit();
    }
};

module.exports = connectDB;