import { exitClass, heldExitClass } from '../../../shared/lifecycle';
import type { Settings } from './contract';

export interface PanelSettings {
    presence: boolean;
    keepMounted: boolean;
    motion: 'none' | 'held' | 'natural';
    reselect?: boolean;
    nested?: boolean;
}
const options = [
    { value: 0, label: 'Account' },
    { value: 1, label: 'Password' }
];
const fixture = (panels: PanelSettings): Settings => ({ options, defaultValue: 0, panels });
export const panelCases = {
    'panel-retained-immediate': fixture({ presence: false, keepMounted: false, motion: 'none' }),
    'panel-retained-exit': fixture({ presence: false, keepMounted: true, motion: 'held' }),
    'panel-presence-exit': fixture({ presence: true, keepMounted: false, motion: 'held' }),
    'panel-presence-keep-exit': fixture({ presence: true, keepMounted: true, motion: 'held' }),
    'panel-natural-exit': fixture({ presence: true, keepMounted: false, motion: 'natural' }),
    'panel-reselect-exit': fixture({ presence: true, keepMounted: false, motion: 'held', reselect: true }),
    'panel-retained-reselect': fixture({ presence: false, keepMounted: true, motion: 'held', reselect: true }),
    'panel-nested-exit': fixture({ presence: true, keepMounted: false, motion: 'held', nested: true })
};
export type PanelCaseName = keyof typeof panelCases;
export const panelMotionClass = (settings: PanelSettings) =>
    settings.motion === 'held' ? heldExitClass : settings.motion === 'natural' ? exitClass : '';
export const nestedMotionClass =
    ' group-data-[ending-style]:animate-[pulse_30s_linear] group-data-[ending-style]:[animation-play-state:paused]';
