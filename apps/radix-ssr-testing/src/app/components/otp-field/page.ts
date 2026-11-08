import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxOtpFieldModule } from '@radix-ng/primitives/otp-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-otp-field',
    imports: [RdxOtpFieldModule],
    template: `
        <form>
            <label for="server-code">Verification code</label>
            <div id="server-code" [length]="4" defaultValue="12" required name="code" rdxOtpFieldRoot>
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
                <input rdxOtpFieldInput />
            </div>
        </form>
    `
})
export default class OtpFieldPage {}
