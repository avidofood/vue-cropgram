<template>
    <transition-group
        name="fade04"
        tag="div"
        leave-active-class=""
        class="roll-elements"
    >
        <div
            v-for="(item, index) in items"
            :ref="'cropa'+index"
            :key="'cropa'+index"
            class="roll-element"
        >
            <roll-element
                :index="index"
                :item="item"
                :selected="currentViewId"
                @toggle="toggleOrder($event)"
                @setView="setView($event)"
                @thumbnailError="$emit('thumbnailError', $event)"
            />
        </div>
    </transition-group>
</template>
<script>
import RollElement from './CropSelectionRollElement.vue';
import deepClone from '../../lib/deepClone';

export default {
    props: {
        items: {
            type: Array,
            required: true,
        },
        currentViewId: {
            type: Number,
            required: true,
        },
        highestOrder: {
            type: Number,
            required: true,
        },
    },
    components: { RollElement },
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

            this.$emit('updateItems', list);
        },
        setView(id) {
            this.$emit('setView', id);
        },
    },
};
</script>
<style lang="scss" scoped>

$imgSize: 60px;

.roll-elements{
    display: flex;
}

.roll-element{
    width: $imgSize;
    height: $imgSize;
    margin: 1px;
    position:relative;
    user-select: none;

	&:hover{
		cursor: pointer;
	}
}

.fade04{
	backface-visibility: hidden;
}
.fade04-enter-active, .fade04-leave-active{
  transition: opacity 0.4s;
}
.fade04-enter, .fade04-leave-to{
  opacity: 0;
}

</style>
