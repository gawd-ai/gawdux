<script lang="ts">
  import PageCommandBarConfirm from "../../src/lib/primitives/PageCommandBarConfirm.svelte";
  import type { DiscardNavigationCommandPresentationProps } from "../../src/lib/primitives/discard-navigation-command";
  let {
    request,
    pending,
    error,
    onconfirm,
    oncancel,
  }: DiscardNavigationCommandPresentationProps = $props();
</script>

<PageCommandBarConfirm
  title="Discard unsaved changes?"
  message={request.message}
  {error}
  cancelLabel="Keep editing"
  confirmLabel={request.confirmLabel}
  busy={pending}
  disabled={request.disabled}
  {onconfirm}
  {oncancel}
/>
