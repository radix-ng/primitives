# Menu projection ownership (ADR 0057)

Root owns floating node registration so projected child Roots inherit logical ancestry outside a Popup declaring view. Each Root publishes its Popup CompositeList and isRestoringFocus callback. Item parts use the existing Composite owner bridge; SubTrigger uses its parent Root. Sibling discovery reads registered instances rather than requiring selector attributes on hostDirectives wrappers. Root must stay in the projected parts' declaring tree. Popup disposal clears published references.
