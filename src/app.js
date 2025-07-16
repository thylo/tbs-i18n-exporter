import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const url =
  "https://script.google.com/macros/s/AKfycbzMsMOqOzEIx-GJPRohqCt2Fz7P5QkmEw62ZK-yteyoE5AEIFqcRATscewowqbtGA6C/exec";
const translationKeys = readFileSync(
  resolve("./in/Translation Keys.txt"),
  "utf8",
)
  .split("\n")
  .map((v) => v.trim())
  .filter((v) => v);

function fetchData() {
  return fetch(url).then((res) => res.json());
}

function writeLang(lang, data) {
  const currentValues = readFileSync(
    resolve(`./in/Text (${lang.toUpperCase()}).txt`),
    "utf8",
  ).split("\n");
  const values = Object.keys(data).reduce(
    (acc, key) => {
      const row = data[key];
      const value = row[lang].replaceAll("\n", "\\n").replaceAll(/\x03/g, "");
      const index = translationKeys.indexOf(key);
      console.log(lang, key, index, value);
      acc[index] = value;
      return acc;
    },
    new Array(translationKeys.length)
      .fill("")
      .map((v, i) => currentValues[i] || "empty"),
  );
  const path = resolve(`./out/Text (${lang.toUpperCase()}).txt`);
  writeFileSync(path, values.join("\n"));
}

fetchData().then((data) => {
  const langs = [
    ...new Set(
      Object.keys(data)
        .map((key) => data[key])
        .map((key) => Object.keys(key))
        .flat(),
    ),
  ];
  langs.forEach((lang) => writeLang(lang, data));
});
