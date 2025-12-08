"use strict"

class Block {
	constructor(x, y, z, tag) {
		this.x = x;
		this.y = y;
		this.z = z;

		this.build(tag);
	}

	build(tag) {
		const size = 16;
		const x = this.x * 16;
		const y = this.y * 16;
		const z = this.z * 16;

		const block = this.block = $(`<div class="block ${tag}" loading="lazy" />`)
			.css({
				transform: `
					translateX(${x}px)
					translateY(${y}px)
					translateZ(${z}px)
					scale(0.99)
				`
			});

		$(`<div class="x-axis" />`)
			.appendTo(block)
			.css({
				transform: `
					rotateX(90deg)
					rotateY(0deg)
					rotateZ(0deg)

				`
			});

		$(`<div class="y-axis" />`)
			.appendTo(block)
			.css({
				transform: `
					rotateX(0deg)
					rotateY(90deg)
					rotateZ(0deg)
				`
			});

		$(`<div class="z-axis" />`)
			.appendTo(block);

		this
			.createFace("top", 0, 0, size / 2, 0, 0, 0, x, y, z)
			.appendTo(block);

		this
			.createFace("side-1", 0, size / 2, 0, 270, 0, 0, x, y, z)
			.appendTo(block);

		this
			.createFace("side-2", size / 2, 0, 0, 0, 90, 270, x, y, z)
			.appendTo(block);

		this
			.createFace("side-3", 0, size / -2, 0, -270, 0, 180, x, y, z)
			.appendTo(block);

		this
			.createFace("side-4", size / -2, 0, 0, 0, -90, 90, x, y, z)
			.appendTo(block);

		this
			.createFace("bottom", 0, 0, size / -2, 0, 180, 0, x, y, z)
			.appendTo(block);
	}

	createFace(type, x, y, z, rx, ry, rz, oldX, oldY, oldZ) {
		return $(`<div class="side side-${type}" id="trans_${oldX/16+x/16}_${oldY/16+y/16}_${oldZ/16+z/16}_${type}" />`)
			.css({
				transform: `
					translateX(${x}px)
					translateY(${y}px)
					translateZ(${z}px)
					rotateX(${rx}deg)
					rotateY(${ry}deg)
					rotateZ(${rz}deg)
				`,
				background: this.createTexture(type),
				'background-repeat': 'no-repeat',
				'background-size': 'contain'
			})
			.data("block", this)
			.data("type", type);
	}

	createTexture(type) {
		return `rgba(100, 100, 255, 0.2)`;
	}
}
