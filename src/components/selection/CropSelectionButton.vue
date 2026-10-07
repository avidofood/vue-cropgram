<!-- eslint-disable max-len -->
<template>
    <button
        type="button"
        class="cg-btn-upload"
        :aria-label="label"
        @click="$emit('clicked')"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 661.14 532.74"
            aria-hidden="true"
            focusable="false"
        >
            <path
                style="fill:none;"
                d="M522 48H150a6 6 0 0 0-6 6v244a6 6 0 0 0 6 6h372a6 6 0 0 0 6-6V54a6 6 0 0 0-6-6zM224 72a40 40 0 1 1-40 40 40 40 0 0 1 40-40zm256 184H192v-48l39.52-39.52a12 12 0 0 1 17 0L288 208l103.48-103.52a12 12 0 0 1 17 0L480 176z"
            />
            <path d="M432 393.84a6 6 0 0 1-6 6l-372 .07a6 6 0 0 1-6-6v-244a6 6 0 0 1 6-6l10-.07v-48l-16 .07a47.91 47.91 0 0 0-48 47.93v256.07a48 48 0 0 0 48 47.93h384a48 48 0 0 0 48-48v-16h-48z" />
            <circle
                cx="223.96"
                cy="112"
                r="40"
            />
            <path d="M528 0H144a48 48 0 0 0-48 48v256a48 48 0 0 0 48 48h384a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm0 298a6 6 0 0 1-6 6H150a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h372a6 6 0 0 1 6 6z" />
            <path d="M391.48 104.48L288 208l-39.51-39.52a12 12 0 0 0-17 0L192 208v48h288v-80l-71.51-71.52a12 12 0 0 0-17.01 0zm257.66 326.26h-54v-54a12 12 0 0 0-12-12h-12a12 12 0 0 0-12 12v54h-54a12 12 0 0 0-12 12v12a12 12 0 0 0 12 12h54v54a12 12 0 0 0 12 12h12a12 12 0 0 0 12-12v-54h54a12 12 0 0 0 12-12v-12a12 12 0 0 0-12-12z" />
        </svg>
    </button>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
    },
    emits: ['clicked'],
};
</script>

<style scoped>
.cg-btn-upload {
    width: 60px;
    height: 60px;
    margin: 1px;
    position: relative;

    color: rgba(173, 181, 189, 0.8);
    border: 2px dashed #adb5bd;
    border-radius: 3px;
    font-size: 22px;
    background-color: transparent;
    font-weight: 400;
}
.cg-btn-upload:before {
    border-radius: 3px;
    width: 60px;
    height: 60px;
    border: 2px solid #adb5bd;

    content: '';
    position: absolute;
    left: -2px;
    top: -2px;
    opacity: 0;
    transition: all .5s ease, opacity .3s ease-out;
}
.cg-btn-upload:hover {
    color: #adb5bd;
    background-color: transparent;
}
.cg-btn-upload:hover:before {
    opacity: 1;
}
/* Keyboard users keep the focus ring */
.cg-btn-upload:focus:not(:focus-visible) {
    outline: 0;
    box-shadow: none;
}
.cg-btn-upload svg {
    width: 25px;
}
.cg-btn-upload svg path,
.cg-btn-upload svg circle {
    fill: #adb5bd;
}
</style>
