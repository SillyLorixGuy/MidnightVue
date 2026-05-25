<template>
    <section>
        <section class="date-section">
            <div>
                <p>DAY</p>
                <p>{{ today.day }}</p>
            </div>
            <div>
                <p>MONTH</p>
                <p>{{ today.month }} </p>
            </div>
            <div>
                <p>YEAR</p>
                <p>{{ today.year }}</p>
            </div>
        </section>


        <form class="entry-form">
            <div class="text-inputs">
                <input type="text" placeholder="Got a title?" v-model="title">
                <textarea name="" id="" placeholder="What happened today?" v-model="content"></textarea>
            </div>
            <div class="bottom-wrapper">
                <div class="mood-wrapper">
                    <h3>MOOD</h3>
                    <div class="mood-inputs">
                        <div class="button-wrapper" @mouseleave="hoveredMood = 0">
                            <button 
                                v-for="value in [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
                                :key="value"
                                type="button"
                                :class="{ active: value <= (hoveredMood > 0 ? hoveredMood : selectedMood) }"
                                @mouseover="hoveredMood = value"
                                @click="handleMoodClick(value)"
                                @dblclick="handleMoodDblClick(value)"
                            ></button>
                        </div>
                        <div>
                            <p :class="{ active: selectedMood > 0 && selectedMood <= 30 }">rough</p>
                            <p :class="{ active: selectedMood > 30 && selectedMood <= 70 }">okay</p>
                            <p :class="{ active: selectedMood > 70 }">great</p>
                        </div>
                    </div>
                    <h3>{{ getMood() || "00"}}</h3>
                </div>
                <p
                    v-if="submitStatus"
                    class="submit-status"
                    :class="`submit-status--${submitStatus.kind}`"
                >{{ submitStatus.text }}</p>
                <button id="submit-btn" type="button" @click="onSubmit" :disabled="submitting">SUBMIT</button>
            </div>
        </form>
    </section>
</template>

