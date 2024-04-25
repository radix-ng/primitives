---
title: Switching to Analog SFC
slug: switching-to-analog-sfc
otherSlug: analog-sfc
description: Changing my blog to fully embrace the new Analog SFC authoring format with a little tanstack in there.
author: Me
coverImage: v1712246484/angular-sfc.png
date: 04-04-2024
---

## 📚Embracing Analog SFC

**Making the Switch:**  
After some initial doubts—like the lack of syntax support in VSCode, which I overcame by switching to WebStorm (shoutout to their team for the awesome Analog plugin)—I decided it was time to make a big change. With Brandon Roberts releasing the 1.0 version of Analog, it felt right to fully embrace Analog SFC for my blog. As a core contributor to Analog, I felt a kind of responsibility to walk the talk. If I'm helping to build it, I should be using it, right?

## 🧰 What is Analog SFC?

Analog SFC introduces a simpler way to build Angular components using a single file format, marked by the `.analog` extension. It's designed to make component authoring more straightforward by bringing together the template, script, and styles into one place. Here's what sets it apart:

- **Colocation**: Templates, scripts, and styles live together, making components easier to manage.
- **Simplified Syntax**: It doesn't use Angular decorators, aiming for cleaner code.
- **Performance Optimizations**: Defaults to efficient settings like `OnPush` change detection, steering clear of certain lifecycle hooks for better performance.

### Getting Started

To dive into Analog SFC, you'll need specific tooling, such as the Analog plugin for Vite or Astro. Here’s a quick setup using Vite:

```typescript
import { defineConfig } from 'vite';
import analog from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    analog({
      experimental: { supportAnalogFormat: true },
    }),
  ],
});
```

## IDE Support

IDE support is crucial for a smooth developer experience. For instance, WebStorm and IDEA Ultimate have support for Analog SFC with a plugin for syntax highlighting and more. VSCode support is on the horizon, promising wider accessibility.

## Example: Building a Simple Counter

The Analog SFC format shines in its simplicity and efficiency. Here's a peek at how a counter component looks in this new format:

```html

<script lang="ts">
  import { signal } from '@angular/core';

  const count = signal(0);

  function add() {
    count.set(count() + 1);
  }
</script>

<template>
  <div class="container">
    <button (click)="add()">{{ count() }}</button>
  </div>
</template>

<style>
  .container {
    display: flex;
    justify-content: center;
  }

  button {
    font-size: 2rem;
    padding: 1rem 2rem;
  }
</style>
```

This example encapsulates the essence of Analog SFC — concise, cohesive, and performant component design.

> While Analog SFCs offer a streamlined approach to component development, it's essential to remember that this is an experimental, community-driven initiative. As such, it invites Angular developers to explore and contribute, expanding the possibilities within the Angular ecosystem.

## 🔍 My Experience with Analog SFC

Transitioning to Analog SFC showed me a new way (a really cool one ot be honest) on component design and development. Some minor changes were needed, we will talk about those in a little, but i was surprised that everything simply worked as before.

some examples on the changes can be illustrated here:

### This is how a component looked before:

