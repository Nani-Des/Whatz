/** Run TipTap/ProseMirror work outside React's render/commit cycle. */
export function deferEditorTask(task: () => void): void {
  queueMicrotask(() => {
    try {
      task()
    } catch {
      // Editor may have unmounted
    }
  })
}
