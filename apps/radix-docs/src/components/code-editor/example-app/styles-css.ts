export const stylesCss = `
@import '@radix-ui/colors/black-alpha.css';
@import '@radix-ui/colors/mauve.css';
@import '@radix-ui/colors/violet.css';

@import '@angular/cdk/overlay-prebuilt.css';

html,
body {
  height: 100%;
  margin: 10px;
  padding: 0;
}

body {
  background: linear-gradient(to bottom right, #3730a3, #6b21a8, #be185d);
  background-repeat: no-repeat;
  background-attachment: fixed;

  --default-font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';

  --code-font-family: 'JetBrains Mono', 'Menlo', monospace, 'Apple Color Emoji',
    'Segoe UI Emoji';

  font-family: var(--default-font-family);
}`;