```ts
import { Component, Input } from '@angular/core';
import { ContentFile } from '@analogjs/content';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { DateTime } from 'luxon';
import { PostAttributes } from '../models/post.model';
import { RouterLinkWithHref } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'mr-cover',
  standalone: true,
  imports: [NgOptimizedImage, RouterLinkWithHref, DatePipe, TranslocoDirective],
  host: {
    class: 'p-0',
  },
  template: ` <ng-container *transloco="let t; read: 'blog'">
    @if (isNew(post.attributes.date)) {
      <div
        class="bg-primary absolute z-50 flex h-10 w-20 animate-bounce items-center justify-center rounded-lg font-bold">
        {{ t('new') }}
      </div>
    }
    <div class="card bg-base-100 relative h-[490px] shadow-xl lg:w-96">
      <figure class="flex-none">
        <img
          class="w-full"
          [ngSrc]="post.attributes.coverImage"
          width="500"
          height="210"
          alt="{{ t('alt') }}" />
      </figure>
      <div class="card-body p-4">
        <h2 class="card-title basis-2/6">{{ post.attributes.title }}</h2>
        <p>{{ post.attributes.description }}</p>
        <div class="card-actions jus items-center justify-between">
          <div class="badge badge-outline">
            {{ post.attributes.date | date }}
          </div>
          <button [routerLink]="post.attributes.slug" class="btn btn-primary">
            {{ t('read') }}
          </button>
        </div>
      </div>
    </div></ng-container
  >`,
})
export class BlogCoverComponent {
  @Input({ required: true }) post!: ContentFile<PostAttributes>;

  //method that returns true if the date is >= today - 7 days using luxon
  isNew(date: string) {
    const today = DateTime.now();
    const sevenDaysAgo = today.minus({ days: 7 });
    const postDate = DateTime.fromISO(date);
    return postDate >= sevenDaysAgo;
  }
}
```

### This is how it looks now:

```html

<script lang="ts">
  import { input } from '@angular/core';
  import { ContentFile } from '@analogjs/content';
  import { DatePipe, NgOptimizedImage } from '@angular/common';
  import { DateTime } from 'luxon';
  import { PostAttributes } from '../models/post.model';
  import { RouterLink } from '@angular/router';
  import { TranslocoDirective } from '@ngneat/transloco';

  defineMetadata({
    imports: [NgOptimizedImage, RouterLink, DatePipe, TranslocoDirective],
    host: {
      class: 'p-0',
    },
  });

  const post = input.required < ContentFile < PostAttributes >> ();

  //method that returns true if the date is >= today - 7 days using luxon
  function isNew(date: string) {
    const today = DateTime.now();
    const sevenDaysAgo = today.minus({ days: 7 });
    const postDate = DateTime.fromISO(date);
    return postDate >= sevenDaysAgo;
  }
</script>

<template>
  <ng-container *transloco="let t; read: 'blog'">
    @if (isNew(post().attributes.date)) {
    <div
      class="bg-primary absolute z-50 flex h-10 w-20 animate-bounce items-center justify-center rounded-lg font-bold">
      {{ t('new') }}
    </div>
    }
    <div class="card bg-base-100 relative h-[490px] shadow-xl lg:w-96">
      <figure class="flex-none">
        <img
          class="w-full"
          [ngSrc]="post().attributes.coverImage"
          width="500"
          height="210"
          alt="{{ t('alt') }}" />
      </figure>
      <div class="card-body p-4">
        <h2 class="card-title basis-2/6">{{ post().attributes.title }}</h2>
        <p>{{ post().attributes.description }}</p>
        <div class="card-actions jus items-center justify-between">
          <div class="badge badge-outline">
            {{ post().attributes.date | date }}
          </div>
          <button [routerLink]="post().attributes.slug" class="btn btn-primary">
            {{ t('read') }}
          </button>
        </div>
      </div>
    </div>
  </ng-container>
</template>
```

But first thing first I'm using Tailwind so i needed my analog files to be recognized by the process so the first step was to add the extension to the tailwind.config.cjs

```js
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html,analog}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['dark', 'bumblebee'],
  },
};
```

And as mentioned before to change my vite.config to allow me the usage of .analog files 😁

After those minimal steps i simply started with the non-complicated components, everything in there was pretty much straightforward, no pain points at all, a simple example will be my dashboard:

### Before:

```ts
import { Component } from '@angular/core';
import { FooterComponent } from './footer.component';
import { NavbarComponent } from './navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'mr-dashboard',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  host: {
    class: 'flex min-h-[100dvh] flex-col',
  },
  template: `
    <main class="z-10 flex w-full flex-auto flex-col pt-6">
      <mr-navbar />
      <div class="relative flex flex-auto">
        <router-outlet></router-outlet>
        <!-- Animated circles container -->
        <div class="circle-container fixed">
          <ul class="circles">
            @for(number of numbers; track $index){
            <li></li>
            }
          </ul>
        </div>
      </div>
      <mr-footer />
    </main>
  `,
})
export class DashboardComponent {
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}
```

