/** Where the sister game lives. Set NEXT_PUBLIC_ENGINEERLE_URL at build time to point somewhere else (for example a preview). */
export const ENGINEERLE_URL = (process.env.NEXT_PUBLIC_ENGINEERLE_URL || 'https://engineerle.io').replace(/\/+$/, '');
