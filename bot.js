const TelegramBot = require('node-telegram-bot-api');
const token = '822065559:AAFcHBfpBdk5xnJI4fhH_GjWekF6-Hi3RF8';
var fs = require('fs');
const bot = new TelegramBot(token, {
    polling: true
});

const axios = require('axios');
const cheerio = require('cheerio');
var date = [];
var links_classifiche = [];
var links_video = [];
var nomi = [];
var s = [];
var tutto = [];
var elenco = [];

var n = 0;
const url = 'https://www.rallylink.it/cms20/index.php/archivio-2020';

axios(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html)
        const tabellagare = $('tbody > tr');

        for (i = 0; i < tabellagare.length; i++) {
            let data = $(tabellagare[i].children[0]).text();
            let nome = $(tabellagare[i].children[1]).text() + "*";
            let link_classifica = $(tabellagare[i].children[3].children[0]).attr("href");
            let link_video = $(tabellagare[i].children[4].children[0]).attr("href");
            date.push(data);
            nomi.push(nome);
            links_classifiche.push(link_classifica);
            links_video.push(link_video);

            tutto[i] = data + nome + link_classifica + "*" + link_video + "*" + n;


            console.log(tutto[i]);
            var obj = {
                'data': data,
                'nome': nome,
                'link': link_classifica,
                'sim': "*",
                'video': link_video,
                'simb': "*",
                'n': n,
            }
            elenco.push(obj)
            fs.writeFile("elenco.json", JSON.stringify(elenco), function(err) {
                if (err) return console.log(err);
                //console.log('elenco aggioranto');
            });
            n++;
            //   }

        }
    })

.catch(console.error);

bot.onText(/\/start/, (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "Benvenuto appassionato. Per la lista di comandi digitare /commands");
    } catch (error) { console.log(error) }
});

bot.onText(/\/commands/, (msg) => {
    try {
        bot.sendMessage(msg.chat.id, "/stampatutti --> mostra tutte le gare in archivio\n/classifica ___ --> classica seguito da uno spazio e dall'indice, fornisce la classifica della gara allegata a quell'indice\n/video ___--> video seguito da uno spazio e dall'indice, fornisce il video della gara allegata a quell'indice");
    } catch (error) { console.log(error) }
});

bot.onText(/\/stampatutti/, (msg) => {
    try {
        n = 0;

        for (j = 0; j < nomi.length; j++) {

            s[j] = n + " : " + nomi[j];
            n++
            bot.sendMessage(msg.chat.id, s[j]);
            console.log(s[j])
        }
    } catch (error) { console.log(error) }
});

bot.onText(/\/classifica/, (msg, match) => {
    try {
        var id = match.input.split(' ')[1];
        console.log(id);

        for (j = 0; j < nomi.length; j++) {
            if (tutto[j].split('*')[3] == id) {
                bot.sendMessage(msg.chat.id, "LINK CLASSIFICA: " + tutto[j].split('*')[1]);
            }
        }
    } catch (error) { console.log(error) }
});
bot.onText(/\/video/, (msg, match) => {
    try {
        var id = match.input.split(' ')[1];
        console.log(id);

        for (j = 0; j < nomi.length; j++) {
            if (tutto[j].split('*')[3] == id) {
                bot.sendMessage(msg.chat.id, "LINK VIDEO: " + tutto[j].split('*')[2]);
            }
        }
    } catch (error) { console.log(error) }
});

require('yargs')
    .scriptName("rubrica")
    .usage('$0 <cmd> [args]')
    .command('link_classifica [n]', 'stampa dati', (yargs) => {
        yargs.positional('n', {
            type: 'string',
            default: 'Cambi',
            describe: 'nome del gruppo da stampare'
        })
    }, function(argv) {
        var id = argv.n;
        var file = './elenco.json';
        var data = fs.readFileSync(file)
        const dataJson = JSON.parse(data);
        for (var i = 0; i < dataJson.length; i++) {
            if (dataJson[i].n == id) {
                var name = dataJson[i].nome;
                var l = dataJson[i].link;

                console.log(name + ' ' + l);
            }
        }
    })
    .command('link_video [n]', 'stampa dati', (yargs) => {
        yargs.positional('n', {
            type: 'string',
            default: 'Cambi',
            describe: 'nome del gruppo da stampare'
        })
    }, function(argv) {
        var id = argv.n;
        var file = './elenco.json';
        var data = fs.readFileSync(file)
        const dataJson = JSON.parse(data);
        for (var i = 0; i < dataJson.length; i++) {
            if (dataJson[i].n == id) {
                var name = dataJson[i].nome;
                var l = dataJson[i].video;

                console.log(name + ' ' + l);
            }
        }
    })
    .command('stampa [tutti]', 'stampa dati', (yargs) => {
        yargs.positional('tutti', {
            type: 'string',
            default: 'Cambi',
            describe: 'nome del gruppo da stampare'
        })
    }, function(argv) {
        var id = argv.n;
        var file = './elenco.json';
        var data = fs.readFileSync(file)
        const dataJson = JSON.parse(data);
        for (var i = 0; i < dataJson.length; i++) {
            console.log(dataJson[i].data + ' ' + dataJson[i].nome + ' ' + dataJson[i].link + ' ' + dataJson[i].video);
        }
    })
    .help()
    .argv