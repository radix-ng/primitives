import { addons } from 'storybook/manager-api';
import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';
import { light } from './themes';

installRdxDirectiveHighlight();
addons.setConfig({ theme: light });
