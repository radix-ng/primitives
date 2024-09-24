import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxDialogCloseDirective } from '../src/dialog-close.directive';
import { RdxDialogContentDirective } from '../src/dialog-content.directive';
import { RdxDialogDescriptionDirective } from '../src/dialog-description.directive';
import { RdxDialogTitleDirective } from '../src/dialog-title.directive';
import { RdxDialogTriggerDirective } from '../src/dialog-trigger.directive';
import { provideRdxDialogConfig } from '../src/dialog.providers';

const html = String.raw;

export default {
    title: 'Examples/Sheet',
    decorators: [
        applicationConfig({
            providers: [provideRdxDialogConfig()]
        }),
        moduleMetadata({
            imports: [
                RdxDialogTriggerDirective,
                RdxDialogContentDirective,
                RdxDialogTitleDirective,
                RdxDialogCloseDirective,
                RdxDialogDescriptionDirective
            ]
        })

    ],
    argTypes: {
        mode: {
            options: ['sheet-right', 'sheet-bottom'],
            control: {
                type: 'select'
            }
        },
        backdropClass: {
            options: ['cdk-overlay-dark-backdrop', 'DialogOverlay'],
            control: {
                type: 'select'
            },
            table: {
                defaultValue: { summary: 'cdk-overlay-dark-backdrop' }
            }
        }
    },
    render: (args) => {
        return {
            props: {
                config: args
            },
            template: html`
                <!-- config: ${JSON.stringify(args)} -->
                <button class="Button violet" [rdxDialogConfig]="config" [rdxDialogTrigger]="sheetTpl">
                    Open Sheet
                </button>

                <ng-template #sheetTpl>
                    <div class="DialogContent" rdxDialogContent>
                        <h2 class="DialogTitle" rdxDialogTitle>Edit profile</h2>
                        <p class="DialogDescription" rdxDialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </p>
                        <fieldset class="Fieldset">
                            <label class="Label" htmlFor="name">Name</label>
                            <input class="Input" id="name" defaultValue="Pedro Duarte" />
                        </fieldset>
                        <fieldset class="Fieldset">
                            <label class="Label" htmlFor="username">Username</label>
                            <input class="Input" id="username" defaultValue="@peduarte" />
                        </fieldset>
                        <div style="display:flex; margin-top: 25px; justify-content: flex-end;">
                            <button class="Button green" rdxDialogClose>Save changes</button>
                        </div>
                        <button class="IconButton" rdxDialogClose aria-label="Close">X</button>
                    </div>
                </ng-template>
            `
        };
    }
} as Meta;

export const Default: StoryObj = {
    args: {
        backdropClass: 'cdk-overlay-dark-backdrop',
        mode: 'sheet-right'
    }
};
