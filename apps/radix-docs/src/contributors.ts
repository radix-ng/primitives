import contributorNames from './contributor-names.json';

export type Contributor = {
    name: string;
    avatar: string;
};

const contributorsAvatars: Record<string, string> = {};

function getAvatarUrl(name: string) {
    return `https://github.com/${name}.png`;
}

export const contributors = (contributorNames as string[]).reduce((acc, name) => {
    contributorsAvatars[name] = getAvatarUrl(name);
    acc.push({ name, avatar: contributorsAvatars[name] });
    return acc;
}, [] as Contributor[]);
