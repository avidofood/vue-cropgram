<template>
    <transition name="fade">
        <div
            v-if="items.length > 0"
            class="cg-selection"
        >
            <div class="cg-selection-text">
                <small v-text="selectionText" />
            </div>
            <div class="cg-selection-row">
                <selection-roll
                    :items="items"
                    :current-view-id="currentViewId"
                    @setView="$emit('setView', $event)"
                    @updateItems="$emit('updateItems', $event)"
                />

                <selection-button
                    v-if="items.length < 4"
                    @clicked="$emit('chooseFile')"
                />
            </div>
        </div>
    </transition>
</template>

<script>
import SelectionRoll from './CropSelectionRoll.vue';
import SelectionButton from './CropSelectionButton.vue';

export default {
    props: {
        selectionText: {
            type: String,
            required: true,
        },
        items: {
            type: Array,
            required: true,
        },
        currentViewId: {
            type: Number,
            required: true,
        },
    },
    components: {
        SelectionRoll,
        SelectionButton,
    },
};
</script>

<style lang="scss" scoped>
.fade{
	backface-visibility: hidden;
}
.fade-enter-active, .fade-leave-active{
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to{
  opacity: 0;
}
.cg-selection-text{
    text-transform: uppercase;
    padding: 0 .5rem;
    margin: .25rem 0;
    letter-spacing: 0.5px;
    color: #052D49;
}
.cg-selection-row{
    display:flex;
}
</style>
