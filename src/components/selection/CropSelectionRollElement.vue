<template>
    <div>
        <button
            type="button"
            class="roll-element-view"
            :aria-current="index === selected ? 'true' : undefined"
            @click="$emit('set-view', index)"
        >
            <img
                :src="item.thumbnail"
                :alt="withIndex(labels.image, index)"
                :class="[index === selected ? 'active': '']"
                @error="$emit('thumbnail-error', index)"
            >
        </button>
        <button
            type="button"
            class="roll-element-order"
            :aria-label="withIndex(labels.choose, index)"
            :aria-pressed="item.order > 0 ? 'true' : 'false'"
            :aria-describedby="item.order > 0 ? orderId : undefined"
            @click.prevent.stop="$emit('toggle', index)"
        >
            <span
                class="reo-wrapper"
                aria-hidden="true"
            >
                <span
                    class="reo-circle"
                    :class="item.order > 0 ? 'clicked' : 'unclicked'"
                />
                <span
                    class="reo-number"
                    v-text="item.order > 0 ? item.order : ''"
                />
            </span>
        </button>
        <span
            v-if="item.order > 0"
            :id="orderId"
            class="cg-visually-hidden"
            v-text="withOrder(labels.position, item.order)"
        />
    </div>
</template>
<script>
import { withIndex, withOrder } from '../../core/labels';

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        selected: {
            type: Number,
            required: true,
        },
        labels: {
            type: Object,
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
    },
    emits: ['set-view', 'thumbnail-error', 'toggle'],
    methods: {
        withIndex,
        withOrder,
    },
};
</script>
<style scoped>
/* Only for screen readers */
.cg-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* The buttons look like the image and the circle of 1.x */
.roll-element-view,
.roll-element-order {
    padding: 0;
    border: 0;
    margin: 0;
    background: none;
    font: inherit;
    line-height: inherit;
    text-align: inherit;
    cursor: pointer;
}
.roll-element-view {
    display: block;
    width: 60px;
    height: 60px;
}

img {
    position: relative;
    transition: all .2s linear;
    object-fit: cover;
    width: 60px;
    height: 60px;
    display: block;
    user-select: none;
    max-width: 100%;
}
img:hover {
    opacity: 0.6;
}
.active {
    opacity: 0.6;
}

.roll-element-order {
    display: block;
    position: absolute;
    top: 0px;
    right: 2px;
    z-index: 2;
    color: white;
}

.reo-wrapper {
    position: relative;
    display: inline-block;
    height: 1em;
    text-align: center;
    vertical-align: -.125em;
    width: 1.25em;
}

.reo-circle {
    display: inline-block;
    width: 1em;
    height: 1em;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    font-size: inherit;
    overflow: visible;
    vertical-align: -.125em;
    border-radius: 50%;
    border: 1px solid #fff;
}
.reo-circle.clicked {
    background: #67ACFD;
}
.reo-circle.unclicked {
    background: rgba(255, 255, 255, 0.3);
}

.reo-number {
    font-family: Arial, Helvetica, sans-serif;
    display: inline-block;
    position: absolute;
    text-align: center;
    transform-origin: center center;
    left: 50%;
    top: 50%;
    transform: translate(calc(-50% + 0em), calc(-50% + 0em)) scale(0.5, 0.5) rotate(0deg);
    font-weight: 500;
}
</style>
