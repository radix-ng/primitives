import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxAlertDialogCancelDirective } from '../src/alert-dialog-cancel.directive';
import { RdxAlertDialogContentDirective } from '../src/alert-dialog-content.directive';
import { RdxAlertDialogRootDirective } from '../src/alert-dialog-root.directive';
import { RdxAlertDialogTitleDirective } from '../src/alert-dialog-title.directive';
import { RdxAlertDialogTriggerDirective } from '../src/alert-dialog-trigger.directive';
import { RdxAlertDialogService } from '../src/alert-dialog.service';

export default {
    title: 'Primitives/Alert Dialog',
    decorators: [
        moduleMetadata({
            imports: [
                RdxAlertDialogContentDirective,
                RdxAlertDialogRootDirective,
                RdxAlertDialogTitleDirective,
                RdxAlertDialogTriggerDirective,
                RdxAlertDialogCancelDirective,
                OverlayModule,
                PortalModule
            ],
            providers: [RdxAlertDialogService]
        }),
        componentWrapperDecorator(
            (story) =>
                `
                    <div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: `

<div rdxAlertDialogRoot [content]="alertDialogContent">
    <button rdxAlertDialogTrigger class="Button violet">Delete account</button>
    <ng-template #alertDialogContent>
        <div rdxAlertDialogContent maxWidth="450" class="AlertDialogContent">
            <h2 rdxAlertDialogTitle class="AlertDialogTitle">Are you absolutely sure?</h2>
            <p class="AlertDialogDescription">
               This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </p>
            <div style="display: flex; gap: 3px; margin-top: 4px; justify-content: flex-end;">
                <button rdxAlertDialogCancel class="Button mauve">Cancel</button>
                <button class="Button red">Revoke access</button>
            </div>
        </div>
    </ng-template>
</div>

<style>

.AlertDialogContent {
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.AlertDialogTitle {
  margin: 0;
  color: var(--mauve-12);
  font-size: 17px;
  font-weight: 500;
}

.AlertDialogDescription {
  margin-bottom: 20px;
  color: var(--mauve-11);
  font-size: 15px;
  line-height: 1.5;
}

button {
  all: unset;
}
Button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0 15px;
  font-size: 15px;
  line-height: 1;
  font-weight: 500;
  height: 35px;
}
.Button.violet {
  background-color: white;
  color: var(--violet-11);
  box-shadow: 0 2px 10px var(--black-a7);
}
.Button.violet:hover {
  background-color: var(--mauve-3);
}
.Button.violet:focus {
  box-shadow: 0 0 0 2px black;
}
.Button.red {
  background-color: var(--red-4);
  color: var(--red-11);
}
.Button.red:hover {
  background-color: var(--red-5);
}
.Button.red:focus {
  box-shadow: 0 0 0 2px var(--red-7);
}
.Button.mauve {
  background-color: var(--mauve-4);
  color: var(--mauve-11);
}
.Button.mauve:hover {
  background-color: var(--mauve-5);
}
.Button.mauve:focus {
  box-shadow: 0 0 0 2px var(--mauve-7);
}
</style>

`
    })
};
