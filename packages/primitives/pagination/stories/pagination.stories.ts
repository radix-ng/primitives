import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LucideAngularModule } from 'lucide-angular';
import { RdxPaginationEllipsisDirective } from '../src/pagination-ellipsis.directive';
import { RdxPaginationFirstDirective } from '../src/pagination-first.directive';
import { RdxPaginationLastDirective } from '../src/pagination-last.directive';
import { RdxPaginationListItemDirective } from '../src/pagination-list-item.directive';
import { RdxPaginationListDirective } from '../src/pagination-list.directive';
import { RdxPaginationNextDirective } from '../src/pagination-next.directive';
import { RdxPaginationPrevDirective } from '../src/pagination-prev.directive';
import { RdxPaginationRootDirective } from '../src/pagination-root.directive';

const html = String.raw;

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
                LucideAngularModule,
                LucideAngularModule.pick({ ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft })
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        button {
                            all: unset;
                        }

                        .Button {
                            text-align: center;
                            font-size: 15px;
                            line-height: 1;
                            align-items: center;
                            justify-content: center;
                            height: 2.25rem;
                            width: 2.25rem;
                            border-radius: 0.25rem;
                            transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
                            cursor: pointer;
                        }

                        .Button:disabled {
                            opacity: 0.5;
                        }

                        .Button:hover {
                            background-color: rgb(255 255 255 / 0.1);
                        }

                        .Button[data-selected] {
                            background-color: rgb(255 255 255);
                            color: var(--black-a11);
                        }

                        .PaginationList {
                            display: flex;
                            align-items: center;
                            gap: 0.25rem;
                            color: rgb(255 255 255);
                        }

                        .PaginationEllipsis {
                            display: flex;
                            height: 2.25rem;
                            width: 2.25rem;
                            align-items: center;
                            justify-content: center;
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
            <div rdxPaginationRoot total="34" siblingCount="1" itemsPerPage="10">
                <div class="PaginationList" rdxPaginationList #list="rdxPaginationList">
                    <button class="Button" rdxPaginationFirst>
                        <lucide-icon name="chevrons-left" size="16" strokeWidth="2" />
                    </button>
                    <button class="Button" rdxPaginationPrev style="margin-right: 16px;">
                        <lucide-icon name="chevron-left" size="16" strokeWidth="2" />
                    </button>

                    @for (item of list.transformedRange(); track item) {
                        <button class="Button" rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
                    }

                    <button class="Button" rdxPaginationNext style="margin-left: 16px;">
                        <lucide-icon name="chevron-right" size="16" strokeWidth="2" />
                    </button>
                    <button class="Button" rdxPaginationLast>
                        <lucide-icon name="chevrons-right" size="16" strokeWidth="2" />
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
                <div class="PaginationList" rdxPaginationList #list="rdxPaginationList">
                    <button class="Button" rdxPaginationFirst>
                        <lucide-icon name="chevrons-left" size="16" strokeWidth="2" />
                    </button>
                    <button class="Button" rdxPaginationPrev style="margin-right: 16px;">
                        <lucide-icon name="chevron-left" size="16" strokeWidth="2" />
                    </button>

                    @for (item of list.transformedRange(); track item) {
                        @if (item.type == 'page') {
                            <button class="Button" rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
                        } @else {
                            <div class="PaginationEllipsis" rdxPaginationEllipsis>&#8230;</div>
                        }
                    }

                    <button class="Button" rdxPaginationNext style="margin-left: 16px;">
                        <lucide-icon name="chevron-right" size="16" strokeWidth="2" />
                    </button>
                    <button class="Button" rdxPaginationLast>
                        <lucide-icon name="chevrons-right" size="16" strokeWidth="2" />
                    </button>
                </div>
            </div>
        `
    })
};
