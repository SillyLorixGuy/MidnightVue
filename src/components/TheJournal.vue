<template>
    <section>
        <section class="date-section">
            <div>
                <p>DAY</p>
                <p>{{ getDay() }}</p>
            </div>
            <div>
                <p>MONTH</p>
                <p>{{ getMonth() }} </p>
            </div>
            <div>
                <p>YEAR</p>
                <p>{{ getYear() }}</p>
            </div>
        </section>


        <form class="entry-form">
            <div class="text-inputs">
                <input type="text" placeholder="Got a title?">
                <textarea name="" id="" placeholder="What happened today?"></textarea>
            </div>
            <div class="bottom-wrapper">
                <div class="mood-wrapper">
                    <h3>MOOD</h3>
                    <div class="mood-inputs">
                        <div class="button-wrapper">
                            <button id="mood-10"></button>
                            <button id="mood-20"></button>
                            <button id="mood-30"></button>
                            <button id="mood-40"></button>
                            <button id="mood-50"></button>
                            <button id="mood-60"></button>
                            <button id="mood-70"></button>
                            <button id="mood-80"></button>
                            <button id="mood-90"></button>
                            <button id="mood-100"></button>
                        </div>
                        <div>
                            <p>rough</p>
                            <p>okay</p>
                            <p>great</p>
                        </div>
                    </div>
                    <h3>{{ getMood() }}</h3>
                </div>
                <button id="submit-btn">SUBMIT</button>
            </div>
        </form>
    </section>
</template>

<style lang="scss" scoped>
section {
    display: flex;
    flex-direction: row;
    align-items: space-between;
    background-color: $color-carbon-black;
    max-width: 1080px;
    margin: 0 auto;
    padding: 12px;
    margin-top: 2rem;
    border-radius: 12px;

    & .date-section {
        display: flex;
        align-self: flex-start;
        flex-direction: column;
        min-width: 156px;
        gap: 0.5rem;
        padding: 12px;
        margin: 0;

        & div {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            border-bottom: 1px solid $color-iron-gray;

            & p {
                font-family: $ibmpm;
                width: 5rem;
                max-width: 5rem;
                font-size: $fs-small;
                color: $color-iron-gray;

                &:nth-child(2) {
                    padding-bottom: 4px;
                }
            }
        }
    }

    .entry-form {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: $color-shadow-gray;
        padding: 12px;
        gap: 12px;
        border-radius: 6px;
        width: 100%;

        & .text-inputs {
            display: flex;
            flex-direction: column;
            gap: 8px;

            & input {
                font-family: $ibmpm;
                font-size: $fs-small;
                padding: 0 0 6px 6px;
                border: none;
                background: none;
                border-bottom: 1px solid $color-iron-gray;

                &::placeholder {
                    color: $color-text;
                }
                :focus {
                    outline: none;
                }
            }

            & textarea {
                font-family: $ibmpm;
                font-size: $fs-small;
                padding: 0 6px;
                border: none;
                resize: none;
                min-height: 360px;
                background: none;

                 &::placeholder {
                    color: $color-text;
                }
                :focus {
                    outline: none;
                }
                :-moz-focusring {
                    color: transparent;
                }
            }
        }

        .bottom-wrapper {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 2px solid $color-text;

            & .mood-wrapper {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 6px;

                & h3 {
                    font-family: $ibmpm;
                    font-size: $fs-small;
                    color: $color-text;
                    text-shadow: $glow-50-white;
                    font-weight: 500;
                }

                & .mood-inputs {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 0 12px;

                    & div {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;

                        & p {
                            font-family: $ibmpm;
                            font-size: $fs-small;
                            color: $color-iron-gray;
                        }
                    }


                    & .button-wrapper {
                        display: flex;
                        flex-direction: row;
                        gap: 6px;

                        & button {
                            width: 30px;
                            height: 5px;
                            border: none;
                            cursor: pointer;
                            background-color: $color-iron-gray;
                            transition: ease-in-out 0.3s;

                            &:hover {
                                background-color: $color-text;
                            }
                        }
                    }


                }
            }

            & #submit-btn {
                font-family: $ibmpm;
                font-size: $fs-small;
                color: $color-text;
                text-shadow: $glow-50-white;
                font-weight: 400;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                background-color: $color-shadow-gray-2;
                padding: 6px 12px;
                transition: ease-in-out 0.3s;
                border: none;

                &:hover {
                    background-color: $color-gunmetal;
                    text-shadow: none;
                }
        }
    }
}
}
</style>

<script setup lang="ts">
function getDay() {
    return "10";
}

function getMonth() {
    return "02";
}

function getYear() {
    return "2026";
}

function getMood() {
    return "70";
}

</script>