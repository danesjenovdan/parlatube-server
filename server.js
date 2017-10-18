const express = require('express');
const app     = express();
const cheerio = require('cheerio');
const fs      = require('fs');
const config  = require('./config');
const request = require('request-promise-native');
const ejs     = require('ejs');
const webshot = require('webshot');

app.get('/loaderio-89ad8235d214b8571164dd940922d04d.html', async ( req, res ) => {

  res.send('loaderio-89ad8235d214b8571164dd940922d04d');

});

app.get('/snippet/:snippetId', async ( req, res ) => {

  try {

    const snippetId    = req.params.snippetId;
    const templatePath = `${__dirname}/og_templates/snippet.ejs`;
    const ogImagePath  = `${__dirname}/og_renders/snippet-${snippetId}.png`;

    // Load index.html
    const indexFile = await new Promise(( resolve, reject ) => {
      fs.readFile(`${__dirname}/parlatube/dist/index.html`, 'utf8', ( err, file ) => err ? reject(err) : resolve(file));
    });
    const indexHtml = indexFile.toString();
    const $         = cheerio.load(indexHtml);

    const ogExists = await new Promise(( resolve ) => {
      fs.exists(`${__dirname}/og_renders/snippet-${snippetId}.png`, ( exists ) => resolve(exists));
    });

    // get snippet data from API
    const snippetData = JSON.parse(await request(`${config.SNIPPET_URL}?id=${snippetId}`));

    if ( !ogExists ) renderOg(templatePath, snippetData, ogImagePath);

    $('title').text(`${snippetData.name} - Parlatube`);
    $('head').append(`
    <meta property="og:url"                content="${config.URL}" />
    <meta property="og:type"               content="article" />
    <meta property="og:title"              content="${snippetData.name} - Parlatube" />
    <meta property="og:description"        content="Kira tuba" />
  `);

    if ( ogExists ) {
      $('head').append(`
        <meta property="og:image"              content="${config.URL}/images/snippet-${snippetId}.png" />
    `);
    }

    res.send($.html());

  } catch ( err ) {
    console.log(err);
    res.status(400).send('Something went wrong');
  }

});

app.get('/playlist/:playlistId', async ( req, res ) => {

  try {

    const playlistId   = req.params.playlistId;
    const templatePath = `${__dirname}/og_templates/playlist.ejs`;
    const ogImagePath  = `${__dirname}/og_renders/playlist-${playlistId}.png`;

    // Load index.html
    const indexFile = await new Promise(( resolve, reject ) => {
      fs.readFile(`${__dirname}/parlatube/dist/index.html`, 'utf8', ( err, file ) => err ? reject(err) : resolve(file));
    });
    const indexHtml = indexFile.toString();
    const $         = cheerio.load(indexHtml);

    const ogExists = await new Promise(( resolve ) => {
      fs.exists(`${__dirname}/og_renders/playlist-${playlistId}.png`, ( exists ) => resolve(exists));
    });

    // get snippet data from API
    const snippetData = JSON.parse(await request(`${config.PLAYLIST_URL}?id=${playlistId}`));

    if ( !ogExists ) renderOg(templatePath, snippetData, ogImagePath);

    $('title').text(`${snippetData.name} - Parlatube`);
    $('head').append(`
    <meta property="og:url"                content="${config.URL}" />
    <meta property="og:type"               content="article" />
    <meta property="og:title"              content="${snippetData.name} - Parlatube" />
    <meta property="og:description"        content="Tuba" />
  `);

    if ( ogExists ) {
      $('head').append(`
        <meta property="og:image"              content="${config.URL}/images/playlist-${playlistId}.png" />
    `);
    }

    res.send($.html());

  } catch ( err ) {
    console.log(err);
    res.status(400).send('Something went wrong');
  }

});

app.use('/', express.static(`${__dirname}/parlatube/dist`));

app.use('/images', express.static(`${__dirname}/og_renders`));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

async function renderOg( templatePath, data, imagePath ) {

  const template = await new Promise(( resolve, reject ) => {
    fs.readFile(templatePath, 'utf8', ( err, file ) => err ? reject(err) : resolve(file));
  });

  const templateHtml = template.toString();

  const rendered = ejs.render(templateHtml, data);

  await new Promise(( resolve, reject ) => {
    webshot(rendered, imagePath, {
      screenSize : {
        width  : 1200,
        height : 630
      },
      shotSize   : {
        width  : 1200,
        height : 630
      },
      siteType   : 'html'
    }, ( err ) => err ? reject(err) : resolve(imagePath));
  });

}