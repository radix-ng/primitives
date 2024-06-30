import plugin from 'tailwindcss/plugin';

export const shadcnUI = (): ReturnType<typeof plugin> => {
    return plugin(
        (
            {
                /*empty*/
            }
        ) => {},
        {
            theme: {
                extend: {}
            }
        }
    );
};
