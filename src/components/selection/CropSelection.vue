<template>
    <transition name="fade">
        <div
            v-if="items.length > 0"
            class="cg-selection"
        >
            <div
                class="cg-selection-text"
                :class="selectionTextClass"
            >
                <small v-text="selectionText" />
            </div>
            <div class="cg-selection-row">
                <selection-roll
                    :items="items"
                    :current-view-id="currentViewId"
                    :highest-order="highestOrder"
                    :labels="labels"
                    :id-base="idBase"
                    @set-view="$emit('set-view', $event)"
                    @update-items="$emit('update-items', $event)"
                    @thumbnail-error="$emit('thumbnail-error', $event)"
                />

                <selection-button
                    v-if="items.length < itemsLimit"
                    :label="labels.add"
                    @clicked="$emit('choose-file')"
                />
            </div>
        </div>
    </transition>
</template>

<script>
import SelectionRoll from './CropSelectionRoll.vue';
import SelectionButton from './CropSelectionButton.vue';

export default {
    components: {
        SelectionRoll,
        SelectionButton,
    },
    props: {
        selectionText: {
            type: String,
            required: true,
        },
        selectionTextClass: {
            type: String,
        },
        items: {
            type: Array,
            required: true,
        },
        itemsLimit: {
            type: Number,
            required: true,
        },
        currentViewId: {
            type: Number,
            required: true,
        },
        highestOrder: {
            type: Number,
            required: true,
        },
        labels: {
            type: Object,
            required: true,
        },
        idBase: {
            type: String,
            required: true,
        },
    },
    emits: ['set-view', 'update-items', 'thumbnail-error', 'choose-file'],
};
</script>

<style scoped>
.fade {
    backface-visibility: hidden;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 1s;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
.cg-selection-text {
    text-transform: uppercase;
    padding: 0 .5rem;
    margin: .25rem 0;
    letter-spacing: 0.5px;
    color: #052D49;
}
.cg-selection-row {
    display: flex;
}
</style>
