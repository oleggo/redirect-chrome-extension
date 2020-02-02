import React from 'react';
import style from './popup.scss';
import { Settings } from '~common/types';
import { getSettings, setOnSettingsChanged } from '~common/settings';

interface State {
  settings: Settings;
}

export class Popup extends React.Component<{}, State> {
  state = {
    settings: getSettings(),
  };

  componentDidMount(): void {
    setOnSettingsChanged(settings => {
      this.setState({
        settings,
      });
    });
  }

  onSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  private renderRules() {
    const { settings } = this.state;
    if (!settings || !settings.groups) {
      return <span />;
    }
    if (!settings.groups.length) {
      return <span>No rules defined</span>;
    }
    return (
      <div>
        {settings.groups.map(group => (
          <div key={group.name} className={style.rule}>
            <div className={style.ruleDescription}>
              <div className={style.name}>{group.name}</div>
            </div>
            <div className={style.image}>{group.enabled ? <span className={style.imageOn}>ON</span> : <span className={style.imageOff}>OFF</span>}</div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className={style.root} onClick={this.onSettings}>
        <div className={style.title}>REDIRECT</div>
        <div className={style.rules}>{this.renderRules()}</div>
      </div>
    );
  }
}
