<template>
    <section>
        <h1>Midnight</h1>
        <nav>
            <ul>
                <li><RouterLink to="/journal" class="nav-link">JOURNAL</RouterLink></li>
                <li><RouterLink to="/entries" class="nav-link">ENTRIES</RouterLink></li>
                <li><span class="nav-link is-disabled" aria-disabled="true">STATS</span></li>
            </ul>
        </nav>
        <section>
            <p>{{ today }}</p>
            <div class="profile-dropdown" @blur="open = false" tabindex="0">
                <button class="profile-button" @click="open = !open" aria-haspopup="true" :aria-expanded="open">
                    <img :src="pfpSrc" alt="">
                </button>
                <ul v-if="open" class="profile-menu" role="menu">
                    <template v-if="isAuthenticated">
                        <li class="profile-menu__user">{{ user?.email ?? 'Signed in' }}</li>
                        <li><RouterLink to="/profile" @click="open = false">View profile</RouterLink></li>
                        <li><RouterLink to="/profile/edit" @click="open = false">Edit profile</RouterLink></li>
                        <li><span class="profile-menu__disabled" aria-disabled="true" title="Coming soon">Settings</span></li>
                        <li><button @click="doSignOut">Sign out</button></li>
                    </template>
                    <template v-else>
                        <li><RouterLink to="/login" @click="open = false">Log in</RouterLink></li>
                        <li><RouterLink to="/signup" @click="open = false">Create account</RouterLink></li>
                    </template>
                </ul>
            </div>
        </section>
    </section>
</template>

<style lang="scss" scoped>

    section:first-child {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 6px 24px;
        max-width: 1280px;
        align-self: center;
        height: 3.75rem;
        background-color: $color-carbon-black;
        gap: 1rem;
        user-select: none;

        @media (max-width: $bp-md) {
            padding: 6px 16px;
        }

        @media (max-width: $bp-sm) {
            padding: 6px 12px;
            gap: 0.5rem;
        }

        & h1 {
            font-family: 'Oxanium', cursive;
            font-size: $fs-h1;
            color: $color-text;
            text-shadow: $glow-50-white;
            font-weight: 500;
        }
        & nav {
            & ul {
                display: flex;
                flex-direction: row;
                gap: 1.5rem;
                list-style-type: none;

                @media (max-width: $bp-sm) {
                    gap: 0.75rem;
                }

                & li {
                    & .nav-link {
                        font-family: $ibmpm;
                        font-size: $fs-small;
                        color: $color-text;
                        transition: ease-in-out 0.3s;
                        opacity: 0.7;
                        border: none;
                        cursor: pointer;
                        background-color: transparent;
                        text-shadow: $glow-25-white;
                        text-decoration: none;
                        display: inline-block;

                        &:hover {
                            text-shadow: $glow-50-white;
                            opacity: 1;
                        }

                        &.router-link-active {
                            opacity: 1;
                            text-shadow: $glow-50-white;
                        }

                        &.is-disabled {
                            opacity: 0.4;
                            pointer-events: none;
                            cursor: default;
                        }
                    }
                }
            }
        }
        & section{
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1.5rem;

            & p {
                font-family: $ibmpm;
                font-size: $fs-small;
                color: $color-text;
                opacity: 0.7;
                text-shadow: $glow-25-white;

                @media (max-width: $bp-md) {
                    display: none;
                }
            }
            & .profile-dropdown {
                position: relative;
                outline: none;

                & .profile-button {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    line-height: 0;

                    & img {
                        width: 2.2rem;
                        height: 2.2rem;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 2px solid $color-text;
                        box-shadow: $glow-25-white;
                        transition: box-shadow 0.25s ease-in-out;
                    }

                    &:hover img {
                        box-shadow: $glow-50-white;
                    }
                }

                & .profile-menu {
                    position: absolute;
                    top: calc(100% + 0.75rem);
                    right: 0;
                    min-width: 14rem;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                    background: $color-shadow-gray-2;
                    border: 1px solid $color-iron-gray;
                    border-radius: 4px;
                    box-shadow:
                        0 8px 24px rgba(0, 0, 0, 0.55),
                        0 0 0.5em rgba(255, 255, 255, 0.06);
                    font-family: $ibmpm;
                    font-size: $fs-small;
                    z-index: 20;
                    overflow: hidden;
                    animation: profile-menu-in 140ms ease-out;

                    // Tiny notch pointing up to the avatar
                    &::before {
                        content: "";
                        position: absolute;
                        top: -5px;
                        right: 0.9rem;
                        width: 8px;
                        height: 8px;
                        background: $color-shadow-gray-2;
                        border-top: 1px solid $color-iron-gray;
                        border-left: 1px solid $color-iron-gray;
                        transform: rotate(45deg);
                    }

                    & li {
                        margin: 0;
                        padding: 0;
                        list-style: none;
                    }

                    &__user {
                        padding: 0.6rem 0.85rem;
                        color: $color-iron-gray;
                        background: $color-carbon-black;
                        border-bottom: 1px solid $color-iron-gray;
                        letter-spacing: 0.02em;
                        word-break: break-all;
                        font-size: 0.72rem;
                        cursor: default;
                        user-select: text;

                        &::before {
                            content: "[ ";
                            opacity: 0.55;
                        }
                        &::after {
                            content: " ]";
                            opacity: 0.55;
                        }
                    }

                    &__disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                        pointer-events: none;

                        &::before { color: $color-iron-gray; }
                        &:hover, &:focus-visible {
                            opacity: 0.4;
                            text-shadow: none;
                            &::before { color: $color-iron-gray; transform: none; }
                        }
                    }

                    & button,
                    & a,
                    & .profile-menu__disabled {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        width: 100%;
                        padding: 0.55rem 0.85rem;
                        background: none;
                        border: none;
                        border-radius: 0;
                        text-align: left;
                        text-decoration: none;
                        font-family: $ibmpm;
                        font-size: $fs-small;
                        color: $color-text;
                        opacity: 0.7;
                        cursor: pointer;
                        text-shadow: none;
                        transition: opacity 120ms ease, text-shadow 120ms ease;

                        &::before {
                            content: "›";
                            display: inline-block;
                            width: 0.7rem;
                            color: $color-iron-gray;
                            transition: transform 140ms ease, color 140ms ease;
                        }

                        &:hover,
                        &:focus-visible {
                            opacity: 1;
                            text-shadow: $glow-25-white;
                            outline: none;

                            &::before {
                                color: $color-text;
                                transform: translateX(2px);
                            }
                        }
                    }
                }
            }
        }
    }

    @keyframes profile-menu-in {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuth } from '@/composables/useAuth'
    import { useProfile } from '@/composables/useProfile'

    const open = ref(false)
    const router = useRouter()
    const { isAuthenticated, user, signOut } = useAuth()
    const { getMyProfile } = useProfile()

    const avatarUrl = ref<string | null>(null)
    const pfpSrc = computed(() => avatarUrl.value ?? './pfp.png')

    watch(user, async (u) => {
        if (!u) {
            avatarUrl.value = null
            return
        }
        const { data } = await getMyProfile()
        avatarUrl.value = data?.avatar_url ?? null
    }, { immediate: true })

    async function doSignOut() {
        await signOut()
        open.value = false
        router.push('/login')
    }

    const today = computed(() => {
        const d = new Date()
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = String(d.getFullYear())
        return `${weekday} ${day}.${month}.${year}`
    })

</script>