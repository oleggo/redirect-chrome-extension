import { getSettings, matchGroup } from '~common/settings';

console.log('background started');

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const settings = getSettings();
    if (!settings || !settings.groups) {
      return;
    }
    for (const group of settings.groups) {
      if (!group.enabled) {
        continue;
      }
      const match = matchGroup(group, details.url);
      if (match) {
        return {
          redirectUrl: match,
        };
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking'],
);
