import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
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
                RdxPaginationEllipsisDirective
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

                        .pagination-list {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }

                        .pagination-item {
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            padding: 8px 16px;/
                        }

                        .pagination-item[data-selected] {
                            background-color: var(--violet-6);
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
        template: html`
            <div rdxPaginationRoot total="34" siblingCount="1" itemsPerPage="10">
                <div class="pagination-list" rdxPaginationList #list="rdxPaginationList">
                    <button rdxPaginationFirst>First page</button>
                    <button rdxPaginationPrev>Prev page</button>

                    @for (item of list.transformedRange(); track item) {
                    <button class="pagination-item" rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
                    }

                    <button rdxPaginationNext>Next Page</button>
                    <button rdxPaginationLast>Last Page</button>
                </div>
            </div>
        `
    })
};

export const WithEllipsis: Story = {
    render: () => ({
        template: `
            <div rdxPaginationRoot total="100" siblingCount="1" defaultPage="2" showEdges itemsPerPage="10">
                <div class="pagination-list" rdxPaginationList #list="rdxPaginationList">
                    <button rdxPaginationFirst>First page</button>
                    <button rdxPaginationPrev>Prev page</button>

                    @for (item of list.transformedRange(); track item) {
                        @if (item.type == 'page') {
                            <button class="pagination-item" rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
                        } @else {
                            <div rdxPaginationEllipsis>&#8230;</div>
                        }
                    }

                    <button rdxPaginationNext>Next Page</button>
                    <button rdxPaginationLast>Last Page</button>
                </div>
            </div>
        `
    })
};
