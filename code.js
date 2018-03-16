const fetch = require('node-fetch');
const DOMParser = require('dom-parser');
let articles = {};
let artThreads = 0;

function addArticle(art) {
    articles[art.id] = art;
    artThreads --;
/*
    console.log('article threads: ' + artThreads);
    console.log('Articles so far:');
    console.log(articles);
    console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-');
*/
    if (artThreads === 0) {
        let newContent = '';
        for (var key in articles) {
            if (key) {
                newContent += '<div id="' + key + '" class="article art-' +
                    articles[key].source + '">' + articles[key].content + '</div>\n';
            }
        }        
        document.getElementById('gsp').innerHTML = newContent; 
    }
}

function parseGSP(content)
    {        
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(content, 'text/html');
        let newContent = '';
        fulldoc.getElementsByClassName('calup-stiri').map( function(doc, didx) {            
            doc.getElementsByClassName('C1').map(function(value, index) {
                value.getElementsByTagName('a').map(function(aelem, aidx) {
                    let href = aelem.getAttribute('href');
                    let url = '';
                    if (href.startsWith('http')) {
                        url = href;
                    } else {
                        url = 'http://www.gsp.ro' + href;
                    }
                    //console.log('URL: ' + url);
                    processGSP(aelem, url); 
                });
            });
        });
}

function parsePRO(content)
    {        
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(content, 'text/html');
        let newContent = '';
        fulldoc.getElementsByClassName('articles').map( function(doc, didx) {
            doc.getElementsByTagName('li').map(function(value, index) {
                //console.log(value);
                let aelem = value.getElementsByTagName('a')[0] 
                let href = aelem.getAttribute('href');
                let url = '';                  
                url = href;                    
                //console.log('URL: ' + url);
                processPRO(aelem, url); 
            
            });
        });
}

function parseDGI(content)
    {        
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(content, 'text/html');
        let newContent = '';
        fulldoc.getElementsByClassName('article').map( function(value, didx) {
                //console.log(value);
                let aelem = value.getElementsByTagName('a')[0];
                let href = aelem.getAttribute('href');
                let url = '';                  
                url = 'https://www.digisport.ro' + href;                    
                //console.log('URL: ' + url);
                processDGI(aelem, url); 
        });
}

function processPRO(element, url) {
    //console.log('Processing URL: ' + url);
    if (url) {
        let items = url.split('-');                
        //console.log('art_id: ' + items[items.length - 1]);
        let content = parsePROArticle(url, items[items.length - 1]);
        return element.innerHTML + '\n\n' + content + '\n\n'
    } else {
        return '';
    }
}

function processDGI(element, url) {
    //console.log('Processing URL: ' + url);
    if (url) {
        let items = url.split('-');                
        //console.log('art_id: ' + items[items.length - 1]);
        let content = parseDGIArticle(url, items[items.length - 1]);
        return element.innerHTML + '\n\n' + content + '\n\n'
    } else {
        return '';
    }
}

function processGSP(element, url) {
    if (url) {
        let bigs = url.split('.');
        //console.log(bigs);
        let items = bigs[bigs.length-2].split('-');
        //console.log('art_id: ' + items[items.length - 1]);
        let content = parseGSPArticle(url, items[items.length - 1]);
        return element.innerHTML + '\n\n' + content + '\n\n'
    } else {
        return '';
    }
}

function parseGSPArticle(url, artid) {    
    //console.log('article threads: ' + artThreads);
    fetch(url)
    .then(res => res.text())
    .then(body => {
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(body, 'text/html');
        let content = fulldoc.getElementById('article_content');        
        if (content != null) {
            artThreads ++;
            let paragraphs = content.getElementsByTagName('p');
            //console.log('Paragraphs: ' + paragraphs.length);
            let result = '';
            paragraphs.map(function(value, index) {                
                if (value.innerHTML.indexOf('function') < 0) {
                    result += '<div class="paragraph">' + value.textContent + '</div>\n';
                }
            });
            //console.log(result);
            addArticle({id: artid, content: result, source: 'gsp'})
        }
    });
}

function parsePROArticle(url, artid) {    
    //console.log('article threads: ' + artThreads);
    fetch(url)
    .then(res => res.text())
    .then(body => {
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(body, 'text/html');
        let content = fulldoc.getElementsByClassName('a-entry');
        //console.log(content);
        if (content != null) {
            content = content[0];
            artThreads ++;
            let paragraphs = content.getElementsByTagName('p');
            //console.log('Paragraphs: ' + paragraphs.length);
            let result = '';
            paragraphs.map(function(value, index) {                
                if (value.innerHTML.indexOf('function') < 0) {
                    result += '<div class="paragraph">' + value.textContent + '</div>\n';
                }
            });
            //console.log(result);
            addArticle({id: artid, content: result, source: 'pro'})
        }
    });
}

function parseDGIArticle(url, artid) {    
    //console.log('article threads: ' + artThreads);
    fetch(url)
    .then(res => res.text())
    .then(body => {
        var parser = new DOMParser();
        var fulldoc = parser.parseFromString(body, 'text/html');
        let content = fulldoc.getElementsByClassName('article-story');
        //console.log(content);
        if (content != null) {
            content = content[1];
            artThreads ++;
            let paragraphs = content.getElementsByTagName('p');
            //console.log('Paragraphs: ' + paragraphs.length);
            let result = '';
            paragraphs.map(function(value, index) {                
                if ((index > 1) && (value.innerHTML.indexOf('function') < 0)) {
                    result += '<div class="paragraph">' + value.textContent + '</div>\n';
                }
            });
            //console.log(result);
            addArticle({id: artid, content: result, source: 'dgi'})
        }
    });
}

function fetchGSP() {
    fetch('http://www.gsp.ro/stiri-echipa/cs-u-craiova-649.html')
    .then(res => res.text())
    .then(body => parseGSP(body));        
}

function fetchPRO() {    
    //console.log('fetching PRO');
    fetch('http://craiova.prosport.ro/')
    .then(res => res.text())
    .then(body => parsePRO(body));        
}

function fetchDGI() {    
    //console.log('fetching DGI');
    fetch('https://www.digisport.ro/echipa-ta/cs-universitatea-craiova')
    .then(res => res.text())
    .then(body => parseDGI(body));        
}