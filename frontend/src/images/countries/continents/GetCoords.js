const fs = require('fs');

let ogText = "bad";

fs.readFile('frontend/src/images/countries/continents/asiaHigh2.svg', (err, data) => {
    if(err) throw err;

    ogText = data.toString();

    const start = ogText.indexOf('<path');
    const edited = ogText.substring(start);

    const strs = edited.split(`<path id="`)
    strs.shift()
    for(const str of strs) {
        const end = str.indexOf('"');
        const id = str.substring(0,end)

        const d = str.indexOf('d="');
        const pathA = str.substring(d+3);
        
        const pathEnd = pathA.indexOf('"');
        const pathB = pathA.substring(0, pathEnd);

        const coords = getBBoxFromD(pathB);

        const {centerX, centerY, width, height} = getCenter(coords);
        console.log(`${id}: {centerX: ${centerX}, centerY: ${centerY}, width: ${width}, height: ${height}},`);
    }

});

function getCenter(obj){
    const centerX = obj.x + (obj.width/2);
    const centerY = obj.y + (obj.height/2);
    const height = obj.height;
    const width = obj.width;
    return {centerX, centerY, width, height};
}



function getCenters(pathD) {
    const pathRegex = /[A-Za-z]\s*(-?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
    const coordinates = pathD.match(pathRegex);
  
    if (!coordinates) {
        console.log('bad')
        return null;
    }
    const xCoordinates = [];
    const yCoordinates = [];
    coordinates.forEach((coordinate) => {
      const parts = coordinate.trim().match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
    //   const x = Math.floor(parseFloat(parts[0]));
    //   const y = Math.floor(parseFloat(parts[1]));
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      if (!isNaN(y)) {
      xCoordinates.push(x);
    }
  
      if (!isNaN(y)) {
      yCoordinates.push(y);
    }
      
    });
    console.log(coordinates);
    console.log(xCoordinates, yCoordinates);
  
    const minX = Math.min(...xCoordinates);
    const minY = Math.min(...yCoordinates);
  
    const maxX = Math.max(...xCoordinates) ;
    const maxY = Math.max(...yCoordinates);

    const centerX = minX + (maxX/2);
    const centerY = minY + (maxY/2);
  
    return {maxX, maxY};
}

function getBBoxFromD(d) {
    // parse to pathdata array
    let pathData = parseDtoPathData(d);
    // to longhands
    pathData = pathDataToLonghands(pathData);
  
    // get polygon points
    let polyPoints = pathDataToPolygonPoints(pathData);
    let bboxPoly = getPolygonBBox(polyPoints);
    return bboxPoly;
  }
  
  /**
   * create pathData from d attribute
   **/
  function parseDtoPathData(d, normalize = false) {
    // sanitize d string
    let commandsString = d
      .replace(/[\n\r\t]/g, "")
      .replace(/,/g, " ")
      .replace(/(\d+)(\-)/g, "$1 $2")
      .replace(/(\.)(\d+)(\.)(\d+)/g, "$1$2 $3$4")
      .replace(/(\.)(\d+)(\.)(\d+)/g, "$1$2 $3$4")
      .replace(/( )(0)(\d+)/g, "$1 $2 $3")
      // add space between all valid command letters and values - excludes scientific e notation
      .replace(/([mlcsqtahvz])/gi, "|$1 ")
      .replace(/\s{2,}/g, " ")
      .trim();
    let commands = commandsString
      .split("|")
      .filter(Boolean)
      .map((val) => {
        return val.trim();
      });
    // compile pathData
    let pathData = [];
    for (let i = 0; i < commands.length; i++) {
      let com = commands[i].split(" ");
      let type = com.shift();
      let typeLc = type.toLowerCase();
      let isRelative = type === typeLc ? true : false;
      // convert to numbers
      let values = com.map((val) => {
        return +val;
      });
      // analyze repeated (shorthanded) commands
      let chunks = [];
      let repeatedType = type;
      // maximum values for a specific command type
      let maxValues = 2;
      switch (typeLc) {
        case "v":
        case "h":
          maxValues = 1;
          if (typeLc === "h") {
            repeatedType = isRelative ? "h" : "H";
          } else {
            repeatedType = isRelative ? "v" : "V";
          }
          break;
        case "m":
        case "l":
        case "t":
          maxValues = 2;
          repeatedType =
            typeLc !== "t" ? (isRelative ? "l" : "L") : isRelative ? "t" : "T";
          if (i === 0) {
            type = "M";
          }
          break;
        case "s":
        case "q":
          maxValues = 4;
          repeatedType =
            typeLc !== "q" ? (isRelative ? "s" : "S") : isRelative ? "q" : "Q";
          break;
        case "c":
          maxValues = 6;
          repeatedType = isRelative ? "c" : "C";
          break;
        case "a":
          maxValues = 7;
          repeatedType = isRelative ? "a" : "A";
          break;
          // z closepath
        default:
          maxValues = 0;
      }
      // if string contains repeated shorthand commands - split them
      const arrayChunks = (array, chunkSize = 2) => {
        let chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          let chunk = array.slice(i, i + chunkSize);
          chunks.push(chunk);
        }
        return chunks;
      };
      chunks = arrayChunks(values, maxValues);
      // add 1st/regular command
      let chunk0 = chunks.length ? chunks[0] : [];
      pathData.push({
        type: type,
        values: chunk0
      });
      // add repeated commands
      if (chunks.length > 1) {
        for (let c = 1; c < chunks.length; c++) {
          pathData.push({
            type: repeatedType,
            values: chunks[c]
          });
        }
      }
    }
    return pathData;
  }
  /**
   * decompose/convert shorthands to "longhand" commands:
   * H, V, S, T => L, L, C, Q
   */
  function pathDataToLonghands(pathData) {
    pathData = pathDataToAbsolute(pathData);
    let pathDataLonghand = [];
    let comPrev = {
      type: "M",
      values: pathData[0].values
    };
    pathDataLonghand.push(comPrev);
    for (let i = 1; i < pathData.length; i++) {
      let com = pathData[i];
      let type = com.type;
      let values = com.values;
      let valuesL = values.length;
      let valuesPrev = comPrev.values;
      let valuesPrevL = valuesPrev.length;
      let [x, y] = [values[valuesL - 2], values[valuesL - 1]];
      let cp1X, cp1Y, cpN1X, cpN1Y, cpN2X, cpN2Y, cp2X, cp2Y;
      let [prevX, prevY] = [
        valuesPrev[valuesPrevL - 2],
        valuesPrev[valuesPrevL - 1]
      ];
      switch (type) {
        case "H":
          comPrev = {
            type: "L",
            values: [values[0], prevY]
          };
          break;
        case "V":
          comPrev = {
            type: "L",
            values: [prevX, values[0]]
          };
          break;
        case "T":
          [cp1X, cp1Y] = [valuesPrev[0], valuesPrev[1]];
          [prevX, prevY] = [
            valuesPrev[valuesPrevL - 2],
            valuesPrev[valuesPrevL - 1]
          ];
          // new control point
          cpN1X = prevX + (prevX - cp1X);
          cpN1Y = prevY + (prevY - cp1Y);
          comPrev = {
            type: "Q",
            values: [cpN1X, cpN1Y, x, y]
          };
          break;
        case "S":
          [cp1X, cp1Y] = [valuesPrev[0], valuesPrev[1]];
          [cp2X, cp2Y] =
          valuesPrevL > 2 ? [valuesPrev[2], valuesPrev[3]] : [valuesPrev[0], valuesPrev[1]];
          [prevX, prevY] = [
            valuesPrev[valuesPrevL - 2],
            valuesPrev[valuesPrevL - 1]
          ];
          // new control points
          cpN1X = 2 * prevX - cp2X;
          cpN1Y = 2 * prevY - cp2Y;
          cpN2X = values[0];
          cpN2Y = values[1];
          comPrev = {
            type: "C",
            values: [cpN1X, cpN1Y, cpN2X, cpN2Y, x, y]
          };
          break;
        default:
          comPrev = {
            type: type,
            values: values
          };
      }
      pathDataLonghand.push(comPrev);
    }
    return pathDataLonghand;
  }
  
  
  function pathDataToAbsolute(pathData, decimals = -1) {
    let M = pathData[0].values;
    let x = M[0],
      y = M[1],
      mx = x,
      my = y;
    // loop through commands
    for (let i = 1; i < pathData.length; i++) {
      let cmd = pathData[i];
      let type = cmd.type;
      let typeAbs = type.toUpperCase();
      let values = cmd.values;
      if (type != typeAbs) {
        type = typeAbs;
        cmd.type = type;
        // check current command types
        switch (typeAbs) {
          case "A":
            values[5] = +(values[5] + x);
            values[6] = +(values[6] + y);
            break;
          case "V":
            values[0] = +(values[0] + y);
            break;
          case "H":
            values[0] = +(values[0] + x);
            break;
          case "M":
            mx = +values[0] + x;
            my = +values[1] + y;
          default:
            // other commands
            if (values.length) {
              for (let v = 0; v < values.length; v++) {
                // even value indices are y coordinates
                values[v] = values[v] + (v % 2 ? y : x);
              }
            }
        }
      }
      // is already absolute
      let vLen = values.length;
      switch (type) {
        case "Z":
          x = +mx;
          y = +my;
          break;
        case "H":
          x = values[0];
          break;
        case "V":
          y = values[0];
          break;
        case "M":
          mx = values[vLen - 2];
          my = values[vLen - 1];
        default:
          x = values[vLen - 2];
          y = values[vLen - 1];
      }
    }
    // round coordinates
    if (decimals >= 0) {
      pathData = roundPathData(pathData, decimals);
    }
    return pathData;
  }
  
  
  // get polygon bbox
  function getPolygonBBox(polyPoints) {
    let xArr = [];
    let yArr = [];
    polyPoints.forEach((point) => {
      xArr.push(point.x);
      yArr.push(point.y);
    });
    let xmin = Math.min(...xArr);
    let xmax = Math.max(...xArr);
    let ymin = Math.min(...yArr);
    let ymax = Math.max(...yArr);
    return {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin
    };
  }
  /**
   * convert path d to polygon point array
   */
  function pathDataToPolygonPoints(
    pathData
  ) {
    let points = [];
    pathData.forEach((com, c) => {
      let type = com.type;
      let values = com.values;
      let valL = values.length;
  
      // M
      if (c === 0) {
        let M = {
          x: pathData[0].values[valL - 2],
          y: pathData[0].values[valL - 1]
        };
        points.push(M);
      }
      if (valL && c > 0) {
        let prev = pathData[c - 1];
        // linetos
        if (type === "L") {
          points.push({
            x: values[valL - 2],
            y: values[valL - 1]
          });
        }
      }
    });
    return points;
  }