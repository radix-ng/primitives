import { addons } from 'storybook/manager-api';
import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';

installRdxDirectiveHighlight();
addons.setConfig({});
