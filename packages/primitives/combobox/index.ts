import { RdxComboboxAnchor } from './src/combobox-anchor';
import { RdxComboboxArrow } from './src/combobox-arrow';
import { RdxComboboxBackdrop } from './src/combobox-backdrop';
import { RdxComboboxChip } from './src/combobox-chip';
import { RdxComboboxChipRemove } from './src/combobox-chip-remove';
import { RdxComboboxChips } from './src/combobox-chips';
import { RdxComboboxClear } from './src/combobox-clear';
import { RdxComboboxEmpty } from './src/combobox-empty';
import { RdxComboboxGroup } from './src/combobox-group';
import { RdxComboboxGroupLabel } from './src/combobox-group-label';
import { RdxComboboxIcon } from './src/combobox-icon';
import { RdxComboboxInput } from './src/combobox-input';
import { RdxComboboxInputGroup } from './src/combobox-input-group';
import { RdxComboboxItem } from './src/combobox-item';
import { RdxComboboxItemIndicator } from './src/combobox-item-indicator';
import { RdxComboboxLabel } from './src/combobox-label';
import { RdxComboboxList } from './src/combobox-list';
import { RdxComboboxPopup } from './src/combobox-popup';
import { RdxComboboxPortal, RdxComboboxPortalMisuseGuard } from './src/combobox-portal';
import { RdxComboboxPositioner } from './src/combobox-positioner';
import { RdxComboboxRoot } from './src/combobox-root';
import { RdxComboboxRow } from './src/combobox-row';
import { RdxComboboxSeparator } from './src/combobox-separator';
import { RdxComboboxStatus } from './src/combobox-status';
import { RdxComboboxTrigger } from './src/combobox-trigger';
import { RdxComboboxValue } from './src/combobox-value';
import { NgModule } from '@angular/core';

export * from './src/combobox-anchor';
export * from './src/combobox-arrow';
export * from './src/combobox-backdrop';
export * from './src/combobox-chip';
export * from './src/combobox-chip-remove';
export * from './src/combobox-chips';
export * from './src/combobox-clear';
export * from './src/combobox-empty';
export * from './src/combobox-group';
export * from './src/combobox-group-label';
export * from './src/combobox-icon';
export * from './src/combobox-input';
export * from './src/combobox-input-group';
export * from './src/combobox-item';
export * from './src/combobox-item-indicator';
export * from './src/combobox-label';
export * from './src/combobox-list';
export * from './src/combobox-popup';
export * from './src/combobox-portal';
export * from './src/combobox-positioner';
export * from './src/combobox-root';
export * from './src/combobox-row';
export * from './src/combobox-separator';
// The shared engine factory (ADR 0014). @internal — exported only so the autocomplete entry can build
// on it (ng-packagr secondary entries can't share unexported code); NOT part of the public API and may
// change without notice. The `ComboboxEngine` / `ComboboxEngineConfig` types stay unexported (the roots
// reference them via their own private fields / `ReturnType<typeof useComboboxEngine>`).
export { useComboboxEngine } from './src/combobox-engine';
export * from './src/combobox-status';
export * from './src/combobox-trigger';
export * from './src/combobox-value';

export const _importsCombobox = [
    RdxComboboxRoot,
    RdxComboboxAnchor,
    RdxComboboxLabel,
    RdxComboboxInput,
    RdxComboboxInputGroup,
    RdxComboboxValue,
    RdxComboboxTrigger,
    RdxComboboxIcon,
    RdxComboboxClear,
    RdxComboboxPortal,
    RdxComboboxPortalMisuseGuard,
    RdxComboboxBackdrop,
    RdxComboboxPositioner,
    RdxComboboxPopup,
    RdxComboboxArrow,
    RdxComboboxList,
    RdxComboboxRow,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxGroup,
    RdxComboboxGroupLabel,
    RdxComboboxSeparator,
    RdxComboboxEmpty,
    RdxComboboxStatus,
    RdxComboboxChips,
    RdxComboboxChip,
    RdxComboboxChipRemove
];

@NgModule({
    imports: [..._importsCombobox],
    exports: [..._importsCombobox]
})
export class RdxComboboxModule {}