### After:

```html

<script lang="ts">
  import { RouterOutlet } from '@angular/router';
  import BlogFooter from './blog-footer.analog' with { analog: 'imports' };
  import BlogNavbar from './blog-navbar.analog' with { analog: 'imports' };

  defineMetadata({
    imports: [RouterOutlet],
    host: {
      class: 'flex min-h-[100dvh] flex-col',
    },
  });

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
</script>

<template>
  <main class="z-10 flex w-full flex-auto flex-col pt-6">
    <BlogNavbar />
    <div class="relative flex flex-auto">
      <router-outlet />
      <!-- Animated circles container -->
      <div class="circle-container fixed">
        <ul class="circles">
          @for (number of numbers; track $index) {
          <li></li>
          }
        </ul>
      </div>
    </div>
    <BlogFooter />
  </main>
</template>
```

A couple of things to mention here: You might have noticed that the Footer and Navbar are imported but not included in the **imports** array. Speaking of imports, did you notice the absence of decorators? So, where do you place your imports or providers? The answer is **defineMetadata**. Consider it a direct replacement for the **@Component** decorator. Pretty cool, right?

### 🥹 Tackling More Complex Examples

After completing most of the UI-only components, it was time to tackle those with a bit more logic. Generally speaking, even my smaller components involve some logic since I use **transloco** for managing translations, which is a common element throughout the app.

Let's dive into one of those examples. Please, don't judge my code too harshly—I'm still getting the hang of using signals. I might not always use them in the best ways, but hey, it works, haha. I’m open to any advice you might have.

### Before:

```ts
import { Component, inject, Renderer2 } from '@angular/core';
import { fromEvent, map, startWith } from 'rxjs';
import { NgClass } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { TranslocoDirective, TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'mr-theme-button',
  standalone: true,
  imports: [SvgIconComponent, NgClass, TranslocoDirective],
  template: `<ng-container *transloco="let t; read: 'navigation'">
    <button
      class="btn btn-square btn-ghost relative h-[46px]  w-10 overflow-hidden md:w-16"
      [attr.aria-label]="t('aria-label')"
      (click)="changeTheme()">
      <svg-icon
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        [ngClass]="{
          'translate-y-[20%] rotate-[50deg] opacity-0 transition-all':
            isDarkMode,
          'opacity-[1] transition-all duration-1000 ease-out': !isDarkMode
        }"
        key="dark-mode"
        fontSize="30px"
        height="30px" />
      <svg-icon
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        [ngClass]="{
          'opacity-[1] transition-all duration-1000 ease-out': isDarkMode,
          'translate-y-[20%] rotate-[100deg] opacity-0 transition-all':
            !isDarkMode
        }"
        key="light"
        fontSize="30px"
        height="30px" />
    </button>
  </ng-container> `,
})
export class ThemeButtonComponent {
  #renderer = inject(Renderer2);
  isDarkMode = false;

  constructor() {
    //be sure you're running inside a browser
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      //check the system theme
      const darkThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      //listen for changes
      fromEvent<MediaQueryList>(darkThemeQuery, 'change')
        .pipe(
          startWith(darkThemeQuery),
          map((list: MediaQueryList) => list.matches)
        )
        .subscribe(isDarkMode => {
          this.changeTheme(isDarkMode);
        });

      // Set the initial theme based on the system preference
      this.changeTheme(darkThemeQuery.matches);
    }
  }

  changeTheme(theme?: boolean) {
    const body = this.#renderer.selectRootElement('body', true) as HTMLElement;

    if (typeof theme === 'undefined') {
      // Toggle the theme if no argument is provided
      theme = body.getAttribute('data-theme') !== 'dark';
    }

    if (theme) {
      body.setAttribute('data-theme', 'dark');
      this.isDarkMode = true;
    } else {
      body.setAttribute('data-theme', 'bumblebee');
      this.isDarkMode = false;
    }
  }
}
```

