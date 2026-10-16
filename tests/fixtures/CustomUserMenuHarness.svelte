<script lang="ts">
  import UserMenu from "../../src/lib/components/UserMenu.svelte";
</script>

<UserMenu
  name="Ada Lovelace"
  items={[{ label: "Profile", href: "/profile" }]}
  signOutAction="/signout"
>
  {#snippet presentation(menu)}
    <div
      data-custom-menu
      data-state={menu.open ? "open" : "closed"}
      use:menu.rootAction
      onfocusout={menu.onRootFocusOut}
    >
      <div
        role="presentation"
        onpointerenter={menu.clearLeave}
        onpointerleave={menu.onPanelPointerLeave}
      >
        <button
          type="button"
          use:menu.triggerAction
          id={menu.triggerId}
          aria-label={menu.triggerLabel}
          aria-haspopup="menu"
          aria-expanded={menu.open}
          aria-controls={menu.controlsId}
          onclick={menu.onTriggerClick}
          onkeydown={menu.onTriggerKeydown}>Account</button
        >
        <div use:menu.bodyAction id={menu.bodyId} inert={!menu.open}>
          <div
            use:menu.menuAction
            id={menu.menuId}
            role="menu"
            tabindex="-1"
            aria-labelledby={menu.triggerId}
            onkeydown={menu.onMenuKeydown}
            onpointermove={menu.onMenuPointerMove}
            onpointerleave={menu.onMenuPointerLeave}
          >
            <a
              href="/profile"
              role="menuitem"
              tabindex="-1"
              onclick={() => menu.close()}>Profile</a
            >
            <form method="POST" action="/signout" role="none">
              <button type="submit" role="menuitem" tabindex="-1"
                >Sign out</button
              >
            </form>
          </div>
        </div>
      </div>
    </div>
  {/snippet}
</UserMenu>
<button type="button" data-testid="outside">Outside</button>
