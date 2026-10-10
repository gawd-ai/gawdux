import type { AiSkillsPanelProps } from './skills-types';
declare function $$render<KnowledgeId extends string | number = number>(): {
    props: AiSkillsPanelProps<KnowledgeId>;
    exports: {};
    bindings: "settingsDirty" | "editorBusy";
    slots: {};
    events: {};
};
declare class __sveltets_Render<KnowledgeId extends string | number = number> {
    props(): ReturnType<typeof $$render<KnowledgeId>>['props'];
    events(): ReturnType<typeof $$render<KnowledgeId>>['events'];
    slots(): ReturnType<typeof $$render<KnowledgeId>>['slots'];
    bindings(): "settingsDirty" | "editorBusy";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <KnowledgeId extends string | number = number>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<KnowledgeId>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<KnowledgeId>['props']>, ReturnType<__sveltets_Render<KnowledgeId>['events']>, ReturnType<__sveltets_Render<KnowledgeId>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<KnowledgeId>['bindings']>;
    } & ReturnType<__sveltets_Render<KnowledgeId>['exports']>;
    <KnowledgeId extends string | number = number>(internal: unknown, props: ReturnType<__sveltets_Render<KnowledgeId>['props']> & {}): ReturnType<__sveltets_Render<KnowledgeId>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const AiSkillsPanel: $$IsomorphicComponent;
type AiSkillsPanel<KnowledgeId extends string | number = number> = InstanceType<typeof AiSkillsPanel<KnowledgeId>>;
export default AiSkillsPanel;
