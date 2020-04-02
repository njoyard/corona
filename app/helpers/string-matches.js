import { helper } from '@ember/component/helper';

export default helper(function stringMatches([haystack, needle]) {
  return !needle || haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
});
