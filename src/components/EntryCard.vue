<template>
  <article class="entry-card">
    <!-- Header -->
    <div class="entry-card__header">
      <!-- Left: avatar + username -->
      <div class="entry-card__author">
        <div class="entry-card__avatar">
          <img
            v-if="entry.author.avatar_url"
            :src="entry.author.avatar_url"
            :alt="entry.author.username"
            class="entry-card__avatar-img"
          />
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span class="entry-card__username">{{ entry.author.username }}</span>
      </div>

      <!-- Center: title -->
      <h2 class="entry-card__title">{{ entry.title }}</h2>

      <!-- Right: date + time -->
      <div class="entry-card__meta">
        <span class="entry-card__date">{{ formattedDate }}</span>
        <span class="entry-card__time">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="entry-card__body">
      <p class="entry-card__content">{{ entry.content }}</p>
    </div>

    <!-- Footer -->
    <footer class="entry-card__footer">
      <!-- Left: reveal toggle -->
      <button
        class="entry-card__icon-btn"
        data-testid="reveal-toggle"
        :aria-label="revealed ? 'Hide share code' : 'Show share code'"
        :aria-pressed="revealed"
        @click="revealed = !revealed"
      >
        <!-- Eye-off icon (shown when hidden) -->
        <svg
          v-if="!revealed"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <!-- Eye icon (shown when revealed) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <!-- Center: share code -->
      <p
        class="entry-card__share-code"
        :class="{ 'is-blurred': !revealed }"
        data-testid="share-code"
        aria-live="polite"
      >{{ entry.share_code }}</p>

      <!-- Right: anchor/bookmark toggle -->
      <button
        class="entry-card__icon-btn"
        data-testid="anchor-toggle"
        :aria-label="isAnchored ? 'Remove bookmark' : 'Bookmark entry'"
        :aria-pressed="isAnchored"
        @click="$emit('toggle-anchor', entry.id)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          :fill="isAnchored ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  entry: {
    id: string
    title: string
    content: string
    created_at: string
    share_code: string
    author: { username: string; avatar_url: string | null }
  }
  isAnchored: boolean
}>()

defineEmits<{
  'toggle-anchor': [entryId: string]
}>()

const revealed = ref(false)

const formattedDate = computed(() => {
  const d = new Date(props.entry.created_at)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
})

const formattedTime = computed(() => {
  const d = new Date(props.entry.created_at)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
})
</script>

<style lang="scss" scoped>
.entry-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: $color-shadow-gray-2;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;

  // ── Header ─────────────────────────────────────────────────────────────
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    width: 100%;
    gap: 8px;
  }

  // ── Author (left group) ─────────────────────────────────────────────────
  &__author {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 7px;
    flex: 0 0 115px;
    min-width: 0;
  }

  &__avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 24px;
    background: $color-iron-gray;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text;
    overflow: hidden;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: $glow-25-white;
    }
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &__username {
    font-family: $ibmpm;
    font-weight: 600;
    font-size: 20px;
    color: $color-text;
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.35);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // ── Title (center) ──────────────────────────────────────────────────────
  &__title {
    flex: 1 1 auto;
    font-family: $oxanium;
    font-weight: 500;
    font-size: 24px;
    color: $color-text;
    text-shadow: 0 0 3.5px white;
    text-align: center;
    min-width: 0;
    word-break: break-word;
  }

  // ── Meta (right group) ──────────────────────────────────────────────────
  &__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    padding: 5px 0;
    flex: 0 0 115px;
    min-width: 0;
  }

  &__date,
  &__time {
    font-family: $ibmpm;
    font-weight: 400;
    font-size: 16px;
    color: $color-text;
    white-space: nowrap;
  }

  &__date {
    text-shadow: 0 0 2.5px rgba(255, 255, 255, 0.35);
  }

  &__time {
    text-shadow: 0 0 4px rgba(242, 242, 242, 0.35);
  }

  // ── Body ────────────────────────────────────────────────────────────────
  &__body {
    background: $color-gunmetal;
    padding: 10px;
    border-radius: 5px;
    width: 100%;
  }

  &__content {
    font-family: $ibmpm;
    font-weight: 400;
    font-size: 16px;
    color: $color-text;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  &__footer {
    background: $color-iron-gray;
    height: 24px;
    border-radius: 5px;
    padding: 0 5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  // ── Share code ──────────────────────────────────────────────────────────
  &__share-code {
    font-family: $ibmpm;
    font-weight: 400;
    font-size: 12px;
    color: $color-text;
    transition: filter 0.25s ease;
    text-align: center;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 6px;

    &.is-blurred {
      filter: blur(2px);
      user-select: none;
    }
  }

  // ── Icon buttons ────────────────────────────────────────────────────────
  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: $color-text;
    user-select: none;
    border-radius: 3px;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      color 0.15s ease;

    &:hover {
      opacity: 0.85;
      transform: scale(1.12);
    }

    &:active {
      transform: scale(0.94);
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 1px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }

    svg {
      pointer-events: none;
    }
  }

  // ── Responsive: below $bp-md ────────────────────────────────────────────
  @media (max-width: $bp-md) {
    &__header {
      flex-wrap: wrap;
      row-gap: 6px;
    }

    // Author and meta share the top row; title drops to its own row
    &__author {
      flex: 1 1 auto;
    }

    &__title {
      order: 3;
      flex: 0 0 100%;
      font-size: 20px;
    }

    &__meta {
      flex: 0 0 auto;
    }
  }

  @media (max-width: $bp-sm) {
    &__username {
      font-size: 16px;
    }

    &__date,
    &__time {
      font-size: 13px;
    }
  }
}
</style>
