/**
 * @license      Public Domain
 * @author       Emerson Rocha <rocha(at)ieee.org>
 * @description  Improve usability of the tags.etica.ai.
 **/

/*
-bf-              _____     ..,----'""`-._
             _.--' _   ``--..\_.          `-=._   (\_ _
...______..-'     , >_.-.       \___....-''_   `.--" (O,__,-(   ]b-=,
    ''----.,.--'"`\__,._\\-...______..|__,__\\-..-.____.____<   _/`(/(
  Hic sunt dracones
*/

// To debug:
// localStorage.setItem('debug', '1');

// TODO: clean up jQuery usages (fititnt, 2019-04-17 23:18 BRT)
// TODO: clean up non-used methods from first HTML PoC (fititnt, 2019-04-17 23:19 BRT)

/**
 * Manage the logic
 * @namespace
 **/
const AISTag = {};

/**
 * Manage the logic
 * @namespace
 **/
//const AISTagUI = {};

AISTag.debug = null;

AISTag.state = {
  user: null,
  page: null,
  wikidata: null,
  relations: null
};


/**
* @constant    {Array}  Wikidata items
* @deprecated  Use AISTag.whatPageIs()
*/
let wikidataResultAll;

/**
 * @constant    {Array}  Wikidata items
 * @deprecated  Use AISTag.whatPageIs()
 */
const wikidataItemsAll = [
  'Q8458',  // human rights
  'Q11660', // artificial intelligence
  'Q7692538', // Technological unemployment
  'Q25378861' // Lethal autonomous weapon
];

/**
 * @var {Object} Table of Contents
 */
let ToC = {
  en: [],
  es: [],
  pt: []
};
let jsonpResponseLast = null;

// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Dragon&languages=en|pt|es|eo&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm
// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&ids=Q11660&languages=en|pt|es|eo&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm


// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm&ids=Q11660
// https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=json&ids=Q11660


/**
 * VanillaJS JSONP
 *
 * @see AISTag.vanillaJsonpCallback()
 *
 */
AISTag.vanillaJsonp = function () {
  let wkItems = AISTag.state.page.wikidataItems.join('|');
  let url2 = 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks/urls|labels|aliases|descriptions&callback=AISTag.vanillaJsonpCallback&format=json&ids=' + wkItems;
  let scriptEl = document.createElement('script');
  scriptEl.setAttribute('src', url2);
  document.body.appendChild(scriptEl);
}

/**
 * VanillaJS JSONP, the Callback
 *
 * @see AISTag.vanillaJsonp()
 *
 * @param  {Object}   data  The data result from Wikidata
 */
AISTag.vanillaJsonpCallback = function (data) {
  // console.log('AISTag.vanillaJsonpCallback', data);
  // jsonpResponseLast = data;
  AISTag.state.wikidata = data.entities;
  AISTag.debug && console.log('What Wikidata?', AISTag.state.wikidata);
  AISTag.whatRelations();
  AISTag.loopWikidata();
  AISTag.UIMyTranslations();
}

/**
 * Inicialize
 */
AISTag.init = function() {
  AISTag.debug = localStorage.getItem('debug');

  if (AISTag.debug) {
    document.getElementsByTagName('body')[0].classList.add('ais-debug-on');
    // AISTag.initDebug();
    // return;
  }

  console.log('AISTag.init: Who I am?', AISTag.whoAmI());
  console.log('AISTag.init: What Page is?', AISTag.whatPageIs());

  AISTag.loopTags();
  AISTag.vanillaJsonp();


  // AISTag.loopWikidata(); // called by wikitada callback
  // AISTag.whatRelations() // called by wikitada callback
  // AISTag.UIMyTranslations(); // called by wikitada callback
}

/**
 * Inicialize debug mode
 *
 * @deprecated  Not used. Maybe consider usage on the future, but not now (fititnt, 2019-04-17 23:31 BRT)
 */
AISTag.initDebug = function() {
  let newScript = document.createElement('script');
  let firstScript = document.getElementsByTagName('script')[0];
  newScript.async = true;
  newScript.src = "/assets/js/ais-ethics-tags-plus.js?" + Math.round(new Date().getTime() / 1000);
  firstScript.parentNode.insertBefore(newScript, firstScript);

  document.addEventListener("DOMContentLoaded", function() {
    console.log('AISTag.initDebug: improve this. Or not, since is just for debugging...')
    // console.log('oioioi2222')
    // AISTagPlus.init();
    setTimeout(function() {
      AISTagPlus.init();
    }, 500);
  });

  //document.getElementsByTagName('head')[0].appendChild(script);

  // document.write('<script src="' + "/assets/js/ais-ethics-tags-plus.js" + '"></script>');
}

