"use strict"

const BEDROCK_TEXTURES = {
	"top": [
		"textures/b4.png"
	]
};
class Bedrock extends Block {
	createTexture(type) {
		const texture = BEDROCK_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Bedrock = Bedrock;

const COBBLESTONE_TEXTURES = {
	"top": [
		"textures/b2-1.png"
	]
};
class CobbleStone extends Block {
	createTexture(type) {
		const texture = COBBLESTONE_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.CobbleStone = CobbleStone;

const DIRT_TEXTURES = {
	"top": [
		"textures/b1-3.png"
	]
};
class Dirt extends Block {
	createTexture(type) {
		const texture = DIRT_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Dirt = Dirt;

const GRASS_TEXTURES = {
	"top": [
		"textures/b1-2-1.png"
	],
	"side": [
		"textures/b1-1.png"
	],
	"bottom": [
		"textures/b1-3.png"
	]
};
class Grass extends Block {
	createTexture(type) {
		if (type === "top") {
			const texture = GRASS_TEXTURES.top.random();

			return `url(${texture})`;
		}
		else if (type === "bottom") {
			const texture = GRASS_TEXTURES.bottom.random();

			return `url(${texture})`;
		}
		const texture = GRASS_TEXTURES.side.random();
		return `url(${texture})`;
	}
}
Block.Grass = Grass;

const IRONORE_TEXTURES = {
	"top": [
		"textures/b6.png"
	]
};
class IronOre extends Block {
	createTexture(type) {
		const texture = IRONORE_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.IronOre = IronOre;

const LEAF_TEXTURES = {
	"top": [
		"textures/b3-3-1.png"
	]
};
class Leaf extends Block {
	createTexture(type) {
		const texture = LEAF_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Leaf = Leaf;

const LOG_TEXTURES = {
	"top": [
		"textures/b3-2.png"
	],
	"side": [
		"textures/b3-1.png"
	]
};

class Log extends Block {
	createTexture(type) {
		if (type === "top" || type === "bottom") {
			const texture = LOG_TEXTURES.top.random();
			return `url(${texture})`;
		}
		const texture = LOG_TEXTURES.side.random();
		return `url(${texture})`;
	}
}
Block.Log = Log;

const STONE_TEXTURES = {
	"top": [
		"textures/b5.png"
	]
};
class Stone extends Block {
	createTexture(type) {
		const texture = STONE_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Stone = Stone;

const SAND_TEXTURES = {
	"top": [
		"textures/b7-1.png"
	]
};
class Sand extends Block {
	createTexture(type) {
		const texture = SAND_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Sand = Sand;

const SANDSTONE_TEXTURES = {
	"top": [
		"textures/b7-2-1.png"
	],
	"side": [
		"textures/b7-2-2.png"
	],
	"bottom": [
		"textures/b7-2-3.png"
	]
};
class SandStone extends Block {
	createTexture(type) {
		if (type === "top") {
			const texture = SANDSTONE_TEXTURES.top.random();

			return `url(${texture})`;
		}
		else if (type === "bottom") {
			const texture = SANDSTONE_TEXTURES.bottom.random();

			return `url(${texture})`;
		}
		const texture = SANDSTONE_TEXTURES.side.random();
		return `url(${texture})`;
	}
}
Block.SandStone = SandStone;

const WOOD_TEXTURES = {
	"top": [
		"textures/b3-4.png"
	]
};
class Wood extends Block {
	createTexture(type) {
		const texture = WOOD_TEXTURES.top.random();
		return `url(${texture})`;
	}
}
Block.Wood = Wood;