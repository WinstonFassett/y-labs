<script lang="ts">
  import { buttonVariants, type ButtonVariants } from '@/components/ui/button';  
  import type { HTMLButtonAttributes } from 'svelte/elements';
  type $$Props = HTMLButtonAttributes & ButtonVariants
  export let variant: $$Props['variant'] = 'default';
  export let size: $$Props['size'] = 'md';
  export let color: $$Props['color'] = 'default';

</script>

<button on:click on:keydown class={buttonVariants({ variant, size, color, class: $$props.class})}>
  <slot />
</button>
