<template>
    <transition-group
        name="fade04"
        tag="div"
        leave-active-class=""
        class="roll-elements"
    >
        <div
            v-for="(item, index) in items"
            :key="'cropa'+index"
            class="roll-element"
        >
            <roll-element
                :index="index"
                :item="item"
                :selected="currentViewId"
                @toggle="toggleOrder($event)"
                @set-view="setView($event)"
                @thumbnail-error="$emit('thumbnail-error', $event)"
            />
        </div>
    </transition-group>
</template>
<script>
import RollElement from './CropSelectionRollElement.vue';
import deepClone from '../../lib/deepClone';

export default {
    components: { RollElement },
    props: {
        items: {
            type: Array,
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
    },
    emits: ['update-items', 'set-view', 'thumbnail-error'],
    methods: {
        /**
         * Unset the picture or set it.
         *
         * @param  {integer} index [important for this.items]
         */
        toggleOrder(index) {
            const list = deepClone(this.items);
            const oldOrder = list[index].order;

            if (list[index].order === 0) {
                list[index].order = this.highestOrder + 1;
            } else {
                list[index].order = 0;

                list.forEach((item, listIndex) => {
                    if (item.order > 0) {
                        if (item.order > oldOrder) {
                            list[listIndex].order -= 1;
                        }
                    }
                });
            }

            this.$emit('update-items', list);
        },
        setView(id) {
            this.$emit('set-view', id);
        },
    },
};
</script>
<style scoped>
.roll-elements {
    display: flex;
}

.roll-element {
    width: 60px;
    height: 60px;
    margin: 1px;
    position: relative;
    user-select: none;
}

.roll-element:hover {
    cursor: pointer;
}

.fade04 {
    backface-visibility: hidden;
}
.fade04-enter-active, .fade04-leave-active {
    transition: opacity 0.4s;
}
.fade04-enter-from, .fade04-leave-to {
    opacity: 0;
}
</style>