### After

```html

<script lang="ts">
  import { afterNextRender, inject, Renderer2 } from '@angular/core';
  import { fromEvent, map, startWith } from 'rxjs';
  import { SvgIconComponent } from '@ngneat/svg-icon';
  import { NgClass } from '@angular/common';
  import { TranslocoDirective } from '@ngneat/transloco';

  defineMetadata({ imports: [SvgIconComponent, NgClass, TranslocoDirective] });

  const renderer = inject(Renderer2);
  let isDarkMode = false;

  afterNextRender(() => {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      //check the system theme
      const darkThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      //listen for changes
      fromEvent < MediaQueryList > (darkThemeQuery, 'change')
        .pipe(
          startWith(darkThemeQuery),
          map((list: MediaQueryList) => list.matches),
        )
        .subscribe(isDarkMode => {
          changeTheme(isDarkMode);
        });

      // Set the initial theme based on the system preference
      changeTheme(darkThemeQuery.matches);
    }
  });

  function changeTheme(theme

    ? : boolean
  )
  {
    const body = renderer.selectRootElement('body', true)
    as
    HTMLElement;

    if (typeof theme === 'undefined') {
      // Toggle the theme if no argument is provided
      theme = body.getAttribute('data-theme') !== 'dark';
    }

    if (theme) {
      body.setAttribute('data-theme', 'dark');
      isDarkMode = true;
    } else {
      body.setAttribute('data-theme', 'bumblebee');
      isDarkMode = false;
    }
  }
</script>

<template>
  <ng-container *transloco="let t; read: 'navigation'">
    <button
      class="btn btn-square btn-ghost relative h-[46px]  w-10 overflow-hidden md:w-16"
      [attr.aria-label]="t('aria-label')"
      (click)="changeTheme()">
      <svg-icon
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        [ngClass]="{
          'translate-y-[20%] rotate-[50deg] opacity-0 transition-all':
            isDarkMode,
          'opacity-[1] transition-all duration-1000 ease-out': !isDarkMode
        }"
        key="dark-mode"
        fontSize="30px"
        height="30px" />
      <svg-icon
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        [ngClass]="{
          'opacity-[1] transition-all duration-1000 ease-out': isDarkMode,
          'translate-y-[20%] rotate-[100deg] opacity-0 transition-all':
            !isDarkMode
        }"
        key="light"
        fontSize="30px"
        height="30px" />
    </button>
  </ng-container>
</template>
```

In this example, you'll begin to notice some significant departures from traditional **Angular** authoring. First off, it's not a class, so there's no use of **this**. Additionally, you'll see more frequent use of **const** and **let**, and lifecycle hooks are employed with callbacks. Beyond these differences, everything works seamlessly.

## 🏖️ TanStack Time

After some major refactoring, I reached a good point where everything was functioning as expected. That is, until I encountered Forms. Honestly, what you're about to read wasn't really an issue; rather, it provided a solid justification to switch paradigms and served as an excellent excuse to experiment with the recently released **TanStack Forms**. In my project, I have a simple contact form that lets people send me short messages via email. Interestingly, Tanner Linsley himself (the creator of TanStack) sent me one, haha. My current approach uses Angular Reactive Forms with some getters to access the controls more easily. However, getters don't have a straightforward path in Analog SFC, which made this an ideal opportunity to try something new, leading me to adopt **TanStack Forms**. For more details, check out [TanStack Forms documentation](https://tanstack.com/form/latest/docs/overview).

### This was the previous approach:

