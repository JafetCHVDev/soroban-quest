import { build } from 'vite';

process.env.ANALYZE = 'true';
await build();
