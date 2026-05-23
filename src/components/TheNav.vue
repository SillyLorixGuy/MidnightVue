<template>
    <section>
        <h1>Midnight</h1>
        <nav>
            <ul>
                <li><button :style="{ opacity: getView() == 'JOURNAL' ? 1 : 0.7 }">JOURNAL</button></li>
                <li><button :style="{ opacity: getView() == 'ENTRIES' ? 1 : 0.7 }">ENTRIES</button></li>
                <li><button :style="{ opacity: getView() == 'STATS' ? 1 : 0.7 }">STATS</button></li>
            </ul>
        </nav>
        <section>
            <p>{{ getDate() }}</p>
            <div class="profile-dropdown" @blur="open = false" tabindex="0">
                <button class="profile-button" @click="open = !open" aria-haspopup="true" :aria-expanded="open">
                    <img :src="getPfp()" alt="">
                </button>
                <ul v-if="open" class="profile-menu" role="menu">
                    <template v-if="isAuthenticated">
                        <li class="profile-menu__user">{{ user?.email ?? 'Signed in' }}</li>
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
                    & button {
                        font-family: $ibmpm;
                        font-size: $fs-small;
                        color: $color-text;
                        transition: ease-in-out 0.3s;
                        opacity: 0.7;
                        border: none;
                        cursor: pointer;
                        background-color: transparent;
                        text-shadow: $glow-25-white;
                        &:hover {
                            text-shadow: $glow-50-white;
                            opacity: 1;
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
            & a {
                & img {
                    width: 2.2rem;
                    height: 2.2rem;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid $color-text;
                    box-shadow: $glow-25-white;
                    transition: ease-in-out 0.3s;

                    &:hover {
                        box-shadow: $glow-50-white;
                    }
                }
            }
        }
    }
</style>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuth } from '@/composables/useAuth'
    import { getView } from '../router/main.ts'

    const open = ref(false)
    const router = useRouter()
    const { isAuthenticated, user, signOut } = useAuth()

    async function doSignOut() {
        await signOut()
        open.value = false
        router.push('/login')
    }

    function getDate() {
        return "MON 10.02.2026";
    }

    function getPfp() {
        return './pfp.png';
    }
</script>