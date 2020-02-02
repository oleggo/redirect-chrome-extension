export interface Rule {
  src: string;
  tgt: string;
  type: 'basic';
  match: RegExp;
}

export const copyRule = ({ src, tgt, type }: Rule): Rule => ({ src, type, tgt, match: null });

export interface RuleGroup {
  name: string;
  description: string;
  rules: Rule[];
  enabled: boolean;
}

export interface Settings {
  groups: RuleGroup[];
}

export interface DataStorage {
  config: string;
}