/**
 * Loop Wikidata section of main HTML page
 */
AISTag.loopWikidata = function () {
  const wks = document.querySelectorAll('#wikidata-container > article');

  console.log('loopWikidata', wks);

  for (let i = 0; i < wks.length; ++i) {
    let wdId = wks[i].id;
    // wks[i];
    // console.log('loopWikidata', i, wks[i], wks[i].id, AISTag.state.wikidata[wks[i].id]);
    if (AISTag.state.wikidata[wdId]) {
      if (AISTag.debug) {
        let raw = JSON.stringify(AISTag.state.wikidata[wdId], null, 2);
        wks[i].querySelector('.wikidata-item-raw').innerText = raw;
      }
      AISTag.UIWikidata(wks[i], AISTag.state.wikidata[wdId]);
    } else {
      console.log('AISTag.loopWikidata ERROR', wdId, AISTag.state.wikidata);
    }
  }
}

/**
 * Since all the important data is on the HTML markup, what data we know about it?
 *
 * @returns {Object}
 */
AISTag.whatPageIs = function() {
  let page = {};
  page.availableLanguages = document.querySelector('[property="available-languages"]').content.split(',');
  page.wikidataItems = Array.from(document.querySelectorAll('#wikidata-container > article')).map(function(el) {
    return el.id;
  });
  page.tags = Array.from(document.querySelectorAll('#tags-container > article')).map(function(el) {
    //let wdInfo = '@todo';
    let wdInfo = {};
    let wdEls = el.querySelectorAll('[itemprop="sameAs"]');
    for (let i=0; i < wdEls.length; ++i) {
      let wdCode = wdEls[i].innerText;
      wdEls[i];
      // console.log('eeee', wdEls[i].innerText);
      wdInfo[wdCode] = {};
      // console.log('aaaaa', wdEls[i].dataset);
      //for (let j = 0; j < wdEls[i].dataset.length; ++j) {
      //  console.log('bbbbb', wdEls[i].dataset[j]);
      //}
      for (var key in wdEls[i].dataset) {
        if (wdEls[i].dataset.hasOwnProperty(key)) {
          // console.log('cccc', key, wdEls[i].dataset[key]);
          if (key.indexOf('tagWd') > -1) {
            // console.log('dddd', key, key.replace('tagWd', '').toLocaleLowerCase())
            wdInfo[wdCode][key.replace('tagWd', '').toLocaleLowerCase()] = {};
          }
        }
      }
    }

    //wkInfo

    return {
      'id': el.id,
      'title': el.querySelector('[itemprop="name"]').innerText,
      'tags': Array.from(el.querySelectorAll('kbd')).map(function(el2) {
        return {
          type: el2.className.replace('tag-', ''),
          value: el2.textContent
        };
      }),
      wikidata: wdInfo
    };
  });
  AISTag.state.page = page;
  return page;
}

/**
 * Return some extra relations
 */
AISTag.whatRelations = function() {
  AISTag.state.relations = {
    wkToTags: {}
  };
  //console.log('AISTag.whatRelations', AISTag.state.relations);
  //console.log(',,,', AISTag.state.wikidata, AISTag.state.page.tags);
  for (let key in AISTag.state.wikidata) {
    if (AISTag.state.wikidata.hasOwnProperty(key)) {
      for (let i=0; i < AISTag.state.page.tags.length; ++i) {
        if (AISTag.state.page.tags[i].wikidata[key]) {
          console.log('eee1234', AISTag.state.page.tags[i].wikidata[key]);
          for (let key2 in AISTag.state.page.tags[i].wikidata[key]) {
            if (AISTag.state.page.tags[i].wikidata[key].hasOwnProperty(key2)) {
              if (!AISTag.state.relations.wkToTags[key]) {
                AISTag.state.relations.wkToTags[key] = {};
              }
              if (!AISTag.state.relations.wkToTags[key][key2]) {
                AISTag.state.relations.wkToTags[key][key2] = [];
              }
              AISTag.state.relations.wkToTags[key][key2].push({
                id: AISTag.state.page.tags[i].id,
                title: AISTag.state.page.tags[i].title
              });
            }
          }
          // AISTag.state.relations.wkToTags[key] = {}
        }
      }
    }
  }
  return AISTag.state.relations;
}

