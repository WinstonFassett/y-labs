<script>
  let isDarkMode = globalThis.resolveTheme?.() === 'dark';

  function toggleDarkMode() {
    const theme = resolveTheme()
    isDarkMode = !isDarkMode
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
</script>

<button on:click={toggleDarkMode} class="relative flex items-center justify-center w-8 h-8 text-2xl rounded-full hover:bg-divider transition-all">
  <div class={`absolute transition-all transform ease-in-out duration-500 ${isDarkMode ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
  </div>
  <div class={`absolute transition-all transform ease-in-out duration-500 ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}>  
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
  </div>
</button>