```ts
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'mr-contact',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective],
  host: { class: 'w-full' },
  template: `<ng-container *transloco="let t; read: 'contact'">
    <div class="flex flex-auto flex-col items-center gap-3 pt-20">
      <div
        class="flex w-full flex-col justify-start gap-4 align-baseline md:max-w-md">
        <h1
          class=" before:bg-primary after:bg-primary relative mb-5 w-fit text-3xl font-bold
                before:absolute before:left-[98%] before:top-[70%] before:-z-10 before:h-5
                before:w-5 before:translate-y-0 before:transition-all before:duration-500 after:absolute
                after:left-[-15px] after:top-[70%] after:-z-10 after:h-5 after:w-5 after:translate-y-0 after:transition-all
                after:duration-500 hover:before:translate-y-[-20px] hover:after:translate-y-[-20px] md:text-5xl">
          {{ t('header') }}
        </h1>
        <p class=" text-lg font-bold">
          {{ t('subheader') }}
        </p>
      </div>
      <form
        [formGroup]="contactForm"
        (ngSubmit)="submitForm()"
        class="form-control flex w-full flex-col items-center gap-3 md:max-w-md">
        <div class="w-full">
          <label class="label">
            <span class="label-text font-extrabold">{{ t('name') }}</span>
          </label>
          <input
            type="text"
            placeholder="{{ t('type-here') }}"
            formControlName="name"
            type="text"
            class="input input-bordered w-full" />
          @if (name?.errors && name?.touched) {
            <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                t('name-error')
              }}</span>
            </label>
          }
        </div>
        <div class="w-full">
          <label class="label">
            <span class="label-text font-extrabold">{{ t('email') }}</span>
          </label>
          <input
            type="text"
            placeholder="{{ t('email-placeholder') }}"
            formControlName="email"
            type="email"
            class="input input-bordered w-full" />
          @if (email?.errors && email?.touched) {
            <label class="label">
              @if (email?.errors?.['required']) {
                <span class="label-text-alt text-error font-bold">{{
                  t('email-error-one')
                }}</span>
              }
              @if (email?.errors?.['email']) {
                <span class="label-text-alt text-error font-bold">{{
                  t('email-error-two')
                }}</span>
              }
            </label>
          }
        </div>
        <div class="w-full">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-extrabold">{{ t('message') }}</span>
            </label>
            <textarea
              class="textarea textarea-bordered h-24 text-base"
              formControlName="message"
              placeholder="{{ t('say-hi') }}"></textarea>
            @if (message?.errors && message?.touched) {
              <label class="label">
                <span class="label-text-alt text-error font-bold">{{
                  t('message-error')
                }}</span>
              </label>
            }
          </div>
        </div>
        <div class="mt-2 flex w-full justify-center gap-4">
          <button
            class="btn btn-outline btn-info relative w-1/3"
            [disabled]="contactForm.invalid"
            [class.spinner-loading]="loading()"
            type="submit">
            {{ t('send') }}
          </button>
          <button
            class="btn btn-outline btn-secondary w-1/3"
            type="reset"
            (click)="contactForm.reset()">
            {{ t('clear') }}
          </button>
        </div>
      </form>
    </div></ng-container
  > `,
})
export class ContactFormComponent {
  #http = inject(HttpClient);
  #toast = inject(HotToastService);
  loading = signal(false);
  readonly #environment = environment;
  contactForm = inject(FormBuilder).group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    },
    { updateOn: 'blur' }
  );

  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get message() {
    return this.contactForm.get('message');
  }

  submitForm() {
    this.loading.set(true);
    this.contactForm.disable();
    const { name, email, message } = this.contactForm.value;
    this.#http
      .post(`${this.#environment.apiUrl}/send-email`, {
        name,
        email,
        message,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.#toast.success('Email sent successfully', {
            duration: 3500,
            position: 'bottom-center',
          });
          this.contactForm.enable();
          this.contactForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.#toast.error(
            `Error ${error.status} sending email: ${error.statusText}`,
            {
              duration: 3500,
              position: 'bottom-center',
            }
          );
          this.contactForm.enable();
        },
      });
  }
}
```

### And this is how it is now with TanStack Forms

```html
<!--suppress ALL -->
<script lang="ts">
  import { inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { HotToastService } from '@ngneat/hot-toast';
  import { ReactiveFormsModule } from '@angular/forms';
  import { TranslocoDirective } from '@ngneat/transloco';
  import { FieldValidateFn, injectForm, injectStore, TanStackField } from '@tanstack/angular-form';
  import { environment } from '../../environments/environment';

  defineMetadata({
    imports: [ReactiveFormsModule, TranslocoDirective, TanStackField],
    host: { class: 'w-full' },
  });

  const http = inject(HttpClient);
  const toast = inject(HotToastService);
  const contactForm = injectForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
    onSubmit({ value }) {
      const { email, name, message } = value;
      http
        .post(`${environment.apiUrl}/send-email`, {
          name,
          email,
          message,
        })
        .subscribe({
          next: () => {
            toast.success('Email sent successfully', {
              duration: 3500,
              position: 'bottom-center',
            });
            contactForm.reset();
          },
          error: (error: HttpErrorResponse) => {
            toast.error(
              `Error ${error.status} sending email: ${error.statusText}`,
              {
                duration: 3500,
                position: 'bottom-center',
              },
            );
          },
        });
    },
  });

  const nameValidator: FieldValidateFn<any, any, any, any, string> = ({
                                                                        value,
                                                                      }) =>
    !value
      ? 'A name is required'
      : undefined;

  const emailValidator: FieldValidateFn<any, any, any, any, string> = ({
                                                                         value,
                                                                       }) =>
    !value ?
      'An email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : undefined

  ;

  const messageValidator: FieldValidateFn<any, any, any, any, string> = ({
                                                                           value,
                                                                         }) =>
    !value
      ? 'A message is required'
      : undefined;

  const canSubmit = injectStore(contactForm, (state) => state.canSubmit);
  const isSubmitting = injectStore(contactForm, (state) => state.isSubmitting);

  function submitForm(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    void contactForm.handleSubmit();
  }