/**
 * What we know about the browser of the intelligent agent accessing our site?
 *
 * @returns {Object}
 */
AISTag.whoAmI = function() {
  let me = {};
  me.myLanguage = navigator.language || navigator.userLanguage;
  me.myLanguages = navigator.languages || [me.myLanguage];
  AISTag.state.user = me;
  return me;
}

/**
* @deprecated rewrite to not depend more on jQuery or remove it
*/
AISTag.wikidata = function (el, items) {
  console.log('wikidata: rewrite to not depend more on jQuery or remove it.');
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
      AISTag.prepareWikidataInfo();
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



// AISTag.wikidata($('.output-test'), wikidataItemsAll.join('|'));

/**
* @deprecated remove wikidataPreload
*/
AISTag.wikidataPreload = function (cb, wikidataItemsAll) {
  //...
}


/**
 * Add translations based on the user preferred languages
 * Depends of wikidata data to work.
 *
 * @TODO change to accept fallback translation based on user preferences (fititnt, 2019-04-15 04:46 BRT)
 *
 */
AISTag.UIMyTranslations = function() {
  let languages = AISTag.state.user.myLanguages;
  let uiLang = null;
  // languages.push('en'); // fallback... just in case...
  // console.log('AISTag.UIMyTranslations', AISTag.state.user, AISTag.state.page, AISTag.state.wikidata);
  for (let i =0; i < languages.length; ++i) {
    if (AISTag.state.page.availableLanguages.indexOf(languages[i]) > -1) {
      uiLang = languages[i];
      break
    } else {
      console.log('AISTag.UIMyTranslations: sorry, no ' + languages[i] + ' lang');
    }
  }

  for (var key in AISTag.state.wikidata) {
    if (AISTag.state.wikidata.hasOwnProperty(key)) {
      let elsQ = document.querySelectorAll('.' + key);
      // console.log('elsQ', elsQ);
      for (let i=0; i < elsQ.length; ++i) {
        if (AISTag.state.wikidata[key].labels[uiLang]) {
          elsQ[i].innerHTML = '<mark lang="' + uiLang + '">' + AISTag.state.wikidata[key].labels[uiLang].value + ' <sup>(' + uiLang + ')</sup></mark>';
        } else {
          console.log('AISTag.UIMyTranslations soft fail for key ' + key + ' and uiLang ' + uiLang);
        }
      }
    }
  }
  // console.log('AISTag.UIMyTranslations uiLang', uiLang);
}

/**
* Add links to search the tag on external sites
*
* @param {HTMLElement} el - Element to populate
*/
AISTag.UITagSearchBar = function (el) {
  //let tagCamelCase = $(el).find('.tag-camelcase').text() || '';
  let _tagCamelCase = el.querySelector('.tag-camelcase');
  let _tagDash = el.querySelector('.tag-camelcase');
  let _tagClean = el.querySelector('.tag-camelcase');
  let tagCamelCase = _tagCamelCase ? _tagCamelCase.innerText : '';
  let tagDash = _tagDash ? _tagDash.innerText : tagCamelCase.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  let tagClean =  _tagClean ? _tagClean.innerText : tagDash.replace('/-/g', '');

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

  // $(el).find('.tag-searchlinks').html(searchLinks);
  el.querySelector('.tag-camelcase').innerHTML = searchLinks;
}


/**
 * Add extra information to Wikidata section
 *
 * @param {HTMLElement} el - Element to populate
 * @param {Object} wkInfo - Wikidata Object response
 */
AISTag.UIWikidata = function (el, wkInfo){
  let html = '<h4>Tags</h4>';
  html += '<ul>';
  if (AISTag.state.relations.wkToTags[el.id]) {
    console.log('AISTag.UIWikidata asdasdasd', AISTag.state.relations.wkToTags[el.id]);
    for (var key in AISTag.state.relations.wkToTags[el.id]) {
      if (AISTag.state.relations.wkToTags[el.id].hasOwnProperty(key)) {
        //html += '<h5>' + key + '</h5>';
        //html += '<ul>';
        // console.log('oioioioi', AISTag.state.relations.wkToTags[el.id], AISTag.state.relations.wkToTags[el.id][key].length);
        for (let i=0; i < AISTag.state.relations.wkToTags[el.id][key].length; ++i) {
          // console.log('oioioioi')
          html += '<li><span lang="' + key + '"><a href="#' + AISTag.state.relations.wkToTags[el.id][key][i].id + '">' +  AISTag.state.relations.wkToTags[el.id][key][i].title + '<sup> (' + key + ')</sup></span></a></li>';
        }
        //html += '</ul>';
      }
    }
  } else {
    console.log('AISTag.UIWikidata WARNING: potential unused on tags ' + el.id);
  }
  html += '</ul>';

  console.log(AISTag.state.relations.wkToTags);

  html += '<h4>Wikidata</h4>';
  for (var key in wkInfo.labels) {
      if (wkInfo.labels.hasOwnProperty(key)) {
          // console.log(key + " -> " + wkInfo.labels[key]);
          html += '<div>';
          html += '<h5 lang="' + key + '">' + wkInfo.labels[key].value + ' <sup>(' +  key + ')</sup></h5>';
          html += '<ul>';
          if (wkInfo.descriptions[key]) {
            html += '<li lang="' + key + '">' + wkInfo.descriptions[key].value + '</li>';
          }
          if (wkInfo.sitelinks[key + 'wiki']) {
            //let wikipediaLink = 'https://' + key + '.wikipedia.org/wiki/' + wkInfo.sitelinks[key + 'wiki'].title.replace(/\s/g, "_");
            html += '<li lang="' + key + '"><a href="' + wkInfo.sitelinks[key + 'wiki'].url + '">' + wkInfo.sitelinks[key + 'wiki'].url + '</a></li>';
          }
          html += '</ul>';
          html += '</div>';
      }
  }
  // console.log('AISTag.UIWikidata', wkInfo.labels);
  el.querySelector('.wikidata-item-info').innerHTML = html;
}


/**
* @deprecated  Remove it (fititnt, 2019-04-14 05:54 BRT)
*
* @param {HTMLElement} el - Element to populate
*/
AISTag.wikidataPopulate = function (el) {
  console.log('wikidataPopulate deprecated.');

  // console.log('wikidataPopulate', el);
  let wikidataItem = $(el).find('[itemprop="sameAs"]').text() || '';
  let output = $(el).find('.tag-signifo');

  console.log(wikidataItem, wikidataResultAll[wikidataItem]);
  if (wikidataItem && wikidataResultAll[wikidataItem]) {
    // console.log('eeeeei ei eimael um democraca cristao', output);
    output.html(JSON.stringify(wikidataResultAll[wikidataItem]));
  }

}


/**
* Loop that depends from externa data
*
* @deprecated  Remove it (fititnt, 2019-04-14 05:54 BRT)
*/
AISTag.prepareWikidataInfo = function () {
  console.log('prepareWikidataInfo deprecated.');
  console.log('prepareWikidataInfo start');
  $('#tags-container > article').each(function(index, element) {

    AISTag.wikidataPopulate(element);

  });
}

// Loop that can work even if external data fail

/**
 * Loop each tag
 * @TODO rewrite (fititnt, 2019-04-14 07:18 BRT)
 */
AISTag.loopTags = function () {

  // For each tag container...
  const tagsContainer = [].slice.call(document.querySelectorAll('#tags-container > article'), 0);

  //$('#tags-container > article').each(function(index, element) {
  tagsContainer.forEach(function(element) {

    // Build the search links
    //AISTag.tagSearchLinks(element);
    AISTag.UITagSearchBar(element);

    // TODO: otimize this 3x copypasta (fititnt, 2019-04-13 06:49 BRT)
    if (element.dataset.tagLangs) {
      if (element.dataset.tagLangs.indexOf('en') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.en.push({
          href: tagTitle.getAttribute('data-anchor-id'),
          title: tagTitle.innerText,
        });
      }

      if (element.dataset.tagLangs.indexOf('es') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.es.push({
          href: tagTitle.getAttribute('data-anchor-id'),
          title: tagTitle.innerText,
        });
      }

      if (element.dataset.tagLangs.indexOf('pt') > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        ToC.pt.push({
          href: tagTitle.getAttribute('data-anchor-id'),
          title: tagTitle.innerText,
        });
      }
    }

  });
  // console.log('eetoc', ToC);

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



//AISTag.loopTags();

AISTag.init();