<style lang="scss" scoped>
section {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    background-color: $color-carbon-black;
    max-width: 1080px;
    margin: 0 auto;
    width: 95%;
    padding: 12px;
    margin-top: 2rem;
    border-radius: 12px;

    @media (max-width: $bp-md) {
        flex-direction: column;
        margin: 1rem;
        margin-top: 1rem;
    }

    & .date-section {
        display: flex;
        align-self: flex-start;
        flex-direction: column;
        min-width: 156px;
        max-width: 200px;
        gap: 0.5rem;
        padding: 12px;
        margin: 0;
        user-select: none;

        @media (max-width: $bp-md) {
            flex-direction: row;
            align-self: stretch;
            justify-content: space-between;
            min-width: 0;
            width: 100%;
            gap: 0.75rem;
            padding: 6px 12px;
        }

        & div {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            border-bottom: 1px solid $color-iron-gray;

            @media (max-width: $bp-md) {
                flex: 1;
            }

            & p {
                font-family: $ibmpm;
                width: 5rem;
                max-width: 5rem;
                font-size: $fs-small;
                color: $color-iron-gray;

                &:nth-child(2) {
                    padding-bottom: 4px;
                }

                @media (max-width: $bp-md) {
                    width: auto;
                    max-width: none;
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
                color: $color-text;

                &::placeholder {
                    color: $color-text;
                }
                &:focus {
                    outline: none;
                    border-radius: 0;
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
                color: $color-text;

                 &::placeholder {
                    color: $color-text;
                }
                &:focus {
                    outline: none;
                    border-radius: 0;
                }

                @media (max-width: $bp-md) {
                    min-height: 240px;
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
            gap: 12px;

            @media (max-width: $bp-md) {
                flex-direction: column;
                align-items: stretch;
            }

            & .mood-wrapper {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 6px;
                flex: 1;
                min-width: 0;
                max-width: 400px;
                user-select: none;

                @media (max-width: $bp-md) {
                    padding: 0;
                    justify-content: space-between;
                    gap: 8px;
                    max-width: none;
                }

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
                    gap: 4px;
                    padding: 0 12px;
                    flex: 1;
                    min-width: 0;

                    @media (max-width: $bp-md) {
                        padding: 0 8px;
                    }

                    & div {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;

                        & p {
                            font-family: $ibmpm;
                            font-size: $fs-small;
                            color: $color-iron-gray;

                            &.active {
                                color: $color-text;
                                text-shadow: $glow-50-white;
                            }
                        }
                    }


                    & .button-wrapper {
                        display: flex;
                        flex-direction: row;
                        gap: 6px;

                        @media (max-width: $bp-lg) {
                            gap: 4px;
                        }

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

                            &.active {
                                background-color: $color-text;
                                box-shadow: $glow-50-white;
                            }

                            @media (max-width: $bp-lg) {
                                flex: 1;
                                width: auto;
                                min-width: 0;
                            }

                            @media (max-width: $bp-md) {
                                height: 14px;
                                border-radius: 2px;
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
                user-select: none;

                &:hover {
                    background-color: $color-gunmetal;
                    text-shadow: none;
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: $bp-md) {
                    padding: 10px 12px;
                }
            }

            & .submit-status {
                font-family: $ibmpm;
                font-size: $fs-small;
                margin-top: 0.5rem;

                &--error {
                    color: #ff8080;
                }

                &--success,
                &--info {
                    color: $color-text;
                    text-shadow: $glow-50-white;
                }
            }
        }
    }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEntries } from '@/composables/useEntries';
import * as pendingEntries from '@/lib/pendingEntries';

const { createEntry, countMyEntries } = useEntries();

const dbCount = ref(0);
onMounted(async () => {
  dbCount.value = await countMyEntries();
});

const selectedMood = ref<number>(0);
const hoveredMood = ref<number>(0);
const title = ref<string>('');
const content = ref<string>('');
const submitting = ref(false);
type SubmitStatus = { kind: 'error' | 'success' | 'info'; text: string } | null
const submitStatus = ref<SubmitStatus>(null);

let statusTimer: ReturnType<typeof setTimeout> | null = null;
function flashStatus(status: NonNullable<SubmitStatus>, ms = 2000) {
  submitStatus.value = status;
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { submitStatus.value = null; }, ms);
}
onUnmounted(() => { if (statusTimer) clearTimeout(statusTimer); });

const today = computed(() => {
  const d = new Date()
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
})

async function onSubmit() {
    const trimmedContent = content.value.trim();
    if (!trimmedContent) {
        submitStatus.value = { kind: 'error', text: 'Write something first.' };
        return;
    }

    submitting.value = true;
    submitStatus.value = null;

    const pendingCount = pendingEntries.count();
    const resolvedTitle = title.value.trim() || `ENTRY #${dbCount.value + pendingCount + 1}`;
    const moodValue = selectedMood.value > 0 ? selectedMood.value : null;

    const draftId = crypto.randomUUID();
    const savedLocally = pendingEntries.add({
        id: draftId,
        title: resolvedTitle,
        content: trimmedContent,
        mood: moodValue,
        drafted_at_iso: new Date().toISOString(),
    });

    const { error } = await createEntry({
        title: resolvedTitle,
        content: trimmedContent,
        mood: moodValue,
    });

    submitting.value = false;

    if (error) {
        title.value = '';
        content.value = '';
        selectedMood.value = 0;
        if (savedLocally) {
            flashStatus({ kind: 'info', text: 'Saved locally — will sync when you sign in.' });
        } else {
            submitStatus.value = { kind: 'error', text: error.message };
        }
        return;
    }

    pendingEntries.remove(draftId);
    title.value = '';
    content.value = '';
    selectedMood.value = 0;
    dbCount.value += 1;
    flashStatus({ kind: 'success', text: 'Saved' });
}

function handleMoodClick(value: number) {
    selectedMood.value = value;
}

function handleMoodDblClick(value: number) {
    if (value === selectedMood.value) {
        selectedMood.value = 0;
    }
}

function getMood() {
    return selectedMood.value === 0 ? '' : String(selectedMood.value);
}
</script>