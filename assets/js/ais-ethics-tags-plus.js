console.log('hello from ais-ethics-tags-plus.js')

/**
 * Manage the logic
 * @namespace
 **/
const AISTagPlus = {};


AISTagPlus.init = function() {
  console.log('AISTagPlus.init...');
  console.log('Who I am?', AISTag.whoAmI());
  console.log('What Page is?', AISTag.whatPageIs());

  AISTag.loopTags();
  AISTag.vanillaJsonp();
}
