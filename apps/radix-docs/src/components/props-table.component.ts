import { Component } from '@angular/core';

@Component({
    selector: 'props-table',
    standalone: true,
    template: `
        <div class="rt-TableRoot rt-r-size-2 rt-variant-surface rt-Box rt-r-my-5">
            <ng-content></ng-content>
            <table class="rt-TableRootTable">
                <thead class="rt-TableHeader">
                    <tr class="rt-TableRow">
                        <th class="rt-TableCell rt-TableColumnHeaderCell" scope="col" style="width: auto;">Prop</th>
                        <th class="rt-TableCell rt-TableColumnHeaderCell" scope="col">Type</th>
                        <th class="rt-TableCell rt-TableColumnHeaderCell" scope="col">Default</th>
                    </tr>
                </thead>
                <tbody class="rt-TableBody">
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        asChild
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2b:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        boolean
                                    </code>
                                </div>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style="color: var(--gray-8);"
                            >
                                <path
                                    d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            <span
                                style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                            >
                                No default value
                            </span>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        size
                                    </code>
                                </div>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        Responsive&lt;enum&gt;
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2c:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        See full type
                                    </span>
                                </button>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                "3"
                            </code>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        variant
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2d:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        "solid" | "soft"
                                    </code>
                                </div>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                "soft"
                            </code>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        color
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2e:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        enum
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2f:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        See full type
                                    </span>
                                </button>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style="color: var(--gray-8);"
                            >
                                <path
                                    d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            <span
                                style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                            >
                                No default value
                            </span>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        highContrast
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2g:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        boolean
                                    </code>
                                </div>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style="color: var(--gray-8);"
                            >
                                <path
                                    d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            <span
                                style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                            >
                                No default value
                            </span>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        radius
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2h:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        "none" | "small" | "medium" | "large" | "full"
                                    </code>
                                </div>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style="color: var(--gray-8);"
                            >
                                <path
                                    d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            <span
                                style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                            >
                                No default value
                            </span>
                        </td>
                    </tr>
                    <tr class="rt-TableRow" style="white-space: nowrap;">
                        <th class="rt-TableCell rt-TableRowHeaderCell" scope="row">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="">
                                        fallback*
                                    </code>
                                </div>
                                <button
                                    class="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
                                    data-accent-color="gray"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-:r2i:"
                                    data-state="closed"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                                            fill="currentColor"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                    <span
                                        style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                                    >
                                        Prop description
                                    </span>
                                </button>
                            </div>
                        </th>
                        <td class="rt-TableCell">
                            <div class="rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-2">
                                <div class="rt-Box">
                                    <code class="rt-reset rt-Code rt-r-size-2 rt-variant-soft" data-accent-color="gray">
                                        ReactNode
                                    </code>
                                </div>
                            </div>
                        </td>
                        <td class="rt-TableCell">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style="color: var(--gray-8);"
                            >
                                <path
                                    d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            <span
                                style="position: absolute; border: 0px; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"
                            >
                                No default value
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
})
export default class PropsTableComponent {}
