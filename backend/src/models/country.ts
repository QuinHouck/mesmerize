import { Int32, ObjectId } from "mongodb";

export default class Country {
    constructor(
        public name: string,
        public iso2: string,
        public capital: string,
        public currency: string,
        public region: string,
        public region_id: Int32,
        public nationality: string, 
        public id?: ObjectId,
    ) {}
}