<template>
  <nav class="entry-tabs-nav" aria-label="Entries navigation">
    <RouterLink to="/entries/shared" class="tab-link">Shared Entries</RouterLink>
    <RouterLink to="/entries/anchored" class="tab-link">Anchored Entries</RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
.entry-tabs-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}

.tab-link {
  position: relative;
  font-family: $oxanium;
  font-size: 1.053rem; // ≈ 20px at 19px base
  font-weight: 500;
  color: darken($color-text, 20%);
  text-decoration: none;
  opacity: 0.7;
  text-shadow: $glow-25-white;
  letter-spacing: 0.01em;
  transition:
    color 120ms ease-in-out,
    opacity 120ms ease-in-out,
    text-shadow 120ms ease-in-out;

  // Custom underline via ::after — hidden on inactive tabs
  &::after {
    content: '';
    position: absolute;
    left: -2px;
    right: -2px;
    bottom: -5px;
    height: 1px;
    background: $color-text;
    box-shadow: $glow-25-white;
    opacity: 0;
    transform: scaleX(0.6);
    transform-origin: center;
    transition:
      opacity 120ms ease-in-out,
      transform 120ms ease-in-out,
      box-shadow 120ms ease-in-out;
  }

  &:hover {
    color: $color-text;
    opacity: 0.85;
    text-shadow: $glow-25-white;

    &::after {
      opacity: 0.45;
      transform: scaleX(1);
    }
  }

  &.router-link-active {
    color: $color-text;
    opacity: 1;
    text-shadow: $glow-50-white;

    &::after {
      opacity: 1;
      transform: scaleX(1);
      box-shadow: $glow-50-white;
    }
  }

  @media (max-width: $bp-md) {
    font-size: 0.9rem;
  }
}

// Tighten gap slightly on mobile
@media (max-width: $bp-md) {
  .entry-tabs-nav {
    gap: 1.75rem;
  }
}
</style>
