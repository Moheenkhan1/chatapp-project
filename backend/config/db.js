const mongoose = require('mongoose');

const connectTodb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log("MongoDB Connected")
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectTodb;