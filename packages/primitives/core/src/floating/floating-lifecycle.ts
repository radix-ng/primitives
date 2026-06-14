/**
 * The shared **mounted / open** lifecycle contract every floating capability reads (ADR 0015 §1,
 * cross-cutting across ADRs 0015/0016/0017). It separates *presence* from *activeness*, which Base
 * UI keeps distinct (`DialogStore` / `popupStoreUtils`):
 *
 * - **`mounted()`** — the node/popup is rendered. Stays `true` through an animated exit (Base UI's
 *   `FloatingFocusManager` is `disabled={!mounted}`, so the focus trap survives the exit).
 * - **`open()`** — the popup is logically open. Flips to `false` **immediately** on close, *before*
 *   unmount.
 *
 * The interesting middle state is **closed-but-mounted** (`mounted() && !open()`): an animated exit,
 * or a popup deliberately kept mounted after close. Its effects are **per-effect**, matching Base UI
 * (it is *not* "everything off"):
 *
 * | concern                          | on `open() === false` (still mounted) |
 * | -------------------------------- | ------------------------------------- |
 * | dismissal (Escape/outside-press) | **inactive** — capability reads `open()` |
 * | `markOthers` marker / aria-hidden| **released**                          |
 * | internal backdrop                | **`inert`**                           |
 * | scroll lock                      | **unlocked** (predicate keys off `open()`) |
 * | focus trap + return-focus        | **persist until unmount** (read `mounted()`) |
 *
 * So every consumer reads `open()` for behavior and `mounted()` for presence — never conflating them.
 *
 * @remarks
 * `preventUnmountOnClose` (Base UI's per-close one-shot that holds a popup *mounted after close*) is a
 * **close-transaction** concern, not a standing boolean — modeling it as a persistent
 * `signal<boolean>` would pin the popup mounted forever after the first prevented close. Whether Radix
 * exposes it publicly or maps it onto `RdxPortalPresence` (keep-mounted) is pinned in ADR 0015/0017
 * Phase 0; it is intentionally **not** baked into this contract.
 */
export interface RdxFloatingLifecycle {
    /** Presence: the node/popup is rendered (stays `true` during an animated exit). */
    readonly mounted: () => boolean;
    /** Activeness: the popup is open (flips `false` immediately on close, before unmount). */
    readonly open: () => boolean;
}
