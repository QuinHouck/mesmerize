import * as mongoDB from 'mongodb';

import mongo from '../utils/mongo';

export const getAvailablePackages = async () => {
    try {
        await mongo.connect();
        const database: mongoDB.Db = mongo.db('packages');
        const pack = database.collection("package-info");

        const query = {};
        const available = await pack.find(query).toArray();

        return available;
    } finally {
        await mongo.close();
    }

}

export const getPackage = async (name: string) => {
    try {
        await mongo.connect();
        const database: mongoDB.Db = mongo.db('packages');
        const pack = database.collection(name);

        const query = {};
        const countries = await pack.find(query).toArray();

        return countries;
    } finally {
        await mongo.close();
    }
}

