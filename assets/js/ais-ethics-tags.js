/**
 * @license      Public Domain
 * @author       Emerson Rocha <rocha(at)ieee.org>
 * @description  Improve usability of the tags.etica.ai.
 *
 *
 * This work is done with love and special attention to details for the
 * international community that does not have in English its mother language.
 * Help with **content** of tags is very welcome. See our GitHub repository at
 * <https://github.com/fititnt/ais-ethics-tags> or send e-mail to
 * rocha(at)ieee.org.
 **/

/**
 * Manage the logic. Also initialize some variables
 *
 * @namespace
 **/
const AISTag = {
  // Debug? Debug
  debug: null,
  // State of things
  state: {
    user: null,
    page: null,
    wikidata: null,
    relations: null
  },
  // Table of Contents
  ToC: {
  }
};

/**
 * Inicialize
 */
AISTag.init = function () {
  if (window.location.hash === "#debug=1") {
    console.log('AISTag.init: debug ON');
    localStorage.setItem('debug', 1);
  } else if (window.location.hash === "#debug=0") {
    console.log('AISTag.init: debug OFF');
    localStorage.removeItem('debug');
  }

  AISTag.debug = localStorage.getItem('debug');

  if (AISTag.debug) {
    document.getElementsByTagName('body')[0].classList.add('ais-debug-on');
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
 * Loop Tags section of main HTML page.
 * I will offer minimal functionality *even* if the wikidata fail to load.
 * It will not just work if entire javascript fails, but the main HTML already
 * work at least anchors
 */
AISTag.loopTags = function () {

  // For each tag container...
  const tagsContainer = [].slice.call(document.querySelectorAll('#tags-container > article'), 0);

  AISTag.state.page.allLanguages.forEach(function(lang) {
    //console.log('aa', lang);
    AISTag.ToC[lang] = [];
  });
  // console.log(AISTag.ToC);

  //$('#tags-container > article').each(function(index, element) {
  tagsContainer.forEach(function (element) {
    let elCN = element.className;
    let wdLangs = [];

    // Build the search links
    AISTag.UITagSearchBar(element);

    AISTag.state.page.allLanguages.forEach(function(lang) {
      // console.log('AISTag.loopTags', element.id, elCN, lang, wdLangs, elCN.indexOf('tag-lang-' + lang));
      if (elCN.indexOf('tag-lang-' + lang) > -1) {
        let tagTitle = element.querySelector('[itemprop="name"]');
        AISTag.ToC[lang].push({
          href: tagTitle.getAttribute('data-anchor-id'),
          title: tagTitle.innerText,
        });
        wdLangs.push(lang);
      }
    });

    // Change the signifo part
    AISTag.UITagMeaningBar(element, wdLangs);
  });

  AISTag.state.page.allLanguages.forEach(function(lang) {
    let ToCElement = document.querySelector('[data-tags-toc="' + lang + '"]');
    let ToCElementHtml = '';
    // console.log('aaaa', ToCElement);

    AISTag.ToC[lang].forEach(function (el, idx) {
      ToCElementHtml += '<li><a href="#' + AISTag.ToC[lang][idx].href + '">' + AISTag.ToC[lang][idx].title + '</a></li>';
    });
    ToCElement.innerHTML = ToCElementHtml;
  });
}

/**
 * Loop Wikidata section of main HTML page
 */
AISTag.loopWikidata = function () {
  const wks = document.querySelectorAll('#wikidata-container > article');

  // console.log('loopWikidata', wks);

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
 * Add translations based on the user preferred languages
 * Depends of wikidata data to work.
 */
AISTag.UIMyTranslations = function () {
  let languages = AISTag.state.user.myLanguages;
  let uiLang = null;

  for (var key in AISTag.state.wikidata) {
    if (AISTag.state.wikidata.hasOwnProperty(key)) {
      let elsQ = document.querySelectorAll('.' + key);
      // console.log('AISTag.UIMyTranslations elsQ', elsQ, key);
      // console.log('AISTag.UIMyTranslations elsQ', key);
      for (let i = 0; i < elsQ.length; i++) {
        for (let j = 0; j < AISTag.state.page.loadLanguages.length; j++) {
          let uiLang = AISTag.state.page.loadLanguages[j];
          if (AISTag.state.wikidata[key].labels[uiLang] && AISTag.state.wikidata[key].labels[uiLang].value) {
              elsQ[i].innerHTML = '<mark lang="' + uiLang + '">' + AISTag.state.wikidata[key].labels[uiLang].value + ' <sup>(' + uiLang + ')</sup></mark>';
              break;
          } else {
            console.log('AISTag.UIMyTranslations soft fail for key ' + key + ' and uiLang ' + uiLang);
          }
        }
      }
    }
  }
}

/**
* Add links to search the tag on external sites
*
* @todo this function will not work well if a acronym is also a full meaning in another language. (fititnt, 2019-04-20 04:43 BRT)
*
* @param {HTMLElement} el    - Element to populate
* @param {Array}       langs - All langs that this element could be using
*/
AISTag.UITagMeaningBar = function (el, langs) {
  let langsDs = langs.map(function (lang) {
    return lang && lang[0].toUpperCase() + lang.slice(1);;
  })
  let wdEls = el.querySelectorAll('[itemprop="sameAs"]');

  // For each Wikidata item...
  for (let i = 0; i < wdEls.length; ++i) {

    let html = '<ul>';

    if (wdEls[i].dataset.tagWdAkronimo) {
      html += '<li>Akronimo</li>';
      html += '<ul>';
    }

    // For each potential language that this wikidata item could have...
    for (let j = 0; j < langsDs.length; j++) {
      if (wdEls[i].dataset['tagWd' + langsDs[j]]) {
        html += '<li lang="' + langs[j] + '">' + AISTag.state.page.nameLanguages[langs[j]] + ': <kbd translate="no">' + wdEls[i].dataset['tagWd' + langsDs[j]]+ '</kbd> <sup>(' + langs[j] + ')</sup></li>';
        // console.log('deuuuu')
      }
    }

    if (wdEls[i].dataset.tagWdAkronimo) {
      html += '</ul>';
    }

    html += '</ul>';
    // console.log('AISTag.UITagMeaningBar', el.id, wdEls, langs, langsDs);
    
    wdEls[i].parentNode.insertAdjacentHTML('beforeend', html);
  }
}

/**
* Add links to search the tag on external sites
*
* @param {HTMLElement} el - Element to populate
*/
AISTag.UITagSearchBar = function (el) {
  //let tagCamelCase = $(el).find('.tag-camelcase').text() || '';
  let _tagCamelCase = el.querySelector('.tag-camelcase');
  let _tagDash = el.querySelector('.tag-dash');
  let _tagClean = el.querySelector('.tag-camelcase');
  let tagCamelCase = _tagCamelCase ? _tagCamelCase.innerText : '';
  let tagDash = _tagDash ? _tagDash.innerText : tagCamelCase.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  let tagClean = _tagClean ? _tagClean.innerText : tagDash.replace('/-/g', '');

  if (!tagCamelCase) {
    return false;
  }

  let searchLinks = '<a href="https://www.facebook.com/search/posts/?q=%23' + tagCamelCase + '">Facebook</a> | \
  <a href="https://github.com/topics/' + tagDash + '">GitHub</a> | \
  <a href="https://www.instagram.com/explore/tags/' + tagClean + '">Instagram</a> | \
  <a href="https://www.linkedin.com/search/results/content/?keywords=%23' + tagCamelCase + '">LinkedIn</a> | \
  <a href="https://medium.com/search?q=%23' + tagCamelCase + '">Medium</a> | \
  <a href="https://pinterest.com/search/pins/?q=%23' + tagCamelCase + '">Pinterest</a> | \
  <a href="https://www.reddit.com/search?q=%23' + tagCamelCase + '">Reddit</a> | \
  <a href="https://twitter.com/search?q=%23' + tagCamelCase + '">Twitter</a> | \
  <a href="https://www.youtube.com/results?search_query=%23' + tagCamelCase + '">Youtube</a>';

  el.querySelector('.tag-searchlinks').innerHTML = searchLinks;
}


/**
 * Add extra information to Wikidata section
 *
 * @param {HTMLElement} el - Element to populate
 * @param {Object} wkInfo - Wikidata Object response
 */
AISTag.UIWikidata = function (el, wkInfo) {
  let html = '<h4>Tags</h4>';
  html += '<ul>';
  if (AISTag.state.relations.wkToTags[el.id]) {
    // console.log('AISTag.UIWikidata asdasdasd', AISTag.state.relations.wkToTags[el.id]);
    for (var key in AISTag.state.relations.wkToTags[el.id]) {
      if (AISTag.state.relations.wkToTags[el.id].hasOwnProperty(key)) {
        //html += '<h5>' + key + '</h5>';
        //html += '<ul>';
        // console.log('oioioioi', AISTag.state.relations.wkToTags[el.id], AISTag.state.relations.wkToTags[el.id][key].length);
        for (let i = 0; i < AISTag.state.relations.wkToTags[el.id][key].length; ++i) {
          // console.log('oioioioi')
          html += '<li><span lang="' + key + '"><a href="#' + AISTag.state.relations.wkToTags[el.id][key][i].id + '">' + AISTag.state.relations.wkToTags[el.id][key][i].title + '<sup> (' + key + ')</sup></span></a></li>';
        }
        //html += '</ul>';
      }
    }
  } else {
    console.log('AISTag.UIWikidata WARNING: potential unused on tags ' + el.id);
  }
  html += '</ul>';

  // AISTag.debug && console.log('AISTag.UIWikidata', AISTag.state.relations.wkToTags);

  html += '<h4>Wikidata</h4>';
  for (var key in wkInfo.labels) {
    if (wkInfo.labels.hasOwnProperty(key)) {
      // console.log(key + " -> " + wkInfo.labels[key]);
      html += '<div>';
      html += '<h5 lang="' + key + '">' + wkInfo.labels[key].value + ' <sup>(' + key + ')</sup></h5>';
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
 * VanillaJS JSONP
 *
 * @see AISTag.vanillaJsonpCallback()
 * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Dragon&languages=en|pt|es|eo&props=sitelinks|labels|aliases|descriptions&callback=?&format=json
 * @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks|labels|aliases|descriptions&callback=?&format=jsonfm&ids=Q11660
 *
 */
AISTag.vanillaJsonp = function () {
  let wkItems = AISTag.state.page.wikidataItems.join('|');
  let loadLanguages = AISTag.state.page.loadLanguages.join('|');
  let loadWikis = AISTag.state.page.loadLanguages.map(function (lang) {
    return lang + 'wiki';
  }).join('|');
  //AISTag.state.page.loadLanguages.forEach(function(lang) {
  //  loadWikis.push(lang + 'wiki');
  //});
  AISTag.debug && console.log('AISTag.vanillaJsonp', wkItems, loadLanguages, loadWikis);

  // let url2 = 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=en|pt|es|eo&sitefilter=enwiki|eswiki|ptwiki|eowiki&props=sitelinks/urls|labels|aliases|descriptions&callback=AISTag.vanillaJsonpCallback&format=json&ids=' + wkItems;
  let url2 = 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=' + loadLanguages + '&sitefilter=' + loadWikis + '&props=sitelinks/urls|labels|aliases|descriptions&callback=AISTag.vanillaJsonpCallback&format=json&ids=' + wkItems;
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
 * Since all the important data is on the HTML markup, what data we know about it?
 *
 * @returns {Object}
 */
AISTag.whatPageIs = function () {
  let page = {};
  page.nameLanguages = {};
  //page.availableLanguages = document.querySelector('[property="available-languages"]').content.split(',');
  page.availableLanguages = Array.from(document.querySelectorAll('[data-lang-target]')).map(function (el) {
    page.nameLanguages[el.lang] = el.dataset.langName;
    return el.lang;
  });
  page.extraLanguages = Array.from(document.querySelectorAll('[data-lang-extra]')).map(function (el) {
    page.nameLanguages[el.lang] = el.dataset.langName;
    return el.lang;
  });
  page.allLanguages = page.availableLanguages.concat(page.extraLanguages).sort();

  // page.loadLanguages = AISTag.state.user.myLanguages.concat(page.availableLanguages);
  page.loadLanguages = AISTag.state.user.myLanguages.concat(page.availableLanguages).filter(function (x, i, a) {
    return a.indexOf(x) == i;
  });

  page.wikidataItems = Array.from(document.querySelectorAll('#wikidata-container > article')).map(function (el) {
    return el.id;
  });

  page.tags = Array.from(document.querySelectorAll('#tags-container > article')).map(function (el) {
    //let wdInfo = '@todo';
    let wdInfo = {};
    let wdEls = el.querySelectorAll('[itemprop="sameAs"]');
    for (let i = 0; i < wdEls.length; ++i) {
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
          if (key.indexOf('tagWd') > -1 && key.indexOf('tagWdAkronimo') == -1) {
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
      'tags': Array.from(el.querySelectorAll('kbd')).map(function (el2) {
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
AISTag.whatRelations = function () {
  AISTag.state.relations = {
    wkToTags: {}
  };
  // console.log('AISTag.whatRelations1111', AISTag.state.relations.wkToTags);
  //console.log(',,,', AISTag.state.wikidata, AISTag.state.page.tags);
  for (let key in AISTag.state.wikidata) {
    if (AISTag.state.wikidata.hasOwnProperty(key)) {
      for (let i = 0; i < AISTag.state.page.tags.length; ++i) {
        if (AISTag.state.page.tags[i].wikidata[key]) {
          // console.log('eee1234', key, AISTag.state.page.tags[i].wikidata[key]);
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
  // console.log('AISTag.whatRelations3333', AISTag.state.relations);
  return AISTag.state.relations;
}

/**
 * What we know about the browser of the intelligent agent accessing our site?
 *
 * @todo: otimize me.myLanguages to work better with macrolanguages, like chinese
 *        and arabic; sometimes Wikidata/Wikipedia WILL have a more specific
 *        language, but at this point we're just using the first part.
 *        (fititnt, 2019-04-20 00:46 BRT)
 *
 * @returns {Object}
 */
AISTag.whoAmI = function () {
  let me = {};
  me.myLanguage = navigator.language || navigator.userLanguage;
  me.myLanguagesOriginal = navigator.languages || [me.myLanguage];
  me.myLanguages = [];
  me.myLanguagesOriginal.forEach(function(lang) {
    let wdLang = lang.split('-');
    if (me.myLanguages.indexOf(wdLang[0]) === -1) {
      me.myLanguages.push(wdLang[0]);
    }
  })
  AISTag.state.user = me;
  return me;
}

AISTag.init();
