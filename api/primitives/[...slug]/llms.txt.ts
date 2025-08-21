import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const slugParam = req.query.slug;
    const segments = Array.isArray(slugParam) ? slugParam : [slugParam as string];
    const last = segments[segments.length - 1];
    const file = path.join(process.cwd(), 'src', 'content', 'primitives', `${last}.md`);

    try {
        const raw = await fs.readFile(file, 'utf-8');
        const { data, content } = matter(raw);
        const txt = `# ${data.title}\n\n${content}`;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(txt);
    } catch {
        res.status(404).send('Not Found');
    }
}
