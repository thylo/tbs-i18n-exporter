import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { rimraf } from "rimraf";

const url = "https://script.google.com/macros/s/AKfycbx03qzmQrIwJTyrIJRXSZTM4FFICzKn0mDOE10ItYw-eXFTynARdyE80t4QKMwlowgD/exec";

function fetchData() {
  return fetch(url).then((res) => res.json());
}

function writeLang(lang, data) {
  console.log("writing lang", lang);

  const values = Object.keys(data).reduce((acc, key) => {
    const row = data[key];
    const value = row[lang]
      .trim()
      .replaceAll("\n", "\\n")
      .replaceAll(/\x03/g, "");
    return [...acc, value];
  }, []);
  const path = resolve(`./out/Text (${lang.toUpperCase()}).txt`);
  writeFileSync(path, values.join("\n"));
}

const clean = () => rimraf("./out/**", { glob: true });

const ensureFolderExists = (folderPath) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
    console.log(`Folder created: ${folderPath}`);
  } else {
    console.log(`Folder already exists: ${folderPath}`);
  }
};

const createTranslationKeys = (data) => {
  const path = `./out/Translation Keys.txt`;
  const values = Object.keys(data);
  writeFileSync(path, values.join("\n"));
};

const init = () =>
  fetchData().then((data) => {
    const langs = [
      ...new Set(
        Object.keys(data)
          .map((key) => data[key])
          .map((key) => Object.keys(key))
          .flat(),
      ),
    ];
    createTranslationKeys(data);
    langs.forEach((lang) => writeLang(lang, data));
  });

clean().then(() => {
  ensureFolderExists("./out");
  init();
});
