import { createMemo, createSignal, For, onCleanup, onMount, Show, type Accessor, type JSX } from "solid-js";
import { isServer } from "solid-js/web";
import type { Skill } from "../types/skill";
import { skillIcons } from "./SkillIcons";

interface SkillsAccordionProps {
	skills: Skill[];
}

export default function SkillsAccordion(props: SkillsAccordionProps): JSX.Element {
	const [openPath, setOpenPath] = createSignal<string[]>([]);
	const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

	const toggleSkill = (skill: Skill, level: number) => {
		const currentPath = openPath();
		const isOpening = currentPath[level] !== skill.name;

		if (isOpening) {
			setOpenPath([...currentPath.slice(0, level), skill.name]);
		} else {
			setOpenPath(currentPath.slice(0, level));
		}
	};

	return (
		<div ref={setContainerRef} class="flex flex-col gap-4">
			<SkillLevel
				skills={props.skills}
				level={0}
				openPath={openPath()}
				onToggle={toggleSkill}
				containerRef={containerRef()}
			/>
		</div>
	);
}

interface SkillLevelProps {
	skills: Skill[];
	level: number;
	openPath: string[];
	onToggle: (skill: Skill, level: number) => void;
	containerRef?: HTMLDivElement;
}

function SkillLevel(props: SkillLevelProps): JSX.Element {
	const [rowEnds, setRowEnds] = createSignal<number[]>([]);

	const updateRowEnds = () => {
		if (isServer) return;
		const container = props.containerRef;
		if (!container) return;

		const items = container.querySelectorAll(`[data-level="${props.level}"]`);
		if (items.length === 0) return;

		const ends: number[] = [];
		let currentOffsetTop = (items[0] as HTMLElement).offsetTop;

		for (let i = 0; i < items.length; i++) {
			const item = items[i] as HTMLElement;
			if (item.offsetTop !== currentOffsetTop) {
				ends.push(i - 1);
				currentOffsetTop = item.offsetTop;
			}
		}
		ends.push(items.length - 1);
		setRowEnds(ends);
	};

	onMount(() => {
		updateRowEnds();
		window.addEventListener("resize", updateRowEnds);
	});

	onCleanup(() => {
		if (!isServer) {
			window.removeEventListener("resize", updateRowEnds);
		}
	});

	const rows = createMemo<Skill[][]>(() => {
		const result: Skill[][] = [];
		let start = 0;
		const ends = rowEnds();
		if (ends.length === 0) return [props.skills];
		for (const end of ends) {
			result.push(props.skills.slice(start, end + 1));
			start = end + 1;
		}
		return result;
	});

	return (
		<For each={rows()}>
			{(rowSkills: Skill[]) => {
				const activeSkillInRow = createMemo<Skill | undefined>(() =>
					rowSkills.find((s: Skill) => s.name === props.openPath[props.level])
				);

				return (
					<>
						<div class="flex flex-wrap justify-center gap-10 md:gap-14 text-slate-700 dark:text-slate-300">
							<For each={rowSkills}>
								{(skill: Skill) => (
									<button
										class="group relative focus:outline-none cursor-pointer"
										title={skill.name}
										data-level={props.level}
										onClick={() => props.onToggle(skill, props.level)}
									>
										<div
											class="w-14 h-14 md:w-16 md:h-16 transition-all duration-300 ease-out"
											classList={{
												"fill-primary-500 scale-110": props.openPath[props.level] === skill.name,
												"fill-slate-400 group-hover:fill-primary-500 group-hover:scale-110": props.openPath[props.level] !== skill.name
											}}
										>
											<DynamicIcon iconName={skill.icon} />
										</div>
										<span class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none">
											{skill.name}
										</span>
									</button>
								)}
							</For>
						</div>

						<Show when={activeSkillInRow()}>
							{(activeSkill: Accessor<Skill>) => (
								<div
									class="w-full overflow-hidden transition-all duration-500 ease-in-out"
									style={{
										"max-height": activeSkill().children ? "1000px" : "0px",
										opacity: activeSkill().children ? "1" : "0",
									}}
								>
									<Show when={activeSkill().children}>
										{(children: Accessor<Skill[]>) => (
											<div class="py-10 my-4 rounded-2xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-sm">
												<SkillLevel
													skills={children()}
													level={props.level + 1}
													openPath={props.openPath}
													onToggle={props.onToggle}
													containerRef={props.containerRef}
												/>
											</div>
										)}
									</Show>
								</div>
							)}
						</Show>
					</>
				);
			}}
		</For>
	);
}

function DynamicIcon(props: { iconName: string }): JSX.Element {
	const Icon = () => skillIcons[props.iconName];
	return (
		<Show when={Icon()}>
			{(I: Accessor<(props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element>) => {
				const Component = I();
				return <Component class="w-full h-full" />;
			}}
		</Show>
	);
}
