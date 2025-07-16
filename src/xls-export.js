import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import * as XLSX from 'xlsx';

const translationFiles = await glob("./in/**/Text*.txt", {
  ignore: "node_modules/**",
});

const translationKeys = readFileSync(
  resolve("./in/Translation Keys.txt"),
  "utf8",
)
  .split("\n")
  .map((v) => v.trim())
  .filter((v) => v);

const langs = translationFiles.map((str) => str.match(/\(([^)]+)\)/)[1].trim());

const valuesKeyedBylang = translationFiles.reduce((acc, curr) => {
  const lang = curr.match(/\(([^)]+)\)/)[1].trim();
  return { ...acc, [lang]: readFileSync(curr, "utf8").split("\n") };
}, {});

const translations = translationKeys.reduce((acc, key, index) => {
  return [
    ...acc,
    langs.reduce(
      (acc, lang) => ({ ...acc, [lang]: valuesKeyedBylang[lang][index] }),
      { key },
    ),
  ];
}, []);

const worksheet = XLSX.utils.json_to_sheet(translations);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
XLSX.writeFile(workbook, "out/Translations.xlsx", { compression: true });
