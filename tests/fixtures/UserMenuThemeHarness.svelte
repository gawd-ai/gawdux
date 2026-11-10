<!-- An account menu with the theme row, as the phone shell's bar holds it. -->
<script lang="ts">
	import UserMenu from '../../src/lib/components/UserMenu.svelte';

	let { theme = true }: { theme?: boolean } = $props();
</script>

<UserMenu
	name="Ada Lovelace"
	email="ada@example.test"
	items={[{ label: 'Profile', href: '#/profile' }]}
	onsignout={() => {}}
	{...theme ? { theme: { cookieName: 'host.colorTheme' } } : {}}
/>
<button type="button" data-testid="outside">Elsewhere</button>
