import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPaginationEllipsisDirective } from '../src/pagination-ellipsis.directive';
import { RdxPaginationFirstDirective } from '../src/pagination-first.directive';
import { RdxPaginationLastDirective } from '../src/pagination-last.directive';
import { RdxPaginationListDirective } from '../src/pagination-list.directive';
import { RdxPaginationListItemDirective } from '../src/pagination-list-item.directive';
import { RdxPaginationNextDirective } from '../src/pagination-next.directive';
import { RdxPaginationPrevDirective } from '../src/pagination-prev.directive';
import { RdxPaginationRootDirective } from '../src/pagination-root.directive';
import { LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

export default {
    title: 'Primitives/Pagination',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPaginationRootDirective,
                RdxPaginationListDirective,
                RdxPaginationFirstDirective,
                RdxPaginationPrevDirective,
                RdxPaginationLastDirective,
                RdxPaginationNextDirective,
                RdxPaginationListItemDirective,
                RdxPaginationEllipsisDirective,
                LucideChevronsLeft,
                LucideChevronLeft,
                LucideChevronRight,
                LucideChevronsRight
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
            <div rdxPaginationRoot total="34" siblingCount="1" itemsPerPage="10">
                <div class="text-foreground flex items-center gap-1" rdxPaginationList #list="rdxPaginationList">
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationFirst
                    >
                        <svg lucideChevronsLeft size="16" strokeWidth="2" />
                    </button>
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring mr-4 flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationPrev
                    >
                        <svg lucideChevronLeft size="16" strokeWidth="2" />
                    </button>

                    @for (item of list.transformedRange(); track item) {
                        <button
                            class="bg-background text-foreground border-border hover:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                            rdxPaginationListItem
                            [value]="item.value"
                        >
                            {{ item.value }}
                        </button>
                    }

                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring ml-4 flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationNext
                    >
                        <svg lucideChevronRight size="16" strokeWidth="2" />
                    </button>
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationLast
                    >
                        <svg lucideChevronsRight size="16" strokeWidth="2" />
                    </button>
                </div>
            </div>
        `
    })
};

export const WithEllipsis: Story = {
    render: () => ({
        template: `
            <div rdxPaginationRoot total="100" siblingCount="1" defaultPage="2" showEdges itemsPerPage="10">
                <div class="text-foreground flex items-center gap-1" rdxPaginationList #list="rdxPaginationList">
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationFirst
                    >
                        <svg lucideChevronsLeft size="16" strokeWidth="2" />
                    </button>
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring mr-4 flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationPrev
                    >
                        <svg lucideChevronLeft size="16" strokeWidth="2" />
                    </button>

                    @for (item of list.transformedRange(); track item) {
                        @if (item.type == 'page') {
                            <button
                                class="bg-background text-foreground border-border hover:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                                rdxPaginationListItem
                                [value]="item.value"
                            >
                                {{ item.value }}
                            </button>
                        } @else {
                            <div class="text-muted-foreground flex size-9 items-center justify-center" rdxPaginationEllipsis>&#8230;</div>
                        }
                    }

                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring ml-4 flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationNext
                    >
                        <svg lucideChevronRight size="16" strokeWidth="2" />
                    </button>
                    <button
                        class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
                        rdxPaginationLast
                    >
                        <svg lucideChevronsRight size="16" strokeWidth="2" />
                    </button>
                </div>
            </div>
        `
    })
};