</script>

<template>
  <ng-container *transloco="let t; read: 'contact'">
    <div class="flex flex-auto flex-col items-center gap-3 pt-20">
      <div
        class="flex w-full flex-col justify-start gap-4 align-baseline md:max-w-md">
        <h1
          class=" before:bg-primary after:bg-primary relative mb-5 w-fit text-3xl font-bold
                before:absolute before:left-[98%] before:top-[70%] before:-z-10 before:h-5
                before:w-5 before:translate-y-0 before:transition-all before:duration-500 after:absolute
                after:left-[-15px] after:top-[70%] after:-z-10 after:h-5 after:w-5 after:translate-y-0 after:transition-all
                after:duration-500 hover:before:translate-y-[-20px] hover:after:translate-y-[-20px] md:text-5xl">
          {{ t('header') }}
        </h1>
        <p class=" text-lg font-bold">
          {{ t('subheader') }}
        </p>
      </div>
      <form
        (submit)="submitForm($event)"
        class="form-control flex w-full flex-col items-center gap-3 md:max-w-md">
        <div class="w-full">
          <div class="form-control">
            <ng-container
              #name="field"
              [tanstackField]="contactForm"
              [validators]="{ onBlur:nameValidator }"
              name="name"
            >
              <label [for]="name.api.name" class="label">
                <span class="label-text font-extrabold">{{ t('name') }}</span>
              </label>
              <input
                (blur)="name.api.handleBlur()"
                (input)="name.api.handleChange($any($event).target.value)"
                [id]="name.api.name"
                [name]="name.api.name"
                [value]="name.api.state.value"
                class="input input-bordered w-full"
                placeholder="{{ t('type-here') }}"
                type="text"
              />
              @if (name.api.state.meta.touchedErrors.length > 0) {
              <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                  t('name-error')
                }}</span>
              </label>
              }
            </ng-container>
          </div>
        </div>
        <div class="w-full">
          <div class="form-control">
            <ng-container
              #email="field"
              [tanstackField]="contactForm"
              [validators]="{onBlur:emailValidator}"
              name="email"
            >
              <label [for]="email.api.name" class="label">
                <span class="label-text font-extrabold">{{ t('email') }}</span>
              </label>
              <input
                (blur)="email.api.handleBlur()"
                (input)="email.api.handleChange($any($event).target.value)"
                [id]="email.api.name"
                [name]="email.api.name"
                [value]="email.api.state.value"
                class="input input-bordered w-full"
                placeholder="{{ t('email-placeholder') }}"
                type="email"
              />
              @if (email.api.state.meta.errors.length > 0) {
              @if (email.api.state.meta.errors[0].includes('required')) {
              <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                  t('email-error-one')
                }}</span>
              </label>
              } @else {
              <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                  t('email-error-two')
                }}</span>
              </label>
              }
              }
            </ng-container>
          </div>
        </div>
        <div class="w-full">
          <div class="form-control">
            <ng-container
              #message="field"
              [tanstackField]="contactForm"
              [validators]="{onBlur:messageValidator}"
              name="message"
            >
              <label [for]="message.api.name" class="label">
                <span class="label-text font-extrabold">{{ t('message') }}</span>
              </label>
              <textarea
                (blur)="message.api.handleBlur()"
                (input)="message.api.handleChange($any($event).target.value)"
                [id]="message.api.name"
                [name]="message.api.name"
                [value]="message.api.state.value"
                class="textarea textarea-bordered h-24 text-base"
                placeholder="{{ t('say-hi') }}"></textarea>
              @if (message.api.state.meta.touchedErrors.length > 0) {
              <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                  t('message-error')
                }}</span>
              </label>
              }
            </ng-container>
          </div>
        </div>
        <div class="mt-2 flex w-full justify-center gap-4">
          <button
            [class.spinner-loading]="isSubmitting()"
            [disabled]="!canSubmit() || isSubmitting()"
            class="btn btn-outline btn-info relative w-1/3"
            type="submit">
            {{ t('send') }}
          </button>
          <button
            (click)="contactForm.reset()"
            class="btn btn-outline btn-secondary w-1/3"
            type="reset">
            {{ t('clear') }}
          </button>
        </div>
      </form>
    </div>
  </ng-container
  >
