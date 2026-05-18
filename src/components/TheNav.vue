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
            <a href=""><img :src="getPfp()" alt=""></a>
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
    function getDate() {
        return "MON 10.02.2026";
    }

    function getPfp() {
        return './pfp.png';
    }

    import { getView } from '../router/main.ts';
</script>