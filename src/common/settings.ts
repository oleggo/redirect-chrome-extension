import { DataStorage, RuleGroup, Settings } from '~common/types';

let settings: Settings = undefined;
let onSettingsChanged: (settings: Settings) => void;

const RegexSpecialChars = {
  '\\': true,
  '^': true,
  $: true,
  '{': true,
  '}': true,
  '[': true,
  ']': true,
  '(': true,
  ')': true,
  '.': true,
  '*': true,
  '+': true,
  '?': true,
  '|': true,
  '<': true,
  '>': true,
  '-': true,
  '&': true,
  '/': true,
};

function decorateForRegex(rule: string): string {
  let ret = '';
  for (let i = 0; i < rule.length; i++) {
    if (RegexSpecialChars[rule[i]]) {
      ret += '\\';
    }
    ret += rule[i];
  }
  return ret;
}

export function matchGroup(group: RuleGroup, url: string) {
  if (!group.enabled) {
    return;
  }
  for (const rule of group.rules) {
    if (!rule.match || !rule.tgt) {
      continue;
    }
    const match = url.match(rule.match);
    if (!match) {
      continue;
    }
    return rule.tgt.replace(/\$([0-9]+)/, (sub, val) => {
      const pos = Number(val);
      if (match[pos + 1]) {
        return match[pos + 1];
      }
      return sub;
    });
  }
}

export function prepareGroup(group: RuleGroup) {
  for (const rule of group.rules) {
    if (!rule.src) {
      continue;
    }
    let match = '^';
    let from = 0;
    for (;;) {
      const p = rule.src.indexOf('*', from);
      if (p < 0) {
        match += decorateForRegex(rule.src.substr(from));
        break;
      }
      if (p > from) {
        match += decorateForRegex(rule.src.substr(from, p - from));
      }
      if (p === rule.src.length - 1) {
        match += '(.+)';
        break;
      }
      match += '([^/]+)';
      from = p + 1;
    }
    match += '$';
    rule.match = new RegExp(match);
  }
}

function prepareSettings() {
  if (!settings || !settings.groups) {
    return;
  }
  for (const group of settings.groups) {
    prepareGroup(group);
  }
}

export function loadSettings() {
  chrome.storage.sync.get(({ config }: DataStorage) => {
    settings = JSON.parse(config);
    if (!settings.groups) {
      settings.groups = [];
    }
    prepareSettings();
    if (onSettingsChanged) {
      onSettingsChanged(settings);
    }
  });
}

export function getSettings() {
  return settings;
}

export function setSettings(s: Settings) {
  const text = JSON.stringify(
    {
      groups: s.groups.map(group => ({
        ...group,
        rules: group.rules.map(rule => ({
          ...rule,
          match: undefined,
        })),
      })),
    },
    null,
    '  ',
  );
  chrome.storage.sync.set(
    {
      config: text,
    },
    () => {
      settings = JSON.parse(text);
      prepareSettings();
      if (onSettingsChanged) {
        onSettingsChanged(settings);
      }
      chrome.runtime.sendMessage({
        settingsChanged: true,
      });
    },
  );
}

chrome.runtime.onMessage.addListener(function(request) {
  if (request.settingsChanged) {
    loadSettings();
  }
});

loadSettings();

export function setOnSettingsChanged(callback: (settings: Settings) => void) {
  onSettingsChanged = callback;
}
