const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/customers.css':'customers.css','/game.js':'game.js'};
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer((req,res)=>{
  const file=files[req.url.split('?')[0]];
  if(!file){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(__dirname,file),(err,data)=>{
    if(err){res.writeHead(500);return res.end('Could not read file');}
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache'});res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
