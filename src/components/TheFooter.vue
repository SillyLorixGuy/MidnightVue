<template>
    <footer>
        <section id="footer-upper">
            <article class="footer-text">
                <h1>Project Midnight</h1>
                <p>Times are rough now days... everyone needs to vent a little from time to time.</p>
            </article>
            <div class="socials-wrapper">
                <h2>My Socials:</h2>
                <a class="social-wrapper" href="https://www.instagram.com/mr.lorix/" target="_blank" rel="noopener noreferrer">
                    <i class="fa-brands fa-instagram"></i>
                    <p>mr.lorix</p>
                </a>
                <div class="social-wrapper">
                    <i class="fa-brands fa-discord"></i>
                    <p>.lorix</p>
                </div>
            </div>
        </section>
        <section id="footer-lower">
            <p>&copy; 2026 lorix. All rights reserved.</p>
        </section>
    </footer>
</template>

<style lang="scss" scoped>
    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: $color-carbon-black;
        min-height: 200px;
        width: 100%;
        padding: 2.5rem 0 0;

        @media (max-width: $bp-md) {
            padding: 2rem 0 0;
        }

        & #footer-upper{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 75%;
            max-width: 1280px;
            gap: 2rem;

            @media (max-width: $bp-md) {
                flex-direction: column;
                width: 90%;
                gap: 1.5rem;
            }

            & article {
                display: flex;
                flex-direction: column;

                & h1 {
                    font-family: 'Oxanium', cursive;
                    font-size: $fs-h1;
                    color: $color-text;
                    text-shadow: $glow-50-white;
                    font-weight: 500;
                }
                & p {
                    font-family: $ibmpm;
                    font-size: $fs-p;
                    color: $color-text;
                    text-shadow: $glow-25-white;
                }
            }

            & .socials-wrapper {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;

                & h2 {
                    font-family: $oxanium;
                    font-size: $fs-h2;
                    color: $color-text;
                    text-shadow: $glow-50-white;
                    font-weight: 500;
                }

                & .social-wrapper {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 6px;
                    text-decoration: none;

                    & .fa-instagram {
                            scale: 1.4;
                            margin-left: 4px;
                        }

                    & i {
                        width: 20px;
                        height: 20px;
                        font-size: 20px;
                        color: $color-text;
                        text-shadow: $glow-25-white;
                    }
                    & p {
                        font-family: $ibmpm;
                        font-size: $fs-small;
                        color: $color-text;
                        text-shadow: $glow-25-white;
                    }
                }
             }
        }

        & #footer-lower {
            margin-top: 1rem;
            padding-bottom: 0.75rem;
            border-top: 1px solid $color-iron-gray;
            width: 75%;
            display: flex;
            justify-content: center;
            padding-top: 0.75rem;

            & p {
                font-family: $ibmpm;
                font-size: $fs-small;
                color: lighten($color-iron-gray, 20%);
                text-shadow: $glow-25-gray;
            }
        }
    }
</style>