</template>
```

The first thing you'll notice is that the component has become quite large (I'm aware). Obviously, when using this for the first time, my main goal wasn't optimization but rather a simple 'use it as it is and make it work' approach. Following this, I tweeted about my experience and my thoughts on this approach. [Corbin Crutchley](https://twitter.com/crutchcorn) was kind enough to explain that the idea behind having a lot of stuff in one place is that you're supposed to abstract the code into an actual FormFieldComponent, which will be easier to manage.
<p style="display:flex; flex-direction:column; justify-content:center; align-items:center">
<img src="https://res.cloudinary.com/lhcc0134/image/upload/v1712238617/twitt-tanstack.png" 
        alt="Response from Corbin Crutchley about TansTack Forms approach" />
</p>

The second thing to notice is that everything appears simpler once you grasp the underlying concepts. If you feel the need to dive deeper, I highly recommend reading their documentation. However, I'll do my best to explain what's happening here:

First, you create your form object using the **injectForm**:

```ts
const contactForm = injectForm({
  defaultValues: {
    name: '',
    email: '',
    message: '',
  },
  onSubmit({ value }) {
    const { email, name, message } = value;
    http
      .post(`${environment.apiUrl}/send-email`, {
        name,
        email,
        message,
      })
      .subscribe({
        next: () => {
          toast.success('Email sent successfully', {
            duration: 3500,
            position: 'bottom-center',
          });
          contactForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          toast.error(
            `Error ${error.status} sending email: ${error.statusText}`,
            {
              duration: 3500,
              position: 'bottom-center',
            },
          );
        },
      });
  },
});
```

You might have noticed that I'm adding some functionality in **onSubmit**, which sends the email and handles errors or success scenarios. Here, the key is simplicity; there are no formBuilders or formControls involved. It's quite straightforward — you create the elements of your form and the handler for the submit.

Then, we have three elements that might not be immediately self-explanatory, so let's briefly explain what they're doing:

```ts
const nameValidator: FieldValidateFn<any, any, any, any, string> = ({
                                                                      value,
                                                                    }) =>
  !value
    ? 'A name is required'
    : undefined;
