export const index_html = (componentName: string, componentSelector: string) => `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>RadixNG ${componentName}</title>
        <base href="/">

        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body class="light-theme">
        <${componentSelector}></${componentSelector}>
    </body>
</html>`;
