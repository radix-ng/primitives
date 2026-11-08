import { createContext } from '@radix-ng/primitives/core';
import type { RdxOtpFieldRoot } from './otp-field-root';

/** The root owns OTP state; slots read and update it through this context. */
export const [injectOtpFieldRootContext, provideOtpFieldRootContext] = createContext<RdxOtpFieldRoot>(
    'RdxOtpFieldRootContext',
    'components/otp-field'
);
