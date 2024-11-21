import mongoose from 'mongoose'

export default async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://CoLabApplication:9rHzIIiKla6nJ4eo@cluster0.gxib4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB: ', error);
        process.exit(1);
    }
}