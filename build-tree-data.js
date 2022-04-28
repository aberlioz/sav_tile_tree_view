const axios = require("axios");
const _ = require("lodash");
const fs = require("fs");

var eu_url = "https://www.backmarket.fr/bm/diagnosis/v1/sav/tile/tree/light/";
var us_url = "https://www.backmarket.com/bm/diagnosis/v1/sav/tile/tree/light/";

var treeData = [];
var NAME_MAP = {};

var formatTile = async (tile) => {
  var add_data = await axios.get(root_url + tile.id);
  var tileData = add_data.data;
  NAME_MAP[tileData.id] = tileData.name;

  var children = [];

  for (let index = 0; index < tileData.childrens.length; index++) {
    const child = tileData.childrens[index];
    var formattedChild = await formatTile(child);
    children.push(formattedChild);
  }

  tileData.parent_id = tileData.parent;
  tileData.parent = NAME_MAP[tileData.parent];
  tileData.children = _.sortBy(children, function (c) {
    return c.name;
  });
  delete tileData.childrens;

  return tileData;
};

const buildTree = async () => {
  try {
    const res = await axios.get(root_url);
    const formattedData = await formatTile(res.data);
    treeData.push(formattedData);
    fs.writeFileSync(filename, JSON.stringify(treeData));
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
};

const myArgs = process.argv.slice(2);
const input_env = myArgs[0];

if (input_env == "eu") {
  var root_url = eu_url;
  var filename = "treeData-eu.json";
  buildTree();
} else if (input_env == "us") {
  var root_url = us_url;
  var filename = "treeData-us.json";
  buildTree();
} else {
  console.error("Bad parameters");
}