```

These are validation functions. As you can see, we create one and return the results of the validation. They can be either synchronous or asynchronous; in this case, I've opted for synchronous.

And finally, we come to the part where we handle the form submission, and we declare some handy utilities for our UX.

```ts
const canSubmit = injectStore(contactForm, (state) => state.canSubmit);
const isSubmitting = injectStore(contactForm, (state) => state.isSubmitting);

function submitForm(event: SubmitEvent) {
  event.preventDefault();
  event.stopPropagation();
  void contactForm.handleSubmit();
}
```

I believe the names of the variables and functions largely explain their purpose, but let's dive a bit deeper. Here, we declare two constants that are signals, computed from our form state. This is particularly helpful as it assists us in managing the UI state, enabling us to respond appropriately to user events.

And finally the template integration, i'll include only one since the others are pretty much the same:

```html

<form
  (submit)="submitForm($event)">
  <ng-container
    #name="field"
    [tanstackField]="contactForm"
    [validators]="{ onBlur:nameValidator }"
    name="name"
  >
    <label [for]="name.api.name" class="label">
      <span class="label-text font-extrabold">{{ t('name') }}</span>
    </label>
    <input
      (blur)="name.api.handleBlur()"
      (input)="name.api.handleChange($any($event).target.value)"
      [id]="name.api.name"
      [name]="name.api.name"
      [value]="name.api.state.value"
      class="input input-bordered w-full"
      placeholder="{{ t('type-here') }}"
      type="text"
    />
    @if (name.api.state.meta.touchedErrors.length > 0) {
    <label class="label">
              <span class="label-text-alt text-error font-bold">{{
                  t('name-error')
                }}</span>
    </label>
    }
  </ng-container>
</form>
<div class="mt-2 flex w-full justify-center gap-4">
  <button
    [class.spinner-loading]="isSubmitting()"
    [disabled]="!canSubmit() || isSubmitting()"
    class="btn btn-outline btn-info relative w-1/3"
    type="submit">
    {{ t('send') }}
  </button>
  <button
    (click)="contactForm.reset()"
    class="btn btn-outline btn-secondary w-1/3"
    type="reset">
    {{ t('clear') }}
  </button>
</div>
```

In this section, we integrate everything into the template. The **tanstackField** directive works its magic, handling form validation **onBlur**. Additionally, you can observe how the utilities we declared affect the state of our buttons. If the form isn't ready for submission, the button will be disabled, and if the form is in the process of "submitting," the button will display a neat loading animation.

## 🌟 Conclusion: The Path Ahead with Analog

Jumping into the new Analog SFC felt like a breeze, even with a couple of bumps along the way. It's super cool to see how much it's grown, especially now that version 1.0 hit the streets and more folks are jumping in to chip away at it. Being on the core team and helping to bring this vision to life is something I'm really proud of. Plus, Angular 17 is stirring things up with awesome tools like TanStack Query and TanStack Forms making their way to Angular. Honestly, there's no better time to get into Angular and all the neat stuff around it. I'm all in and loving every bit of this ride!

---

If you found this article insightful, don't hesitate to connect with me on [Twitter](https://twitter.com/LuisHCCDev), [Threads](https://www.threads.net/@luishccdev), or [LinkedIn](https://www.linkedin.com/in/luis-castro-cabrera/). Let's embark on this journey of discovery and innovation together! 💻🚀📘

Feeling generous? Show some love and [buy me a coffee](https://www.buymeacoffee.com/luishcastrv). Your support is greatly cherished! ☕️
