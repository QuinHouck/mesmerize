import {Image} from 'react-native';

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item);});
	return images
}

export async function getImages(chosen, pack){
    switch(pack){
        case "countries":
            return await getFlags(chosen);
        case "presidents":
            return await getPresidents(chosen);
        case "nfl":
            return await getNFL(chosen);
    }
}

async function getFlags(chosen){
    const url = `../images/countries/flag`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(def, (width, height) => {
                resolve({width, height});
            });
        }, (error) => {
            reject(error);
        })
    }

    const obj = {};
    for(const country of chosen) {
        const key = `${country["iso2"]}.png`.toLowerCase();
        const def = Image.resolveAssetSource(images[key]).uri;
        const {width, height} = await getInfo(def);

        const ar = width/height;
        const data = {
            image: images[key],
            uri: def,
            ar: ar,
        };
        obj[country.name] = data;
    };

    return {imgs: obj, height: '50%'};
}

async function getPresidents(chosen){
    const url = `../images/presidents`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(def, (width, height) => {
                resolve({width, height});
            });
        }, (error) => {
            reject(error);
        })
    }

    const obj = {};
    for(const pres of chosen) {
        const key = `${pres["number"]}.jpg`;
        const def = Image.resolveAssetSource(images[key]).uri;
        const {width, height} = await getInfo(def);

        const ar = width/height;
        const data = {
            image: images[key],
            uri: def,
            ar: ar,
        };
        obj[pres.name] = data;
    };

    return {imgs: obj, height: '70%'};
}

async function getNFL(chosen){
    const url = `../images/sports/nfl`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(def, (width, height) => {
                resolve({width, height});
            });
        }, (error) => {
            reject(error);
        })
    }

    const obj = {};
    for(const team of chosen) {
        const key = `${team["name"]}.png`;
        const def = Image.resolveAssetSource(images[key]).uri;
        const {width, height} = await getInfo(def);

        const ar = width/height;
        const data = {
            image: images[key],
            uri: def,
            ar: ar,
        };
        obj[team.name] = data;
    };

    return {imgs: obj, height: '60%'};
}