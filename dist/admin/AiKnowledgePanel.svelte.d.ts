import type { ConfirmationCommandRequest } from '../primitives/confirmation-command';
import type { AiKnowledgeBase, AiKnowledgePanelProps } from './knowledge-types';
declare function $$render<KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>>(): {
    props: AiKnowledgePanelProps<KnowledgeId, SourceId, ResourceId, Knowledge>;
    exports: {
        openCreate: () => void;
        /**
             * Delete knowledge base, an act on the selected knowledge base: the host
             * draws it in its command bar, last in the bar's lifecycle order, and
             * opens the pending delete out of the bar (`ConfirmationCommandSurface`).
             * Shown while a knowledge base is selected; held while a write runs, while
             * the editor holds changes, or while a skill uses it (`reason`).
             */ deletion: {
            readonly shown: boolean;
            readonly disabled: boolean;
            readonly reason: string | null;
            readonly request: (ConfirmationCommandRequest & {
                knowledgeId: KnowledgeId;
            }) | null;
            readonly busy: boolean;
            readonly error: string | null;
            open(focusTarget?: HTMLElement | null): void;
            confirm: () => undefined;
            cancel(): void;
        };
    };
    bindings: "editorDirty" | "editorBusy";
    slots: {};
    events: {};
};
declare class __sveltets_Render<KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>> {
    props(): ReturnType<typeof $$render<KnowledgeId, SourceId, ResourceId, Knowledge>>['props'];
    events(): ReturnType<typeof $$render<KnowledgeId, SourceId, ResourceId, Knowledge>>['events'];
    slots(): ReturnType<typeof $$render<KnowledgeId, SourceId, ResourceId, Knowledge>>['slots'];
    bindings(): "editorDirty" | "editorBusy";
    exports(): {
        openCreate: () => void;
        /**
             * Delete knowledge base, an act on the selected knowledge base: the host
             * draws it in its command bar, last in the bar's lifecycle order, and
             * opens the pending delete out of the bar (`ConfirmationCommandSurface`).
             * Shown while a knowledge base is selected; held while a write runs, while
             * the editor holds changes, or while a skill uses it (`reason`).
             */ deletion: {
            readonly shown: boolean;
            readonly disabled: boolean;
            readonly reason: string | null;
            readonly request: (ConfirmationCommandRequest & {
                knowledgeId: KnowledgeId;
            }) | null;
            readonly busy: boolean;
            readonly error: string | null;
            open(focusTarget?: HTMLElement | null): void;
            confirm: () => undefined;
            cancel(): void;
        };
    };
}
interface $$IsomorphicComponent {
    new <KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['props']>, ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['events']>, ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['bindings']>;
    } & ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['exports']>;
    <KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>>(internal: unknown, props: ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['props']> & {}): ReturnType<__sveltets_Render<KnowledgeId, SourceId, ResourceId, Knowledge>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any, any, any, any>['bindings']>;
}
declare const AiKnowledgePanel: $$IsomorphicComponent;
type AiKnowledgePanel<KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>> = InstanceType<typeof AiKnowledgePanel<KnowledgeId, SourceId, ResourceId, Knowledge>>;
export default AiKnowledgePanel;
