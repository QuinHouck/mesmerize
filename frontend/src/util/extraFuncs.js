//Function Taken from: https://www.tutorialspoint.com/levenshtein-distance-in-javascript
export function getDistance(str1, str2){  
    str1 = parseString(str1);
    str2 = parseString(str2);

    if(str1 === "") return 10;
    const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
}

function parseString(str){
    if(str === "") return str;
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.toLowerCase();
    str = str.replace(' ', '');
    str = str.replace('-', '');
    str = str.replace('\'', '');
    str = str.replace('.', '');
    
    return str;
}