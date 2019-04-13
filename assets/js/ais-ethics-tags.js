/*
-bf-              _____     ..,----'""`-._
             _.--' _   ``--..\_.          `-=._   (\_ _
...______..-'     , >_.-.       \___....-''_   `.--" (O,__,-(   ]b-=,
    ''----.,.--'"`\__,._\\-...______..|__,__\\-..-.____.____<   _/`(/(

*/

console.log('test from ais-ethics-tags.js');

let wikidataResultAll;

// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Dragon&languages=en|pt|es|eo&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm
// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&ids=Q11660&languages=en|pt|es|eo&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm


// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm&ids=Q11660
// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=json&ids=Q11660


function wikidata(el, items) {
  if (!items) {
    items = 'Q11660|Q8458|Q25378861'
  }
  $.getJSON({
    url: "https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=json&ids=" + items,
    // url: "https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en%7Cpt%7Ces%7Ceo&sitefilter=enwiki%7Ceswiki%7Cptwiki%7Ceowiki&props=sitelinks%7Clabels%7Caliases%7Cdescriptions&format=json&ids=" + items,
    cache: true
  })
  .done(function (html) {
    console.log('wikidata done', el, items, html);
    if (html && html.entities) {
      wikidataResultAll = html.entities;
      prepareWikidataInfo();
    } else {
      console.log('wikidata failed');
    }

    $(el).append(html);
  })
  .fail(function (html) {
    console.log('wikidata fail', el, items, html);
    $(el).append(html);
  })
}

const wikidataItemsAll = [
  'Q8458',  // human rights
  'Q11660', // artificial intelligence
  'Q7692538', // Technological unemployment
  'Q25378861' // Lethal autonomous weapon
];

wikidata($('.output-test'), wikidataItemsAll.join('|'));


function wikidataPreload(cb, wikidataItemsAll) {
  //...
}

function tagSearchLinks(el) {
  let tagCamelCase = $(el).find('.tag-camelcase').text() || '';
  let tagDash = $(el).find('.tag-dash').text() || tagCamelCase.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  let tagClean = $(el).find('.tag-clean').text() || tagDash.replace('/-/g', '');

  if (!tagCamelCase) {
    return false;
  }

  // console.log('eeeee', tagCamelCase, tagDash, tagClean);

  let searchLinks = '<a href="https://www.facebook.com/search/posts/?q=%23' + tagCamelCase + '">Facebook</a> | \
  <a href="https://github.com/topics/' + tagDash + '">GitHub</a> | \
  <a href="https://www.instagram.com/explore/tags/' + tagClean + '">Instagram</a> | \
  <a href="https://www.linkedin.com/search/results/content/?keywords=%23' + tagCamelCase + '">LinkedIn</a> | \
  <a href="https://medium.com/search?q=%23' + tagCamelCase + '">Medium</a> | \
  <a href="https://pinterest.com/search/pins/?q=%23' + tagCamelCase + '">Pinterest</a> | \
  <a href="https://www.reddit.com/search?q=%23' + tagCamelCase + '">Reddit</a> | \
  <a href="https://twitter.com/search?q=%23' + tagCamelCase + '">Twitter</a> | \
  <a href="https://www.youtube.com/results?search_query=%23' + tagCamelCase + '">Youtube</a>';

  $(el).find('.tag-searchlinks').html(searchLinks);
}

function wikidataPopulate(el) {
  // console.log('wikidataPopulate', el);
  let wikidataItem = $(el).find('[itemprop="sameAs"]').text() || '';
  let output = $(el).find('.tag-signifo');

  console.log(wikidataItem, wikidataResultAll[wikidataItem]);
  if (wikidataItem && wikidataResultAll[wikidataItem]) {
    // console.log('eeeeei ei eimael um democraca cristao', output);
    output.html(JSON.stringify(wikidataResultAll[wikidataItem]));
  }

}

// Loop that depends from externa data
function prepareWikidataInfo() {
  console.log('prepareWikidataInfo start');
  $('#tags-container > article').each(function(index, element) {

    wikidataPopulate(element);

  });
}

// Loop that can work even if external data fail
function mainLoop() {
  let ToC = {
    en: [],
    es: [],
    pt: []
  };

  // For each tag container...
  $('#tags-container > article').each(function(index, element) {

    // Build the search links
    tagSearchLinks(element);

    // TODO: otimize this 3x copypasta (fititnt, 2019-04-13 06:49 BRT)
    if (element.dataset.tagLangs) {
      if (element.dataset.tagLangs.indexOf('en') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.en.push({
          href: tagTitle.getAttribute('id'),
          title: tagTitle.innerText,
        });
      }

      if (element.dataset.tagLangs.indexOf('es') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.es.push({
          href: tagTitle.getAttribute('id'),
          title: tagTitle.innerText,
        });
      }

      if (element.dataset.tagLangs.indexOf('pt') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.pt.push({
          href: tagTitle.getAttribute('id'),
          title: tagTitle.innerText,
        });
      }
    }

  });
  console.log('eetoc', ToC);

  // TODO: otimize this 3x copypasta (fititnt, 2019-04-13 07:02 BRT)
  if (ToC.en) {
    let ToCElementEn = document.querySelector('[data-tags-toc="en"]');
    let ToCElementEnHtml = '';
    ToC.en.forEach(function(el, idx) {
      ToCElementEnHtml += '<li><a href="#' + ToC.en[idx].href + '">' + ToC.en[idx].title + '</a></li>';
    });
    ToCElementEn.innerHTML = ToCElementEnHtml;
  }
  if (ToC.es) {
    let ToCElementEs = document.querySelector('[data-tags-toc="es"]');
    let ToCElementEsHtml = '';
    ToC.es.forEach(function(el, idx) {
      ToCElementEsHtml += '<li><a href="#' + ToC.es[idx].href + '">' + ToC.es[idx].title + '</a></li>';
    });
    ToCElementEs.innerHTML = ToCElementEsHtml;
  }
  if (ToC.pt) {
    let ToCElementPt = document.querySelector('[data-tags-toc="pt"]');
    let ToCElementPtHtml = '';
    ToC.pt.forEach(function(el, idx) {
      ToCElementPtHtml += '<li><a href="#' + ToC.pt[idx].href + '">' + ToC.pt[idx].title + '</a></li>';
    });
    ToCElementPt.innerHTML = ToCElementPtHtml;
  }

}

mainLoop();
