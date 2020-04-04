<template>
    <div>
        <img
            :src="item.thumbnail"
            :class="[index === selected ? 'active': '']"
            @click="$emit('setView', index)"
            @error="$emit('thumbnailError', index)"
        >
        <div
            class="roll-element-order"
            @click.prevent.stop="$emit('toggle', index)"
        >
            <span class="reo-wrapper">
                <span
                    class="reo-circle"
                    :class="item.order > 0 ? 'clicked' : 'unclicked'"
                />
                <span
                    class="reo-number"
                    v-text="item.order > 0 ? item.order : ''"
                />
            </span>
        </div>
    </div>
</template>
<script>
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
    },
};
</script>
<style lang="scss" scoped>

$imgSize: 60px;

	img{
	    position:relative;
	    transition:all .2s linear;
	    object-fit: cover;
	    width: $imgSize;
	    height: $imgSize;
	    display:block;
	    user-select: none;
        max-width: 100%;

	    &:hover{
	    	opacity: 0.6;
	    }
	}
	.active{
		opacity: 0.6;
	}


	.roll-element-order{
		position: absolute;
		top: 0px;
		right: 2px;
		z-index: 2;
		color: white;
	}

    .reo-wrapper{
        position: relative;
        display: inline-block;
        height: 1em;
        position: relative;
        text-align: center;
        vertical-align: -.125em;
        width: 1.25em;
    }

    .reo-circle{
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

        &.clicked{
            background: #67ACFD;
        }
        &.unclicked{
            background: rgba(255, 255, 255, 0.3);
        }
    }

    .reo-number{
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
