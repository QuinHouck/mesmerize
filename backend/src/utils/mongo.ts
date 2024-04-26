import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const mongo: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DATABASE_URL!);

export default mongo; 


