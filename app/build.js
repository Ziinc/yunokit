const esbuild = require("esbuild");
const fs = require('fs')

const env = process.env.NODE_ENV || 'dev'
require("dotenv").config({path: `.env`, override: true});
require("dotenv").config({path: `.env.${env}`, override: true});
require("dotenv").config({path: `.env.${env}.secret`, override: true});


const watch = process.argv[2] ? true : false;

// interpolate env var into static files
const staticFiles = ["index.html"]

staticFiles.forEach(filepath=>{
  const path = "dist/" + filepath
  fs.readFile(path, 'utf8', function (err,data) {
    if (err) return console.log(err)
    console.log('process.env.BASE_PATH', process.env.BASE_PATH)
    const result = data.replace(/\$BASE_PATH/g, process.env.BASE_PATH || '');
  
    fs.writeFile(path, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
})



// build js
const base = {
  logLevel: "info",
  bundle: true,
  outdir: "dist",
  minify: true,
  sourcemap: true,
  sourceRoot: "src",
  watch,
  define: {
    "process.env.SUPABASE_API_KEY": JSON.stringify(process.env.SUPABASE_API_KEY),
    "process.env.SUPABASE_API_URL": JSON.stringify(process.env.SUPABASE_API_URL),
    "process.env.BASE_PATH": JSON.stringify(process.env.BASE_PATH),
  },
};
esbuild
  .build(
    Object.assign(
      {
        entryPoints: ["src/index.tsx"],
        loader: {
          ".svg": "file",
        },
      },
      base
    )
  )
  .catch(() => process.exit(1));

esbuild
  .build(
    Object.assign(
      {
        entryPoints: ["tmp/index.css"],
        nodePaths: ['node_modules'],

      },
      base
    )
  )
  .catch(() => process.exit(1));

