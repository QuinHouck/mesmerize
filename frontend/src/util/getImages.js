import {Image} from 'react-native';

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item);});
	return images
}

export async function getImages(chosen, pack){
    try {
        switch(pack){
            case "countries":
                return await getFlags(chosen);
            case "presidents":
                return await getPresidents(chosen);
            case "nfl":
                return await getNFL(chosen);
            default:
                console.warn(`Unknown pack type: ${pack}`);
                return { imgs: {}, height: '50%' };
        }
    } catch (error) {
        console.error('Error loading images:', error);
        return { imgs: {}, height: '50%' };
    }
}

async function getFlags(chosen){
    const url = `../images/countries/flag`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(
                def, 
                (width, height) => {
                    resolve({width, height});
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    const obj = {};
    for(const country of chosen) {
        try {
            const key = `${country["iso2"]}.png`.toLowerCase();
            
            // Check if image exists
            if (!images[key]) {
                console.warn(`Image not found for country: ${country.name} (${key})`);
                continue;
            }

            const assetSource = Image.resolveAssetSource(images[key]);
            if (!assetSource || !assetSource.uri) {
                console.warn(`Could not resolve asset source for: ${country.name}`);
                continue;
            }

            const def = assetSource.uri;
            const {width, height} = await getInfo(def);

            const ar = width/height;
            const data = {
                image: images[key],
                uri: def,
                ar: ar,
            };
            obj[country.name] = data;
        } catch (error) {
            console.error(`Error loading image for ${country.name}:`, error);
            // Continue to next image instead of crashing
        }
    };

    return {imgs: obj, height: '50%'};
}

async function getPresidents(chosen){
    const url = `../images/presidents`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(
                def, 
                (width, height) => {
                    resolve({width, height});
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    const obj = {};
    for(const pres of chosen) {
        try {
            const key = `${pres["number"]}.jpg`;
            
            // Check if image exists
            if (!images[key]) {
                console.warn(`Image not found for president: ${pres.name} (${key})`);
                continue;
            }

            const assetSource = Image.resolveAssetSource(images[key]);
            if (!assetSource || !assetSource.uri) {
                console.warn(`Could not resolve asset source for: ${pres.name}`);
                continue;
            }

            const def = assetSource.uri;
            const {width, height} = await getInfo(def);

            const ar = width/height;
            const data = {
                image: images[key],
                uri: def,
                ar: ar,
            };
            obj[pres.name] = data;
        } catch (error) {
            console.error(`Error loading image for ${pres.name}:`, error);
            // Continue to next image instead of crashing
        }
    };

    return {imgs: obj, height: '70%'};
}

async function getNFL(chosen){
    const url = `../images/sports/nfl`;
    const images = importAll(require.context(url, false, /\.(png|jpe?g|svg)$/));

    function getInfo(def){
        return new Promise((resolve, reject) => {
            Image.getSize(
                def, 
                (width, height) => {
                    resolve({width, height});
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    const obj = {};
    for(const team of chosen) {
        try {
            const key = `${team["name"]}.png`;
            
            // Check if image exists
            if (!images[key]) {
                console.warn(`Image not found for team: ${team.name} (${key})`);
                continue;
            }

            const assetSource = Image.resolveAssetSource(images[key]);
            if (!assetSource || !assetSource.uri) {
                console.warn(`Could not resolve asset source for: ${team.name}`);
                continue;
            }

            const def = assetSource.uri;
            const {width, height} = await getInfo(def);

            const ar = width/height;
            const data = {
                image: images[key],
                uri: def,
                ar: ar,
            };
            obj[team.name] = data;
        } catch (error) {
            console.error(`Error loading image for ${team.name}:`, error);
            // Continue to next image instead of crashing
        }
    };

    return {imgs: obj, height: '60%'};
}