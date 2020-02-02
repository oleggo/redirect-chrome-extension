import React from 'react';
import style from './setup.scss';
import { copyRule, Rule, RuleGroup, Settings } from '~common/types';
import { AppBar, Box, Button, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Popover, TextField, Toolbar, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';
import LabelIcon from '@material-ui/icons/Label';
import LabelOffIcon from '@material-ui/icons/LabelOff';
import { getSettings, matchGroup, prepareGroup, setOnSettingsChanged, setSettings } from '~common/settings';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';

interface State {
  settings: Settings;
  editGroupIndex?: number | null;
  name: string;
  description: string;
  addNew: boolean;
  rules: Rule[];
  testUrl: string;
  testResults: string;
}

export class Setup extends React.Component<{}, State> {
  state = {
    settings: getSettings(),
    editGroupIndex: null,
    name: '',
    description: '',
    rules: [],
    addNew: false,
    testUrl: '',
    testResults: '',
  };

  componentDidMount() {
    setOnSettingsChanged(settings => {
      this.setState({
        settings,
      });
    });
  }

  save = () => {
    setSettings(this.state.settings);
    chrome.runtime.sendMessage({
      settingsChanged: true,
    });
  };

  private toggleGroup(group: RuleGroup) {
    group.enabled = !group.enabled;
    setSettings(this.state.settings);
  }

  private renderGroup(group: RuleGroup, index: number) {
    return (
      <ListItem key={group.name}>
        <ListItemIcon>
          <IconButton edge="end" aria-label="toggle" onClick={() => this.toggleGroup(group)}>
            {group.enabled ? <LabelIcon style={{ color: 'green' }} /> : <LabelOffIcon />}
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={group.name} secondary={group.description.replace(/\n/g, ' ## ')} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="edit" onClick={() => this.editGroup(index)}>
            <CreateIcon />
          </IconButton>
          <PopupState variant="popover">
            {popupState => (
              <>
                <IconButton edge="end" aria-label="delete" {...bindTrigger(popupState)}>
                  <DeleteIcon />
                </IconButton>
                <Popover {...bindPopover(popupState)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                  <Box p={2}>
                    <Typography>Do you want to delete {group.name}?</Typography>
                    <Button variant="contained" color="primary" onClick={() => this.deleteGroup(index)}>
                      Delete
                    </Button>
                  </Box>
                </Popover>
              </>
            )}
          </PopupState>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  private renderEditRule(rule: Rule, index: number) {
    return (
      <div className={style.editRule} key={index}>
        <div className={style.editRuleRules}>
          <div className={style.editSrc}>
            <TextField
              label="Source"
              value={rule.src}
              onChange={e => {
                const rules = [...this.state.rules];
                rule.src = e.target.value;
                this.setState({
                  rules,
                });
              }}
              fullWidth
            />
          </div>
          <div className={style.editTgt}>
            <TextField
              label="Target"
              value={rule.tgt}
              onChange={e => {
                const rules = [...this.state.rules];
                rule.tgt = e.target.value;
                this.setState({
                  rules,
                });
              }}
              fullWidth
            />
          </div>
        </div>
        <div className={style.editRuleActions}>
          <IconButton edge="end" aria-label="delete" onClick={() => this.deleteRule(rule)}>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    );
  }

  private deleteRule(rule: Rule) {
    const rules = this.state.rules.filter(r => r !== rule);
    this.setState({
      rules,
    });
  }

  private addRule() {
    const newRule: Rule = {
      src: '',
      tgt: '',
      type: 'basic',
      match: null,
    };
    const rules = [...this.state.rules, newRule];
    this.setState({
      rules,
    });
  }

  private setTestUrl(url: string) {
    if (!url) {
      this.setState({
        testResults: '',
        testUrl: '',
      });
      return;
    }
    const group: RuleGroup = {
      name: '',
      description: '',
      enabled: true,
      rules: this.state.rules,
    };
    prepareGroup(group);
    const match = matchGroup(group, url);
    const testResults = match ? `Found match: ${match}` : 'Match not found';
    this.setState({
      testResults,
      testUrl: url,
    });
  }

  private renderEditGroup() {
    const { name, description, rules, testUrl, testResults } = this.state;
    return (
      <div className={style.rule}>
        <div className={style.body}>
          <div className={style.name}>
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={e =>
                this.setState({
                  name: e.target.value,
                })
              }
              fullWidth
            />
          </div>
          <div className={style.name}>
            <TextField
              label="Description"
              variant="outlined"
              value={description}
              rows={4}
              multiline
              onChange={e =>
                this.setState({
                  description: e.target.value,
                })
              }
              fullWidth
            />
          </div>
          <div className={style.editGroupActions}>
            <PopupState variant="popover">
              {popupState => (
                <>
                  <Button variant="contained" {...bindTrigger(popupState)}>
                    How to add rules
                  </Button>
                  <Popover {...bindPopover(popupState)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Box p={2}>
                      <Typography>Simple rule can contain asterisk (*) symbols to match text of any length</Typography>
                      <Typography>If an asterisk is placed at the last position of the URL it will match any set of symbols</Typography>
                      <Typography>If it is placed in the middle of the URL it will match any symbol except slash (/)</Typography>
                      <Typography>For example, http://mysite.com/*/path will match http://mysite.com/123/path but will not match http://mysite/123/456/path</Typography>
                      <Typography>However http://mysite.com/* will match both http://mysite.com/123/path and http://mysite/123/456/path or any path inside this site</Typography>
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      <Typography>You can use '$' signs in the target URL to substitute it to appropriate '*' contents in the source</Typography>
                      <Typography>For example, if you have source=www.mysite.com/*/path and target=www.othersite.com/module/$1/subpath</Typography>
                      <Typography>Then URL www.mysite.com/123/path will be replaced to www.othersite.com/module/123/subpath</Typography>
                    </Box>
                  </Popover>
                </>
              )}
            </PopupState>
            <PopupState variant="popover">
              {popupState => (
                <>
                  <Button variant="contained" {...bindTrigger(popupState)}>
                    Test URL
                  </Button>
                  <Popover
                    {...bindPopover({
                      ...popupState,
                      close: () => {
                        this.setTestUrl('');
                        popupState.close();
                      },
                    })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  >
                    <Box p={2} className={style.test}>
                      <Typography>Enter URL to test with the rule</Typography>
                      <TextField label="URL" value={testUrl} onChange={e => this.setTestUrl(e.target.value)} fullWidth />
                      <Typography>{testResults}</Typography>
                    </Box>
                  </Popover>
                </>
              )}
            </PopupState>
            <span className={style.span} />
            <Button color="inherit" endIcon={<AddIcon />} onClick={() => this.addRule()}>
              Add Rule
            </Button>
          </div>
          <div>{rules.map((rule, index) => this.renderEditRule(rule, index))}</div>
        </div>
        <div className={style.actions}>
          <Button variant="contained" color="primary" onClick={() => this.saveGroup()} disabled={!name.trim() || !rules.length}>
            Save
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              this.setState({
                editGroupIndex: null,
              })
            }
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  private editGroup(index: number) {
    const group = this.state.settings.groups[index];
    this.setState({
      editGroupIndex: index,
      name: group.name,
      description: group.description,
      rules: group.rules.map(copyRule),
      addNew: false,
    });
  }

  private addGroup() {
    this.setState({
      editGroupIndex: this.state.settings.groups.length,
      name: '',
      description: '',
      rules: [],
      addNew: true,
    });
  }

  private saveGroup() {
    const { name, rules, addNew, editGroupIndex, settings, description } = this.state;
    if (addNew) {
      settings.groups.push({
        name: '',
        rules: [],
        description: '',
        enabled: true,
      });
    }
    const group = settings.groups[editGroupIndex];
    group.name = name;
    group.rules = rules;
    group.description = description;
    this.setState({
      editGroupIndex: null,
    });
    this.save();
  }

  private deleteGroup(index: number) {
    this.state.settings.groups.splice(index, 1);
    this.save();
  }

  private renderRules() {
    const { settings } = this.state;
    return (
      <div className={style.rules}>
        <List dense={true}>{settings?.groups?.map((g, i) => this.renderGroup(g, i))}</List>
      </div>
    );
  }

  render() {
    const { editGroupIndex } = this.state;
    return (
      <div className={style.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={style.title}>
              {editGroupIndex !== null ? `Redirect: Edit Rules` : 'Redirect: Settings'}
            </Typography>
            <Button color="inherit" endIcon={<AddIcon />} onClick={() => this.addGroup()} disabled={editGroupIndex !== null}>
              Add
            </Button>
          </Toolbar>
        </AppBar>
        {editGroupIndex !== null ? this.renderEditGroup() : this.renderRules()}
      </div>
    );
  }
}
