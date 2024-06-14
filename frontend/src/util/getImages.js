import {Image} from 'react-native';

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item);});
	return images
}

export async function getFlags(chosen){
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
        obj[key] = data;
    };
    // for(const key of Object.keys(images)) {
    //     const def = Image.resolveAssetSource(images[key]).uri;
    //     const {width, height} = await getInfo(def);

    //     const ar = width/height;
    //     const data = {
    //         image: images[key],
    //         uri: def,
    //         ar: ar,
    //     };
    //     obj[key] = data;
    // };
    // console.log("Obj: ", obj);

    return obj;
}