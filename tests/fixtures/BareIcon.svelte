<!-- An icon shaped like flowbite-svelte-icons 2.0.x, which gawdux's peer range
     (^2.0.0) allows and SIMS resolves: it names itself ("shield outline"),
     takes the props it is given and sets no aria-hidden of its own. 2.3's
     icons set aria-hidden themselves, after the props, so a header test that
     renders one cannot tell whether HeadLabel passed aria-hidden="true"; a
     test that renders this one can. -->
<script lang="ts">
	let {
		class: className = '',
		ariaLabel = 'shield outline',
		...restProps
	}: { class?: string; ariaLabel?: string; [key: string]: unknown } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	{...restProps}
	class={`shrink-0 h-5 w-5 ${className}`}
	role="img"
	aria-label={ariaLabel}
	viewBox="0 0 24 24"><path stroke="currentColor" d="M4 4h16v16H4z" /></svg
>
