# Menu trusted touch (ADR 0049)

Menu Trigger/SubTrigger reuse the minimal native pointer tracker
extracted from createRdxTriggerInteraction. The registered trigger supplies its input resolver to
Root; consult it only for events inside that trigger and preserve the original compatibility
mousedown. Touch SubTrigger activates on mousedown, consumes its following click once, and toggles
without keyboard autofocus. Disabled command/checkbox/radio items prevent pointer focus but keep
keyboard focusability. Trigger data-pressed follows the open session; native :active remains physical
feedback. Menu and Select share trusted CDP pan/cancel input; Firefox touch and WebKit CDP gestures
remain capability skips. Compare callback event types/trust instead of normalizing framework events.
