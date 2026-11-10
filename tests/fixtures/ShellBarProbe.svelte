<script lang="ts">
	import { inShellBar } from '../../src/lib/primitives/shell-bar';

	const placed = inShellBar();
</script>

<button type="button" data-in-bar={placed ? 'yes' : 'no'}>Notices</button>
